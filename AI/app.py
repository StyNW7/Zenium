from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import json
import time
import tempfile
import traceback
import base64
from datetime import datetime
import cv2
import numpy as np
from io import BytesIO

# Import the Melify RAG components
from model5 import (
    build_or_load_index, 
    generate_reply, 
    detect_risk,
    SYSTEM_PROMPT,
    log_session,
    normalize,
    small_coping_step,
    build_or_load_classifier
)

# Import mood analysis components
from mood_check import FER, log_detection, init_csv_if_needed

app = Flask(__name__)
CORS(app)

# Initialize components
print("Initializing Melify RAG components...")
vectorizer, contexts, responses, tfidf = build_or_load_index()
classifier = build_or_load_classifier(contexts)
print("Melify RAG components initialized successfully!")

# Initialize mood detection
print("Initializing mood detection components...")
mood_detector = FER(mtcnn=True)
init_csv_if_needed()
print("Mood detection components initialized successfully!")

# Global session storage (in production, use a database)
sessions = {}

@app.route('/api/chat', methods=['POST'])
def chat():
    """Endpoint for chatting with the therapist"""
    try:
        data = request.json
        user_id = data.get('user_id', 'default_user')
        message = data.get('message', '')
        session_id = data.get('session_id', f"session_{int(time.time())}")
        
        if not message:
            return jsonify({'error': 'Message is required'}), 400
        
        # Initialize session if it doesn't exist
        if session_id not in sessions:
            sessions[session_id] = {
                'history': [],
                'user_id': user_id,
                'created_at': time.time(),
                'turns': 0
            }
        
        session = sessions[session_id]
        
        # Check for risk
        risk, flags = detect_risk(message)
        if risk:
            response = {
                'response': "I'm very concerned about your safety. If you are in immediate danger, please contact local emergency services now. If you're in the U.S., call 988. Are you in a safe place right now?",
                'risk_detected': True,
                'flags': flags,
                'session_id': session_id
            }
            return jsonify(response)
        
        # Generate reply
        reply = generate_reply(
            message, 
            vectorizer, 
            contexts, 
            responses, 
            tfidf, 
            session['history'], 
            classifier
        )
        
        # Update session
        session['history'].append({'role': 'user', 'content': message})
        session['history'].append({'role': 'assistant', 'content': reply})
        session['turns'] += 1
        
        # Log the session
        log_session('user', message, {'user_id': user_id, 'session_id': session_id})
        log_session('assistant', reply, {'user_id': user_id, 'session_id': session_id})
        
        # Check if we should offer a coping step
        offer_step = False
        if any(k in normalize(message) for k in ["help", "help me", "tolong", "bantu", "i need help"]):
            offer_step = True
        if session['turns'] >= 3:
            offer_step = True
            
        response_data = {
            'response': reply,
            'session_id': session_id,
            'turns': session['turns'],
            'offer_step': offer_step
        }
        
        if offer_step:
            theme = "general"
            try:
                if classifier and session['history']:
                    theme = classifier.predict([normalize(session['history'][-2]['content'])])[0]
            except:
                pass
                
            title, instr = small_coping_step(theme)
            response_data['suggestion'] = {
                'title': title,
                'instruction': instr
            }
        
        return jsonify(response_data)
        
    except Exception as e:
        print(f"Error in chat endpoint: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/accept_suggestion', methods=['POST'])
def accept_suggestion():
    """Endpoint for when user accepts a coping suggestion"""
    try:
        data = request.json
        session_id = data.get('session_id')
        
        if not session_id or session_id not in sessions:
            return jsonify({'error': 'Invalid session ID'}), 400
            
        session = sessions[session_id]
        
        # Get theme from last user message
        theme = "general"
        if session['history']:
            last_user_msg = next(
                (msg for msg in reversed(session['history']) if msg['role'] == 'user'), 
                None
            )
            if last_user_msg and classifier:
                try:
                    theme = classifier.predict([normalize(last_user_msg['content'])])[0]
                except:
                    pass
        
        title, instr = small_coping_step(theme)
        response = f"Okay — short step: {title} — {instr}\n\nWould you like to name one small action you could try?"
        
        # Update session
        session['history'].append({'role': 'assistant', 'content': response})
        
        # Log the session
        log_session('assistant', response, {
            'user_id': session['user_id'], 
            'session_id': session_id,
            'phase': 'provide_step'
        })
        
        return jsonify({
            'response': response,
            'session_id': session_id,
            'step': {'title': title, 'instruction': instr}
        })
        
    except Exception as e:
        print(f"Error in accept_suggestion endpoint: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/analyze_mood', methods=['POST'])
def analyze_mood():
    """Endpoint for analyzing mood from an image"""
    try:
        # Check if image file is provided
        if 'image' not in request.files:
            return jsonify({'error': 'No image file provided'}), 400
            
        image_file = request.files['image']
        user_id = request.form.get('user_id', 'default_user')
        
        # Read image
        image_data = image_file.read()
        nparr = np.frombuffer(image_data, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            return jsonify({'error': 'Could not decode image'}), 400
            
        # Detect emotions
        results = mood_detector.detect_emotions(img)
        
        if not results:
            response = {
                'dominant_emotion': 'no_face',
                'emotions': {},
                'message': 'No face detected in the image'
            }
        else:
            # Get the first face detected
            face = results[0]
            scores = {k: float(v) for k, v in face["emotions"].items()}
            dominant = max(scores, key=scores.get)
            
            response = {
                'dominant_emotion': dominant,
                'emotions': scores,
                'message': f'Detected emotion: {dominant}'
            }
            
            # Log the detection
            timestamp = datetime.utcnow().isoformat()
            log_detection(timestamp, image_file.filename, dominant, scores)
        
        return jsonify(response)
        
    except Exception as e:
        print(f"Error in analyze_mood endpoint: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/session/<session_id>', methods=['GET'])
def get_session(session_id):
    """Get session history"""
    if session_id not in sessions:
        return jsonify({'error': 'Session not found'}), 404
        
    return jsonify({
        'session_id': session_id,
        'history': sessions[session_id]['history'],
        'user_id': sessions[session_id]['user_id'],
        'created_at': sessions[session_id]['created_at'],
        'turns': sessions[session_id]['turns']
    })

@app.route('/api/session/<session_id>', methods=['DELETE'])
def delete_session(session_id):
    """Delete a session"""
    if session_id in sessions:
        del sessions[session_id]
        return jsonify({'message': 'Session deleted successfully'})
    else:
        return jsonify({'error': 'Session not found'}), 404

@app.route('/api/sessions', methods=['GET'])
def list_sessions():
    """List all sessions for a user"""
    user_id = request.args.get('user_id')
    
    if user_id:
        user_sessions = {
            sid: data for sid, data in sessions.items() 
            if data['user_id'] == user_id
        }
        return jsonify({'sessions': user_sessions})
    else:
        return jsonify({'sessions': sessions})

@app.route('/api/feedback', methods=['POST'])
def submit_feedback():
    """Submit feedback about a response"""
    try:
        data = request.json
        session_id = data.get('session_id')
        feedback = data.get('feedback', '')
        user_id = data.get('user_id', 'default_user')
        
        if not session_id or session_id not in sessions:
            return jsonify({'error': 'Invalid session ID'}), 400
            
        session = sessions[session_id]
        
        if feedback.lower() == 'summary':
            # Generate summary
            summary = f"Session summary for {user_id} (Session: {session_id})\n\n"
            for msg in session['history']:
                role = "User" if msg['role'] == 'user' else "Therapist"
                summary += f"{role}: {msg['content']}\n\n"
            
            # Save summary to file
            summary_filename = f"summary_{session_id}_{int(time.time())}.txt"
            summary_path = os.path.join('sessions', summary_filename)
            
            with open(summary_path, 'w', encoding='utf-8') as f:
                f.write(summary)
                
            return jsonify({
                'message': 'Summary generated successfully',
                'summary_path': summary_path
            })
            
        else:
            # Save positive feedback to memory
            if any(tok in normalize(feedback) for tok in ["good", "thanks", "thank", "helpful", "great"]):
                # Get the last exchange
                if len(session['history']) >= 2:
                    user_input = session['history'][-2]['content']
                    bot_response = session['history'][-1]['content']
                    
                    # Save to memory
                    memory_entry = {
                        'input': user_input,
                        'response': bot_response,
                        't': time.time(),
                        'user_id': user_id,
                        'session_id': session_id
                    }
                    
                    memory_path = "user_memory.jsonl"
                    with open(memory_path, 'a', encoding='utf-8') as f:
                        f.write(json.dumps(memory_entry, ensure_ascii=False) + '\n')
                    
                    # Clear caches to rebuild with new data
                    cache_files = ['vectorizer.joblib', 'index_store.joblib', 'theme_classifier.joblib']
                    for cache_file in cache_files:
                        if os.path.exists(cache_file):
                            os.remove(cache_file)
                    
                    return jsonify({'message': 'Feedback saved successfully'})
            
            return jsonify({'message': 'Feedback received'})
            
    except Exception as e:
        print(f"Error in feedback endpoint: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': time.time(),
        'sessions_count': len(sessions)
    })

if __name__ == '__main__':
    # Create necessary directories
    os.makedirs('sessions', exist_ok=True)
    os.makedirs('logs', exist_ok=True)
    
    # Run the Flask app
    app.run(debug=True, host='0.0.0.0', port=5000)