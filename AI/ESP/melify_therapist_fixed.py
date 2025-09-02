#!/usr/bin/env python3
"""
Melify — Professional Therapeutic AI (Standalone, Fixed)
========================================================

- Advanced Empathy Framework
- Crisis Intervention Protocols
- Cultural Competence
- Real-time Emotional Intelligence
- Professional Therapeutic Standards
"""

import time
import random
from datetime import datetime
from typing import Dict, List, Any, Optional, Tuple
from collections import deque
import numpy as np
import json
import csv
import os

# Try to import sklearn for TF-IDF similarity
try:
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.metrics.pairwise import cosine_similarity
    SKLEARN_AVAILABLE = True
except Exception:
    SKLEARN_AVAILABLE = False
    TfidfVectorizer = None
    cosine_similarity = None

# Alternative Deep Learning imports (scikit-learn based)
try:
    from sklearn.neural_network import MLPClassifier
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.preprocessing import LabelEncoder
    SKLEARN_ML_AVAILABLE = True
except Exception:
    SKLEARN_ML_AVAILABLE = False

# Speech imports
try:
    import speech_recognition as sr
    import pyttsx3
    SPEECH_AVAILABLE = True
except Exception:
    SPEECH_AVAILABLE = False


class MelifyTherapistAI:
    """
    Melify Therapeutic AI (fixed)
    - Fixes boolean checks against numpy/scipy arrays/sparse matrices
    - Robust RAG fallback when sklearn is missing
    - More natural greeting flow
    """

    def __init__(self):
        print("[AWARD] Initializing Melify Therapeutic AI...")
        print("[EXPERTISE] Loading therapeutic expertise...")

        # Core therapeutic knowledge
        self.therapeutic_modalities = self._load_therapeutic_modalities()
        self.crisis_protocols = self._load_crisis_protocols()

        # Conversation management
        self.conversation_history = deque(maxlen=50)
        self.session_context = {
            'start_time': datetime.now(),
            'emotional_trajectory': [],
            'therapeutic_goals': [],
            'risk_assessment': 'low',
            'conversation_topics': set(),
            'user_profile': {},
            'multi_turn_context': [],
        }

        # Empathy + EI engines
        self.empathy_engine = EmpathyEngine()
        self.emotional_intelligence = EmotionalIntelligence()

        # RAG System for conversation retrieval
        self.conversation_memory = []
        self.vectorizer = None
        self.memory_vectors = None
        self._initialize_rag_system()

        # Deep Learning components
        self.intent_model = None
        self.vectorizer = None
        self.label_encoder = None
        self.intent_labels = []
        self.response_data = []
        self._load_training_data()
        self._train_deep_model()

        # Speech components
        self.recognizer = None
        self.tts_engine = None
        if SPEECH_AVAILABLE:
            self.recognizer = sr.Recognizer()
            self.tts_engine = pyttsx3.init()

        print("[READY] Melify ready for therapeutic sessions")
        print("[PREPARED] Prepared with multiple modalities, crisis intervention, RAG, deep learning, and speech capabilities")

    # ------------------------ Data loaders ------------------------
    def _load_therapeutic_modalities(self) -> Dict[str, Any]:
        return {
            'cbt': {
                'name': 'Cognitive Behavioral Therapy',
                'key_phrases': [
                    "What thoughts are going through your mind right now?",
                    "What evidence supports this thought?",
                    "What evidence contradicts this thought?",
                ],
            },
            'dbt': {
                'name': 'Dialectical Behavior Therapy',
                'key_phrases': [
                    "What does your Wise Mind tell you about this?",
                    "Let's practice a brief TIPP skill together.",
                ],
            },
            'mindfulness': {
                'name': 'Mindfulness-Based Therapy',
                'key_phrases': [
                    "Let's take a moment to breathe together.",
                    "What do you notice in your body right now?",
                ],
            },
            'act': {
                'name': 'Acceptance & Commitment Therapy',
                'key_phrases': [
                    "What action would be consistent with your values?",
                    "Can you notice that thought without fighting it?",
                ],
            },
            'solution_focused': {
                'name': 'Solution Focused Brief Therapy',
                'key_phrases': [
                    "What would be the first small sign that things are getting better?"
                ],
            },
            'crisis_intervention': {
                'name': 'Crisis Intervention',
                'key_phrases': [
                    "Your safety is my top priority right now."
                ],
            },
            'trauma_informed': {
                'name': 'Trauma-Informed Care',
                'key_phrases': [
                    "You're in control of how much you want to share."
                ],
            },
            'motivational_interviewing': {
                'name': 'Motivational Interviewing',
                'key_phrases': [
                    "On a scale of 1-10, how important is this change to you?"
                ],
            },
            'general_support': {
                'name': 'Supportive Counseling',
                'key_phrases': [
                    "I'm here with you and listening."
                ],
            },
        }

    def _load_crisis_protocols(self) -> Dict[str, Any]:
        return {
            'suicidal_ideation': {
                'keywords': ['suicide', 'kill myself', 'want to die', 'end it all', 'better off dead'],
                'response_template': (
                    "I hear that you're in intense pain and I'm deeply concerned for your safety. "
                    "Your life matters and you deserve support. Please stay with me. "
                    "If you are in immediate danger, call your local emergency number now. "
                    "In the U.S., call or text 988 (24/7). "
                    "Can you share what's feeling most overwhelming right now so we can make a safety plan together?"
                ),
                'level': 'extreme',
            },
            'self_harm': {
                'keywords': ['cut myself', 'self harm', 'hurt myself', 'burn myself'],
                'response_template': (
                    "I'm really concerned to hear you're thinking about hurting yourself. "
                    "Your safety is the priority. Let's think together about ways to get through this urge safely. "
                    "Would you be willing to remove or move away from anything you could use to harm yourself? "
                    "We can also plan alternate coping steps right now."
                ),
                'level': 'high',
            },
        }

    # ------------------------ Session flow ------------------------
    def start_therapeutic_session(self) -> str:
        self.session_context['start_time'] = datetime.now()
        return (
            "Hello, I'm Melify, your professional therapeutic AI companion.\n\n"
            "This is a confidential space to explore what's on your mind. "
            "How are you feeling right now?"
        )

    def process_user_input(self, user_input: str) -> Dict[str, Any]:
        start_time = time.time()
        analysis = self._analyze_input(user_input)

        # Crisis check first
        crisis = self._check_crisis(user_input, analysis)
        if crisis['is_crisis']:
            response = crisis['response']
            technique = 'crisis_intervention'
        else:
            # Check if case is too complex for AI therapy
            complexity = self._assess_case_complexity(user_input, analysis)
            if complexity['level'] == 'expert':
                response = self._generate_professional_referral(complexity['reason'])
                technique = 'professional_referral'
            else:
                # Try RAG response
                rag_resp = self._generate_rag_response(user_input, analysis)
                if rag_resp:
                    response = rag_resp
                    technique = 'rag_conversation'
                else:
                    # Therapeutic response
                    gen = self._generate_therapeutic_response(user_input, analysis)
                    response = gen['response']
                    technique = gen.get('technique', 'general_support')

        # Update history/context
        self.conversation_history.append({
            'user_input': user_input,
            'therapist_response': response,
            'analysis': analysis,
            'technique': technique,
            'timestamp': datetime.now(),
            'response_time': time.time() - start_time
        })
        self._update_context(analysis)
        self._update_multi_turn_context(user_input, response, technique)

        return {
            'response': response,
            'technique_used': technique,
            'analysis': analysis,
            'session_context': self.session_context.copy(),
            'response_time': time.time() - start_time
        }

    # ------------------------ Analysis ------------------------
    def _analyze_input(self, text: str) -> Dict[str, Any]:
        return {
            'emotional_state': self._detect_emotion(text),
            'themes': self._identify_themes(text),
            'risk_indicators': self._assess_risk(text),
            'communication_style': self._communication_style(text),
            'vulnerability_level': self._vulnerability(text),
            'strengths_indicators': [],
        }

    def _detect_emotion(self, text: str) -> str:
        t = text.lower().strip()
        greetings = ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening']
        if t in greetings or any(t.startswith(g) for g in greetings):
            return 'greeting'

        patterns = {
            'depressed': ['hopeless', 'worthless', 'empty', 'numb', "can't go on", 'nothing matters'],
            'anxious': ['worried', 'anxious', 'scared', 'panicking', 'overwhelmed', "can't breathe", 'terrified'],
            'angry': ['angry', 'furious', 'rage', 'betrayed', 'unfair', 'frustrated'],
            'sad': ['sad', 'heartbroken', 'lonely', 'disappointed', 'down'],
        }
        scores = {k: sum(p in t for p in v) for k, v in patterns.items()}
        return max(scores, key=scores.get) if any(scores.values()) else 'neutral'

    def _identify_themes(self, text: str) -> List[str]:
        t = text.lower()
        themes = {
            'relationships': ['relationship', 'partner', 'breakup', 'family', 'friend'],
            'work_stress': ['work', 'job', 'boss', 'deadline', 'burnout', 'career'],
            'self_esteem': ['worthless', 'failure', 'not good enough', 'unlovable'],
            'trauma': ['trauma', 'abuse', 'assault', 'loss', 'grief'],
        }
        found = []
        for k, kws in themes.items():
            if any(kw in t for kw in kws):
                found.append(k)
        return found[:3]

    def _assess_risk(self, text: str) -> Dict[str, Any]:
        t = text.lower()
        indicators = []
        if any(k in t for k in self.crisis_protocols['suicidal_ideation']['keywords']):
            indicators.append('suicidal_ideation')
        if any(k in t for k in self.crisis_protocols['self_harm']['keywords']):
            indicators.append('self_harm')

        level = 'low'
        if 'suicidal_ideation' in indicators:
            level = 'extreme'
        elif indicators:
            level = 'high'
        return {'level': level, 'indicators': indicators}

    def _communication_style(self, text: str) -> str:
        wc = len(text.split())
        if wc < 5: return 'brief'
        if '?' in text: return 'questioning'
        if wc > 50: return 'detailed'
        return 'narrative'

    def _vulnerability(self, text: str) -> str:
        t = text.lower()
        if any(k in t for k in ['never told this', 'ashamed', 'embarrassed', 'vulnerable']):
            return 'high'
        if any(k in t for k in ['worried', 'overwhelmed', 'struggling']):
            return 'medium'
        return 'low'

    # ------------------------ RAG ------------------------
    def _initialize_rag_system(self):
        if not SKLEARN_AVAILABLE:
            print("[WARNING] RAG system disabled - sklearn not available")
            self.vectorizer = None
            self.memory_vectors = None
            self.conversation_memory = [
                ("hello", "Hello! I'm glad you reached out. How are you feeling today?"),
                ("hi", "Hi there — I'm here to listen. What's on your mind?"),
                ("i feel sad", "I'm sorry you're feeling sad. Would you like to share what's been weighing on you?"),
                ("i'm anxious", "Anxiety can feel overwhelming. What are you noticing in your body right now?"),
                ("i'm depressed", "Depression can make everything feel heavy. Thank you for reaching out despite that."),
                ("i feel lonely", "Feeling lonely is painful. You're not alone in this moment — I'm here with you."),
                ("i'm stressed", "I hear how much pressure you're under. What part feels most overwhelming?"),
            ]
            return

        # Seed examples
        self.conversation_memory = [
            ("hello", "Hello! I'm so glad you reached out. How are you feeling today?"),
            ("hi", "Hi there! I'm here to listen. What's on your mind?"),
            ("i feel sad", "I'm sorry you're feeling sad. That sounds really difficult. Can you tell me more about what's been weighing on you?"),
            ("i'm anxious", "Anxiety can be so overwhelming. I hear how much this is affecting you. What are you noticing in your body right now?"),
            ("i'm depressed", "Depression can make everything feel heavy and hopeless. I want to acknowledge how much strength it takes to reach out despite feeling this way."),
            ("i feel lonely", "Feeling lonely can be incredibly painful. You're not alone in this moment - I'm right here with you. What would be most helpful for you right now?"),
            ("i'm stressed", "Stress can feel all-consuming. I can hear how much pressure you're under. What aspects of this are feeling most overwhelming?"),
            ("i'm angry", "Anger is a valid emotion, and I can hear how strongly you're feeling it. What happened that triggered these feelings?"),
        ]

        try:
            self.vectorizer = TfidfVectorizer(ngram_range=(1, 2), min_df=1, stop_words='english')
            self.memory_vectors = self.vectorizer.fit_transform([u for (u, _) in self.conversation_memory])
            print("[SUCCESS] RAG system initialized with conversation memory")
        except Exception as e:
            print(f"[WARNING] RAG init failed: {e}")
            self.vectorizer = None
            self.memory_vectors = None

    def _generate_rag_response(self, user_input: str, analysis: Dict[str, Any]) -> Optional[str]:
        # If vectorizer or memory_vectors are not set, gracefully skip
        if self.vectorizer is None or self.memory_vectors is None or not SKLEARN_AVAILABLE:
            # fallback: simple keyword match over memory
            return self._fallback_similarity_response(user_input)

        try:
            user_vec = self.vectorizer.transform([user_input])
            sim_matrix = cosine_similarity(user_vec, self.memory_vectors)
            sims = sim_matrix[0]
            if isinstance(sims, list):
                sims = np.array(sims)
            if sims.size == 0:
                return None
            top_idx = int(np.argmax(sims))
            if sims[top_idx] < 0.1:
                return None
            return self.conversation_memory[top_idx][1]
        except Exception as e:
            print(f"[WARNING] RAG error: {e}")
            return self._fallback_similarity_response(user_input)

    def _fallback_similarity_response(self, user_input: str) -> Optional[str]:
        # simple overlap
        if not self.conversation_memory:
            return None
        uw = set(user_input.lower().split())
        best = None
        best_score = 0.0
        for u, r in self.conversation_memory:
            tw = set(u.lower().split())
            inter = len(uw & tw)
            union = len(uw | tw) or 1
            score = inter / union
            if score > best_score:
                best_score = score
                best = r
        return best if best_score >= 0.1 else None

    # ------------------------ Deep Learning Data Loading ------------------------
    def _load_training_data(self):
        print("[LOADING] Loading training datasets...")
        self.intent_labels = []
        self.response_data = []

        # Load intents.json
        try:
            with open('AI/ESP/intents.json', 'r') as f:
                intents_data = json.load(f)
                for intent in intents_data['intents']:
                    tag = intent['tag']
                    for pattern in intent['patterns']:
                        self.intent_labels.append((pattern, tag))
                    for response in intent['responses']:
                        self.response_data.append((tag, response))
        except Exception as e:
            print(f"[WARNING] Could not load intents.json: {e}")

        # Load combined_dataset.json (sample first 1000 for efficiency)
        try:
            with open('AI/ESP/combined_dataset.json', 'r') as f:
                data = json.load(f)
                for item in data[:1000]:  # Sample to avoid memory issues
                    context = item['Context']
                    response = item['Response']
                    self.response_data.append(('general', response))
        except Exception as e:
            print(f"[WARNING] Could not load combined_dataset.json: {e}")

        # Load train1.csv (sample)
        try:
            with open('AI/ESP/train1.csv', 'r') as f:
                reader = csv.reader(f)
                next(reader)  # Skip header
                count = 0
                for row in reader:
                    if count >= 1000: break
                    if len(row) >= 2:
                        context = row[0]
                        response = row[1]
                        self.response_data.append(('general', response))
                    count += 1
        except Exception as e:
            print(f"[WARNING] Could not load train1.csv: {e}")

        print(f"[LOADED] Loaded {len(self.intent_labels)} intent patterns and {len(self.response_data)} responses")

    def _train_deep_model(self):
        if not SKLEARN_ML_AVAILABLE or not self.intent_labels:
            print("[WARNING] Scikit-learn ML not available or no training data - skipping deep model training")
            return

        print("[TRAINING] Training MLP deep learning model...")

        # Prepare data
        patterns = [p for p, _ in self.intent_labels]
        labels = [l for _, l in self.intent_labels]

        # Vectorize text
        self.vectorizer = TfidfVectorizer(max_features=1000, ngram_range=(1, 2))
        X = self.vectorizer.fit_transform(patterns)

        # Encode labels
        self.label_encoder = LabelEncoder()
        y = self.label_encoder.fit_transform(labels)

        # Build MLP model
        self.intent_model = MLPClassifier(
            hidden_layer_sizes=(100, 50),
            activation='relu',
            solver='adam',
            max_iter=500,
            random_state=42
        )

        # Train
        self.intent_model.fit(X, y)
        print("[TRAINED] MLP deep learning model trained successfully")

    def _predict_intent(self, text: str) -> str:
        if not self.intent_model or not self.vectorizer or not self.label_encoder:
            return 'general'
        X = self.vectorizer.transform([text])
        pred = self.intent_model.predict(X)
        intent_label = self.label_encoder.inverse_transform(pred)[0]
        return intent_label

    # ------------------------ Advanced Context Handling ------------------------
    def _update_multi_turn_context(self, user_input: str, response: str, intent: str):
        self.session_context['multi_turn_context'].append({
            'user': user_input,
            'therapist': response,
            'intent': intent,
            'timestamp': datetime.now()
        })
        # Keep last 5 turns for context
        if len(self.session_context['multi_turn_context']) > 5:
            self.session_context['multi_turn_context'].pop(0)

    def _get_contextual_response(self, intent: str) -> Optional[str]:
        # Use previous context to refine response
        if not self.session_context['multi_turn_context']:
            return None

        last_turn = self.session_context['multi_turn_context'][-1]
        if last_turn['intent'] == intent:
            # Follow-up on same topic
            return f"I sense we're continuing to explore {intent}. Can you tell me more about how this has been affecting you?"

        return None

    # ------------------------ Speech Functionality ------------------------
    def listen_speech(self) -> Optional[str]:
        if not SPEECH_AVAILABLE or not self.recognizer:
            print("[WARNING] Speech recognition not available")
            return None
        try:
            with sr.Microphone() as source:
                print("[LISTENING] Listening...")
                audio = self.recognizer.listen(source, timeout=5)
                text = self.recognizer.recognize_google(audio)
                print(f"[HEARD] {text}")
                return text
        except Exception as e:
            print(f"[ERROR] Speech recognition failed: {e}")
            return None

    def speak_response(self, text: str):
        if not SPEECH_AVAILABLE or not self.tts_engine:
            print("[WARNING] Text-to-speech not available")
            return
        try:
            # Configure voice for therapeutic feel
            voices = self.tts_engine.getProperty('voices')
            if voices:
                # Try to use a calm, soothing voice
                for voice in voices:
                    if 'female' in voice.name.lower() or 'calm' in voice.name.lower():
                        self.tts_engine.setProperty('voice', voice.id)
                        break

            # Set speech rate for therapeutic pacing
            self.tts_engine.setProperty('rate', 150)  # Slightly slower for empathy

            # Split long responses for better listening
            if len(text) > 200:
                sentences = text.split('. ')
                for i, sentence in enumerate(sentences):
                    if sentence.strip():
                        self.tts_engine.say(sentence.strip())
                        if i < len(sentences) - 1:
                            self.tts_engine.runAndWait()
                            time.sleep(0.5)  # Pause between sentences
            else:
                self.tts_engine.say(text)

            self.tts_engine.runAndWait()
        except Exception as e:
            print(f"[ERROR] Text-to-speech failed: {e}")
            print(f"[FALLBACK] Response: {text}")

    # ------------------------ Response generation ------------------------
    def _generate_therapeutic_response(self, user_input: str, analysis: Dict[str, Any]) -> Dict[str, Any]:
        emotion = analysis.get('emotional_state', 'neutral')
        themes = analysis.get('themes', [])
        vuln = analysis.get('vulnerability_level', 'low')

        # Use deep learning to predict intent
        predicted_intent = self._predict_intent(user_input)

        # Get responses for predicted intent
        intent_responses = [r for t, r in self.response_data if t == predicted_intent]
        if intent_responses:
            response = random.choice(intent_responses)
            return {'response': response, 'technique': predicted_intent}

        # Fallback to original logic
        # Greetings
        if emotion == 'greeting':
            return {
                'response': random.choice([
                    "Hello! I'm so glad you reached out. How are you feeling today?",
                    "Hi there — I'm here to listen. What's on your mind?",
                    "Hello! Thank you for connecting with me. How can I support you today?",
                ]),
                'technique': 'greeting'
            }

        modality = self._select_modality(emotion, themes)
        empathy = self.empathy_engine.empathize(emotion, themes, vuln)
        technique = self._technique_response(modality, emotion)

        follow_up = self._follow_up(emotion, themes, analysis.get('communication_style', 'narrative'))

        full = empathy
        if technique:
            full += "\n\n" + technique
        if follow_up:
            full += "\n\n" + follow_up

        return {'response': full, 'technique': modality}

    def _select_modality(self, emotion: str, themes: List[str]) -> str:
        if 'trauma' in themes:
            return 'trauma_informed'
        mapping = {
            'depressed': 'cbt',
            'anxious': 'mindfulness',
            'angry': 'dbt',
            'sad': 'cbt',
            'neutral': 'general_support'
        }
        return mapping.get(emotion, 'general_support')

    def _technique_response(self, modality: str, emotion: str) -> str:
        info = self.therapeutic_modalities.get(modality)
        if not info:
            return ""
        name = info['name']
        kp = info.get('key_phrases', [])
        phrase = random.choice(kp) if kp else ""
        if not phrase:
            return f"From a {name} perspective, let's explore this further."
        if modality == 'mindfulness' and emotion == 'anxious':
            return f"One helpful approach is mindfulness. {phrase} It can create some space from anxious thoughts."
        if modality == 'cbt' and emotion in ('sad', 'depressed'):
            return f"Cognitive Behavioral Therapy can help here. {phrase} It links thoughts, feelings, and behaviors."
        return f"From a {name} perspective: {phrase}"

    def _follow_up(self, emotion: str, themes: List[str], style: str) -> str:
        questions = {
            'sad': [
                "What would help lift your spirits a little right now?",
                "Is there something that usually brings you comfort?",
            ],
            'anxious': [
                "What sensations are you noticing in your body?",
                "What coping strategies have helped before?",
            ],
            'angry': [
                "What do you think is at the root of this anger?",
            ],
            'depressed': [
                "What small step could you take today toward feeling a bit better?",
            ],
            'relationships': [
                "How has this been affecting your connection with others?"
            ],
            'work_stress': [
                "Which part of work feels heaviest right now?"
            ],
            'self_esteem': [
                "What evidence might contradict those harsh self-judgments?"
            ],
            'default': [
                "Would you like to share a bit more about that?"
            ]
        }

        # theme-priority
        for th in themes:
            if th in questions:
                return random.choice(questions[th])
        if emotion in questions:
            return random.choice(questions[emotion])
        return random.choice(questions['default'])

    # ------------------------ Context ------------------------
    def _update_context(self, analysis: Dict[str, Any]):
        emotion = analysis.get('emotional_state', 'neutral')
        self.session_context['emotional_trajectory'].append({
            'emotion': emotion,
            'timestamp': datetime.now(),
            'themes': analysis.get('themes', [])
        })
        risk = analysis.get('risk_indicators', {}).get('level', 'low')
        if risk != 'low':
            self.session_context['risk_assessment'] = risk
        for theme in analysis.get('themes', []):
            if theme not in self.session_context['therapeutic_goals']:
                self.session_context['therapeutic_goals'].append(theme)

    # ------------------------ Case Complexity Assessment ------------------------
    def _assess_case_complexity(self, user_input: str, analysis: Dict[str, Any]) -> Dict[str, Any]:
        complexity_score = 0
        reasons = []

        # Check for trauma indicators
        trauma_keywords = ['abuse', 'trauma', 'rape', 'assault', 'violence', 'ptsd', 'dissociation']
        if any(kw in user_input.lower() for kw in trauma_keywords):
            complexity_score += 3
            reasons.append('trauma_history')

        # Check for severe mental health conditions
        severe_keywords = ['psychosis', 'hallucinations', 'delusions', 'bipolar', 'schizophrenia', 'borderline']
        if any(kw in user_input.lower() for kw in severe_keywords):
            complexity_score += 3
            reasons.append('severe_mental_health')

        # Check for substance abuse
        substance_keywords = ['addiction', 'drugs', 'alcohol', 'overdose', 'withdrawal']
        if any(kw in user_input.lower() for kw in substance_keywords):
            complexity_score += 2
            reasons.append('substance_abuse')

        # Check for eating disorders
        eating_keywords = ['anorexia', 'bulimia', 'eating disorder', 'binge eating']
        if any(kw in user_input.lower() for kw in eating_keywords):
            complexity_score += 2
            reasons.append('eating_disorder')

        # Check for chronic suicidal ideation
        if 'suicidal' in analysis.get('risk_indicators', {}).get('indicators', []):
            complexity_score += 3
            reasons.append('chronic_suicidal_ideation')

        # Determine level
        if complexity_score >= 5:
            level = 'expert'
        elif complexity_score >= 3:
            level = 'intermediate'
        else:
            level = 'basic'

        return {'level': level, 'score': complexity_score, 'reason': reasons[0] if reasons else 'general'}

    def _generate_professional_referral(self, reason: str) -> str:
        base_response = (
            "I hear the depth and complexity of what you're sharing, and while I'm here to support you, "
            "I want to be honest that this sounds like it would benefit greatly from working with a licensed professional therapist. "
            "As an AI companion, I'm designed to provide general support for everyday challenges, but for specialized care, "
            "human expertise can offer the comprehensive therapeutic relationship you deserve."
        )

        referrals = {
            'trauma_history': (
                "Given the trauma you've experienced, I recommend seeking a therapist who specializes in trauma-informed care. "
                "Organizations like RAINN (rainn.org) or local trauma centers can help you find qualified professionals."
            ),
            'severe_mental_health': (
                "For complex mental health conditions, working with a psychiatrist or clinical psychologist would be most beneficial. "
                "They can provide both therapy and medication management if needed."
            ),
            'substance_abuse': (
                "Substance use concerns often require specialized treatment. Resources like SAMHSA's helpline (1-800-662-HELP) "
                "can connect you with local treatment centers and support groups."
            ),
            'eating_disorder': (
                "Eating disorders need specialized medical and therapeutic care. Organizations like NEDA (nationaleatingdisorders.org) "
                "can help you find treatment centers and therapists with expertise in this area."
            ),
            'chronic_suicidal_ideation': (
                "For ongoing thoughts of self-harm or suicide, immediate professional help is crucial. "
                "Please contact the National Suicide Prevention Lifeline at 988 (24/7) or go to your nearest emergency room."
            ),
            'general': (
                "I recommend consulting with a licensed mental health professional who can provide personalized, in-depth therapy. "
                "You can find therapists through Psychology Today, your insurance provider, or local mental health clinics."
            )
        }

        specific_referral = referrals.get(reason, referrals['general'])

        return f"{base_response}\n\n{specific_referral}\n\nI'm still here to listen and support you in the meantime. Would you like to talk about what's most pressing for you right now?"

    # ------------------------ Crisis ------------------------
    def _check_crisis(self, user_input: str, analysis: Dict[str, Any]) -> Dict[str, Any]:
        risk = analysis.get('risk_indicators', {})
        if risk.get('level') in ('high', 'extreme'):
            kind = (risk.get('indicators') or ['self_harm'])[0]
            proto = self.crisis_protocols.get(kind, self.crisis_protocols['self_harm'])
            return {'is_crisis': True, 'response': proto['response_template']}
        return {'is_crisis': False}

    # ------------------------ Summary ------------------------
    def get_session_summary(self) -> Dict[str, Any]:
        if not self.conversation_history:
            return {'status': 'no_session_data'}
        total = len(self.conversation_history)
        dur = (datetime.now() - self.session_context['start_time']).total_seconds() / 60.0
        avg_rt = sum(e['response_time'] for e in self.conversation_history) / max(total, 1)
        techniques = {}
        for e in self.conversation_history:
            t = e.get('technique', 'general_support')
            techniques[t] = techniques.get(t, 0) + 1
        return {
            'session_duration_minutes': dur,
            'total_exchanges': total,
            'techniques_used': techniques,
            'risk_assessment': self.session_context['risk_assessment'],
            'average_response_time': avg_rt,
        }


class EmpathyEngine:
    def __init__(self):
        self.validation = [
            "Your feelings are completely valid and understandable.",
            "It makes sense you feel this way given what you've been dealing with.",
            "I want you to know that what you're experiencing is real and important.",
        ]
        self.support = [
            "I'm here with you and listening without judgment.",
            "You don't have to go through this alone — I'm right here with you.",
            "Take your time. I'm not going anywhere.",
        ]
        self.therapeutic_presence = [
            "I can sense how much this is weighing on you.",
            "It sounds like you've been carrying this for a while.",
            "Thank you for trusting me with this.",
        ]

    def empathize(self, emotion: str, themes: List[str], vulnerability: str) -> str:
        parts = []

        # Start with therapeutic presence
        parts.append(random.choice(self.therapeutic_presence))

        # Emotion-specific empathy
        if emotion == 'sad':
            parts.append("I can hear the deep sadness in your words, and it touches me.")
        elif emotion == 'anxious':
            parts.append("I can feel the intensity of this anxiety with you right now.")
        elif emotion == 'angry':
            parts.append("I can sense how strongly this has affected you — your anger is completely valid.")
        elif emotion == 'depressed':
            parts.append("The heaviness and hopelessness you're describing sound profoundly exhausting.")
        elif emotion == 'greeting':
            parts.append("I'm glad you've reached out. I'm here to listen.")
        else:
            parts.append(random.choice(self.validation))

        # Theme-specific empathy
        if 'work_stress' in themes:
            parts.append("Work pressure can really drain your spirit and energy.")
        if 'relationships' in themes:
            parts.append("Relationship challenges can cut very deep and affect every part of our lives.")
        if 'self_esteem' in themes:
            parts.append("Those inner critic voices can be so harsh and unrelenting.")
        if 'trauma' in themes:
            parts.append("Trauma can leave lasting imprints that affect how we see ourselves and the world.")

        # Vulnerability level
        if vulnerability == 'high':
            parts.append("Many people experience similar feelings in situations like this — you're not alone in this.")
        elif vulnerability == 'medium':
            parts.append("It's brave of you to open up about this.")

        # End with support
        parts.append(random.choice(self.support))

        # Make it feel more like therapy
        full_response = " ".join(parts)
        if len(full_response.split()) > 30:
            # Break into therapeutic pacing
            sentences = full_response.split('. ')
            if len(sentences) > 2:
                return '. '.join(sentences[:2]) + '. ' + random.choice([
                    "How does that land with you?",
                    "What comes up for you as I say that?",
                    "Does this resonate with your experience?"
                ])

        return full_response


class EmotionalIntelligence:
    def __init__(self):
        pass


def main():
    print("[AWARD] Melify - Professional Therapeutic AI")
    print("=" * 70)
    print("   - Advanced Empathy Framework")
    print("   - Crisis Intervention Protocols")
    print("   - Cultural Competence")
    print("   - Real-time Emotional Intelligence")
    print("   - Professional Therapeutic Standards")
    print("=" * 70)

    therapist = MelifyTherapistAI()
    welcome = therapist.start_therapeutic_session()
    print(f"\n[THERAPIST] Melify: {welcome}")

    voice_mode = input("Enable voice mode? (y/n): ").lower().strip() == 'y'

    while True:
        try:
            if voice_mode:
                user_input = therapist.listen_speech()
                if not user_input:
                    print("[VOICE] Could not understand, please try again.")
                    continue
            else:
                user_input = input("\n[USER] You: ").strip()

            if user_input and user_input.lower() in ('quit', 'exit', 'bye', 'goodbye'):
                summary = therapist.get_session_summary()
                print("\n[SUMMARY] Session Summary:")
                if 'session_duration_minutes' in summary:
                    print(f"   Duration: {summary['session_duration_minutes']:.1f} minutes")
                print(f"   Exchanges: {summary.get('total_exchanges', 0)}")
                print(f"   Risk Level: {summary.get('risk_assessment', 'low')}")
                response_text = "Thank you for sharing with me today. Take gentle care of yourself."
                print(f"\n[THERAPIST] Melify: {response_text}")
                if voice_mode:
                    therapist.speak_response(response_text)
                break

            if not user_input:
                continue

            data = therapist.process_user_input(user_input)
            print(f"\n[THERAPIST] Melify: {data['response']}")
            print(f"[SPEED] Response Time: {data['response_time']:.2f}s")
            print(f"[TECHNIQUE] Technique: {data['technique_used'].replace('_', ' ').title()}")

            if voice_mode:
                therapist.speak_response(data['response'])

        except KeyboardInterrupt:
            print("\n[GOODBYE] Session ended by user. Take care!")
            break
        except Exception as e:
            print(f"[ERROR] Processing Error: {e}")
            print("[THERAPIST] Melify: I'm experiencing a technical issue. Let's try again.")
            continue


if __name__ == "__main__":
    main()
