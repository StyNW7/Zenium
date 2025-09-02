#!/usr/bin/env python3
"""
Melify Advanced — Next-Generation AI Therapist
==============================================

- Advanced Deep Learning with OpenAI Integration
- Human-like Natural Conversations
- Comprehensive Knowledge Base
- Real-time Emotional Intelligence
- Professional Therapeutic Standards
- Multi-modal Support (Text + Speech)
"""

import time
import random
import json
import csv
import os
from datetime import datetime
from typing import Dict, List, Any, Optional, Tuple
from collections import deque
import asyncio
import threading

# Deep Learning and AI imports
try:
    from sklearn.neural_network import MLPClassifier
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.preprocessing import LabelEncoder
    from sklearn.model_selection import train_test_split
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False

# OpenAI integration
try:
    import openai
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False

# Speech capabilities
try:
    import speech_recognition as sr
    import pyttsx3
    SPEECH_AVAILABLE = True
except ImportError:
    SPEECH_AVAILABLE = False

class MelifyAdvancedTherapist:
    """
    Advanced AI Therapist with OpenAI integration and human-like conversations
    """

    def __init__(self, openai_api_key: Optional[str] = None):
        print("[MELIFY ADVANCED] Initializing next-generation therapeutic AI...")
        print("[SYSTEM] Loading advanced capabilities...")

        # OpenAI setup
        self.openai_client = None
        if OPENAI_AVAILABLE and openai_api_key:
            openai.api_key = openai_api_key
            self.openai_client = openai
            print("[OPENAI] Connected to GPT knowledge base")
        else:
            print("[WARNING] OpenAI not configured - using local knowledge only")

        # Deep Learning components
        self.intent_model = None
        self.vectorizer = None
        self.label_encoder = None
        self.intent_labels = []
        self.response_data = []
        self.knowledge_base = []

        # Session management
        self.session_context = {
            'start_time': datetime.now(),
            'emotional_trajectory': [],
            'therapeutic_goals': [],
            'risk_assessment': 'low',
            'conversation_topics': set(),
            'user_profile': {},
            'multi_turn_context': [],
            'personality_traits': {},
            'conversation_style': 'natural'
        }

        # Therapeutic knowledge
        self.therapeutic_modalities = self._load_therapeutic_modalities()
        self.crisis_protocols = self._load_crisis_protocols()

        # Enhanced knowledge base
        self.therapeutic_knowledge = self._load_therapeutic_knowledge()
        self.coping_strategies = self._load_coping_strategies()
        self.mindfulness_exercises = self._load_mindfulness_exercises()

        # Load and train
        self._load_training_data()
        self._train_advanced_model()

        # Speech setup
        self.speech_enabled = SPEECH_AVAILABLE
        if self.speech_enabled:
            self.recognizer = sr.Recognizer()
            self.tts_engine = pyttsx3.init()
            self._configure_voice()

        print("[READY] Melify Advanced is ready for therapeutic sessions")
        print("[CAPABILITIES] Deep Learning + OpenAI + Speech + Human-like conversations")

    def _configure_voice(self):
        """Configure TTS for therapeutic, human-like voice"""
        if not self.tts_engine:
            return

        voices = self.tts_engine.getProperty('voices')
        if voices:
            # Prefer female, calm voices
            for voice in voices:
                if 'female' in voice.name.lower() or 'calm' in voice.name.lower():
                    self.tts_engine.setProperty('voice', voice.id)
                    break

        # Therapeutic pacing
        self.tts_engine.setProperty('rate', 160)  # Natural conversational pace
        self.tts_engine.setProperty('volume', 0.8)

    def _load_therapeutic_modalities(self) -> Dict[str, Any]:
        """Load comprehensive therapeutic knowledge"""
        return {
            'cbt': {
                'name': 'Cognitive Behavioral Therapy',
                'techniques': [
                    "Let's examine the thoughts behind this feeling",
                    "What evidence supports this thought?",
                    "What evidence contradicts it?",
                    "How might we reframe this situation?"
                ],
                'applications': ['anxiety', 'depression', 'ocd']
            },
            'dbt': {
                'name': 'Dialectical Behavior Therapy',
                'techniques': [
                    "Let's practice observing without judgment",
                    "What does your Wise Mind tell you?",
                    "How can we find the middle path here?"
                ],
                'applications': ['emotional_dysregulation', 'borderline', 'ptsd']
            },
            'mindfulness': {
                'name': 'Mindfulness-Based Therapy',
                'techniques': [
                    "Let's take a moment to breathe together",
                    "What do you notice in your body right now?",
                    "Can we observe this feeling with curiosity?"
                ],
                'applications': ['anxiety', 'stress', 'depression']
            },
            'act': {
                'name': 'Acceptance & Commitment Therapy',
                'techniques': [
                    "What matters most to you in this situation?",
                    "Can you notice this thought without fighting it?",
                    "What action would be consistent with your values?"
                ],
                'applications': ['values_clarification', 'motivation', 'chronic_pain']
            },
            'humanistic': {
                'name': 'Humanistic Therapy',
                'techniques': [
                    "I hear how much this means to you",
                    "Your feelings are completely valid here",
                    "What does this experience tell you about yourself?"
                ],
                'applications': ['self_esteem', 'personal_growth', 'relationships']
            }
        }

    def _load_crisis_protocols(self) -> Dict[str, Any]:
        """Load comprehensive crisis intervention protocols"""
        return {
            'suicidal_ideation': {
                'keywords': ['suicide', 'kill myself', 'want to die', 'end it all', 'better off dead'],
                'response_template': (
                    "I'm deeply concerned about what you're sharing regarding thoughts of self-harm. "
                    "Your life has value and meaning, and I'm here with you right now. "
                    "Please know that these feelings can change, and there is hope. "
                    "If you're in immediate danger, please call emergency services (911) or "
                    "the National Suicide Prevention Lifeline at 988. "
                    "Can you stay with me while we get you connected to immediate support?"
                ),
                'level': 'extreme',
                'resources': ['988 Suicide & Crisis Lifeline', 'Emergency Services']
            },
            'self_harm': {
                'keywords': ['cut myself', 'self harm', 'hurt myself', 'burn myself'],
                'response_template': (
                    "I hear that you're in pain and considering self-harm, and that worries me deeply. "
                    "Your safety is the most important thing right now. "
                    "Let's think together about ways to get through this moment safely. "
                    "Would you be willing to remove or move away from anything you could use to harm yourself? "
                    "We can also plan some immediate coping steps together."
                ),
                'level': 'high',
                'resources': ['988 Suicide & Crisis Lifeline', 'Local Crisis Center']
            },
            'severe_distress': {
                'keywords': ['can\'t go on', 'breaking point', 'losing control', 'falling apart'],
                'response_template': (
                    "I can hear how much pain you're in right now, and I want you to know you're not alone. "
                    "Even in the darkest moments, there can be hope and change. "
                    "Let's take this one breath at a time. Can you tell me what's feeling most overwhelming right now?"
                ),
                'level': 'high',
                'resources': ['988 Suicide & Crisis Lifeline', 'Mental Health Crisis Line']
            }
        }

    def _load_training_data(self):
        """Load and process all training datasets"""
        print("[LOADING] Loading comprehensive training datasets...")

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

        # Load combined_dataset.json (sample for efficiency)
        try:
            with open('AI/ESP/combined_dataset.json', 'r') as f:
                data = json.load(f)
                for item in data[:2000]:  # Larger sample for better training
                    context = item['Context']
                    response = item['Response']
                    self.response_data.append(('general', response))
                    self.knowledge_base.append(context)
        except Exception as e:
            print(f"[WARNING] Could not load combined_dataset.json: {e}")

        # Load train1.csv
        try:
            with open('AI/ESP/train1.csv', 'r') as f:
                reader = csv.reader(f)
                next(reader)  # Skip header
                count = 0
                for row in reader:
                    if count >= 2000: break
                    if len(row) >= 2:
                        context = row[0]
                        response = row[1]
                        self.response_data.append(('general', response))
                        self.knowledge_base.append(context)
                    count += 1
        except Exception as e:
            print(f"[WARNING] Could not load train1.csv: {e}")

        print(f"[LOADED] Loaded {len(self.intent_labels)} intent patterns, {len(self.response_data)} responses, {len(self.knowledge_base)} knowledge items")

    def _train_advanced_model(self):
        """Train advanced deep learning model"""
        if not SKLEARN_AVAILABLE or not self.intent_labels:
            print("[WARNING] Scikit-learn not available or no training data")
            return

        print("[TRAINING] Training advanced MLP model...")

        # Prepare data
        patterns = [p for p, _ in self.intent_labels]
        labels = [l for _, l in self.intent_labels]

        # Vectorize
        self.vectorizer = TfidfVectorizer(max_features=2000, ngram_range=(1, 3))
        X = self.vectorizer.fit_transform(patterns)

        # Encode labels
        self.label_encoder = LabelEncoder()
        y = self.label_encoder.fit_transform(labels)

        # Split for validation
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

        # Advanced MLP model
        self.intent_model = MLPClassifier(
            hidden_layer_sizes=(200, 100, 50),
            activation='relu',
            solver='adam',
            alpha=0.001,
            learning_rate='adaptive',
            max_iter=1000,
            random_state=42,
            early_stopping=True,
            validation_fraction=0.1
        )

        # Train
        self.intent_model.fit(X_train, y_train)

        # Evaluate
        train_score = self.intent_model.score(X_train, y_train)
        test_score = self.intent_model.score(X_test, y_test)

        print(f"[TRAINED] Model accuracy - Train: {train_score:.3f}, Test: {test_score:.3f}")

    def _predict_intent(self, text: str) -> str:
        """Predict intent using deep learning model"""
        if not self.intent_model or not self.vectorizer or not self.label_encoder:
            return 'general'

        try:
            X = self.vectorizer.transform([text])
            pred = self.intent_model.predict(X)
            intent_label = self.label_encoder.inverse_transform(pred)[0]
            return intent_label
        except Exception as e:
            print(f"[WARNING] Intent prediction failed: {e}")
            return 'general'

    def _assess_case_complexity(self, user_input: str, analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Advanced case complexity assessment"""
        complexity_score = 0
        reasons = []
        risk_factors = []

        # Trauma indicators
        trauma_keywords = ['abuse', 'trauma', 'rape', 'assault', 'violence', 'ptsd', 'dissociation', 'flashbacks']
        if any(kw in user_input.lower() for kw in trauma_keywords):
            complexity_score += 4
            reasons.append('trauma_history')
            risk_factors.append('trauma')

        # Severe mental health
        severe_keywords = ['psychosis', 'hallucinations', 'delusions', 'bipolar', 'schizophrenia', 'borderline', 'dissociative']
        if any(kw in user_input.lower() for kw in severe_keywords):
            complexity_score += 4
            reasons.append('severe_mental_health')
            risk_factors.append('severe_mh')

        # Substance abuse
        substance_keywords = ['addiction', 'drugs', 'alcohol', 'overdose', 'withdrawal', 'substance', 'dependence']
        if any(kw in user_input.lower() for kw in substance_keywords):
            complexity_score += 3
            reasons.append('substance_abuse')
            risk_factors.append('substance')

        # Eating disorders
        eating_keywords = ['anorexia', 'bulimia', 'eating disorder', 'binge eating', 'purging', 'body dysmorphia']
        if any(kw in user_input.lower() for kw in eating_keywords):
            complexity_score += 3
            reasons.append('eating_disorder')
            risk_factors.append('eating')

        # Chronic suicidal ideation
        suicide_keywords = ['chronic suicide', 'always suicidal', 'constant thoughts of death', 'ongoing self-harm']
        if any(kw in user_input.lower() for kw in suicide_keywords):
            complexity_score += 5
            reasons.append('chronic_suicidal_ideation')
            risk_factors.append('chronic_suicide')

        # Session context factors
        if len(self.session_context['emotional_trajectory']) > 10:
            if all(entry.get('emotion') in ['depressed', 'anxious', 'angry'] for entry in self.session_context['emotional_trajectory'][-5:]):
                complexity_score += 2
                reasons.append('persistent_negative_trajectory')

        # Determine level
        if complexity_score >= 8:
            level = 'expert'
        elif complexity_score >= 5:
            level = 'intermediate'
        elif complexity_score >= 2:
            level = 'basic'
        else:
            level = 'minimal'

        return {
            'level': level,
            'score': complexity_score,
            'reason': reasons[0] if reasons else 'general',
            'risk_factors': risk_factors
        }

    def _generate_professional_referral(self, complexity: Dict[str, Any]) -> str:
        """Generate personalized professional referral"""
        reason = complexity.get('reason', 'general')
        risk_factors = complexity.get('risk_factors', [])

        base_response = (
            "I hear the depth and complexity of what you're sharing, and while I'm here to support you through this moment, "
            "I want to be honest that this sounds like it would truly benefit from working with a licensed mental health professional. "
            "As an AI companion, I'm designed to provide immediate support and coping tools, but specialized care from a human therapist "
            "can offer the comprehensive therapeutic relationship and expertise you deserve."
        )

        referrals = {
            'trauma_history': (
                "Given what you've shared about trauma experiences, I recommend connecting with a therapist who specializes in trauma-informed care. "
                "Organizations like RAINN (rainn.org) or local trauma centers can help you find therapists trained in EMDR, somatic experiencing, or other trauma-focused therapies."
            ),
            'severe_mental_health': (
                "For complex mental health conditions, working with a psychiatrist or clinical psychologist would be most beneficial. "
                "They can provide both therapy and medication management if appropriate. Your primary care doctor can provide referrals."
            ),
            'substance_abuse': (
                "Substance use concerns often require integrated treatment approaches. Resources like SAMHSA's helpline (1-800-662-HELP) "
                "can connect you with local treatment centers, support groups like AA/NA, and therapists specializing in addiction recovery."
            ),
            'eating_disorder': (
                "Eating disorders need comprehensive medical and therapeutic care. Organizations like NEDA (nationaleatingdisorders.org) "
                "can help you find treatment centers and therapists with expertise in eating disorders, including medical monitoring and nutritional support."
            ),
            'chronic_suicidal_ideation': (
                "For ongoing thoughts of self-harm or suicide, immediate professional help is crucial. "
                "Please contact the National Suicide Prevention Lifeline at 988 (24/7), go to your nearest emergency room, "
                "or call 911 if you're in immediate danger. These services can provide immediate safety planning and connect you with ongoing care."
            ),
            'persistent_negative_trajectory': (
                "I notice you've been experiencing persistent difficult emotions. This suggests you might benefit from regular therapeutic support "
                "to develop coping strategies and work through what's been challenging you."
            ),
            'general': (
                "I recommend consulting with a licensed mental health professional who can provide personalized, in-depth therapy. "
                "You can find therapists through Psychology Today, your insurance provider, local mental health clinics, or by asking your primary care doctor for referrals."
            )
        }

        specific_referral = referrals.get(reason, referrals['general'])

        # Add immediate support
        immediate_support = ""
        if 'chronic_suicide' in risk_factors:
            immediate_support = " In the meantime, please know that these feelings can and do change with proper support."
        elif risk_factors:
            immediate_support = " While you explore these options, I'm here to listen and support you through this process."

        return f"{base_response}\n\n{specific_referral}{immediate_support}\n\nI'm still here to listen and support you right now. What's most pressing for you in this moment?"

    def _load_therapeutic_knowledge(self) -> Dict[str, List[str]]:
        """Load comprehensive therapeutic knowledge base"""
        return {
            'anxiety': [
                "Anxiety often feels like the body's alarm system going off when there's no real danger. The physical symptoms—racing heart, shallow breathing, muscle tension—are your body's way of preparing for fight or flight.",
                "When anxiety feels overwhelming, grounding techniques can help: Name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, and 1 you can taste.",
                "Anxiety thrives on 'what if' thinking. Try asking yourself: 'What evidence do I have that this worst-case scenario will happen?' and 'What evidence do I have that it won't?'"
            ],
            'depression': [
                "Depression can make everything feel heavy and gray, like you're carrying an invisible weight. It's not laziness—it's an illness that affects your energy, motivation, and ability to enjoy things.",
                "Small acts of self-care can help when depression feels overwhelming: a warm shower, a favorite song, a short walk, or calling a friend. These aren't cures, but they can provide momentary relief.",
                "Depression often lies to us, saying things like 'You'll always feel this way' or 'No one cares.' These are symptoms of the illness, not truths about you or your life."
            ],
            'relationships': [
                "Healthy relationships involve both giving and receiving support. It's okay to set boundaries and ask for what you need.",
                "Conflict in relationships is normal, but how we handle it matters. Using 'I' statements like 'I feel hurt when...' can help express feelings without blame.",
                "Sometimes relationships need to change or end for our well-being. This can be incredibly painful but also an act of self-love and growth."
            ],
            'grief': [
                "Grief is love with nowhere to go. It's the price we pay for loving deeply, and it comes in waves that can feel unpredictable and overwhelming.",
                "There's no 'right' way to grieve, and no timeline for healing. Be patient and compassionate with yourself as you navigate this difficult journey.",
                "Grief can bring up complicated emotions—sadness, anger, guilt, relief. All of these are normal and valid parts of the grieving process."
            ],
            'self_esteem': [
                "Your worth as a person isn't determined by your achievements, appearance, or what others think of you. You have inherent value simply because you exist.",
                "We often treat ourselves more harshly than we'd treat a friend. Try asking: 'Would I say this to someone I care about?' If not, consider speaking to yourself with more kindness.",
                "Building self-esteem is like building a muscle—it takes consistent practice. Celebrate small wins and be patient with yourself during setbacks."
            ],
            'stress': [
                "Stress is your body's response to demands that feel overwhelming. While some stress can motivate us, chronic stress can wear us down physically and emotionally.",
                "When stress feels unmanageable, breaking it down into smaller, actionable steps can help: What ONE thing can I do right now to feel more in control?",
                "Stress often comes from trying to control things outside our influence. Focus on what you CAN control—your responses, your self-care, your boundaries."
            ]
        }

    def _load_coping_strategies(self) -> Dict[str, List[str]]:
        """Load evidence-based coping strategies"""
        return {
            'immediate_relief': [
                "Take 5 slow, deep breaths, focusing on the sensation of air entering and leaving your body.",
                "Hold an ice cube in your hand until it melts, focusing on the cold sensation.",
                "Splash cold water on your face or hold your face in cold water for 30 seconds.",
                "Progressive muscle relaxation: Tense and release each muscle group from your toes to your head."
            ],
            'emotional_processing': [
                "Write down your thoughts and feelings without judgment, then read them back as if a friend wrote them.",
                "Create a 'worry time'—set aside 15 minutes to write down worries, then put them away until tomorrow.",
                "Use the '5-4-3-2-1' grounding technique: 5 things you see, 4 you touch, 3 you hear, 2 you smell, 1 you taste.",
                "Practice self-compassion: Speak to yourself as you would a dear friend going through the same experience."
            ],
            'long_term_resilience': [
                "Establish a consistent sleep schedule and create a calming bedtime routine.",
                "Regular physical activity—even 10 minutes of walking daily—can significantly improve mood.",
                "Build social connections by reaching out to one person daily, even if it's just a text.",
                "Practice gratitude by noting three things you're thankful for each day."
            ],
            'mindfulness_practices': [
                "Body scan meditation: Lie down and systematically focus attention on different parts of your body.",
                "Loving-kindness meditation: Send well-wishes to yourself, loved ones, and even difficult people.",
                "Mindful eating: Eat one meal without distractions, paying attention to taste, texture, and aroma.",
                "Walking meditation: Walk slowly, paying attention to each step and the sensations in your feet."
            ]
        }

    def _load_mindfulness_exercises(self) -> Dict[str, List[str]]:
        """Load guided mindfulness exercises"""
        return {
            'breathing': [
                "Find a comfortable position. Place one hand on your chest and one on your belly. Take a slow breath in through your nose for a count of 4, feeling your belly rise. Hold for 4. Exhale slowly through your mouth for 4, feeling your belly fall. Repeat 5 times.",
                "Try the 4-7-8 breathing technique: Inhale quietly through your nose for 4 seconds. Hold your breath for 7 seconds. Exhale completely through your mouth for 8 seconds. Repeat 4 times."
            ],
            'body_awareness': [
                "Sit comfortably and close your eyes. Starting from your toes, notice any sensations—tingling, warmth, pressure. Move slowly up through your body, simply observing without judgment. End by noticing your breath.",
                "Stand with feet shoulder-width apart. Feel the ground beneath your feet. Notice the weight distribution. Slowly shift your weight from one foot to the other, feeling the changing sensations."
            ],
            'present_moment': [
                "Choose an everyday activity like washing dishes or brushing your teeth. Focus completely on the sensations—the warmth of the water, the texture of the soap, the sound of scrubbing. When your mind wanders, gently bring it back.",
                "Look around and choose one object. Examine it as if seeing it for the first time—the colors, shapes, textures, shadows. Notice any feelings or memories it brings up."
            ]
        }

    async def _get_openai_response(self, user_input: str, context: Dict[str, Any]) -> Optional[str]:
        """Enhanced OpenAI integration with comprehensive therapeutic knowledge"""
        if not self.openai_client:
            return None

        try:
            # Enhanced system prompt with therapeutic expertise
            system_prompt = (
                "You are Melify, a highly skilled AI therapist with extensive training in multiple therapeutic modalities. "
                "You combine genuine human-like empathy with evidence-based therapeutic techniques. "
                "Your responses should feel natural and conversational, like speaking with a warm, experienced therapist.\n\n"
                "CORE PRINCIPLES:\n"
                "- Respond with deep empathy and validation\n"
                "- Use therapeutic techniques from CBT, DBT, ACT, and humanistic therapy\n"
                "- Maintain professional boundaries while being warmly human\n"
                "- Prioritize safety and ethical guidelines\n"
                "- Provide practical, actionable support\n"
                "- Reference previous conversation naturally\n"
                "- Ask thoughtful follow-up questions\n\n"
                "RESPONSE STYLE:\n"
                "- Natural, conversational language\n"
                "- Warm and genuine tone\n"
                "- Appropriate therapeutic depth\n"
                "- Include gentle humor when suitable\n"
                "- End with empowering messages\n\n"
                "SAFETY PROTOCOLS:\n"
                "- Crisis detection: Immediately provide resources and encourage professional help\n"
                "- Never diagnose or prescribe medication\n"
                "- Refer to specialists for complex cases\n"
                "- Maintain confidentiality and trust"
            )

            # Build comprehensive context
            emotional_state = context.get('emotional_state', 'neutral')
            themes = context.get('themes', [])
            vulnerability = context.get('vulnerability_level', 'low')
            strengths = context.get('strengths_indicators', [])
            coping = context.get('coping_strategies', [])

            # Conversation history with therapeutic insights
            conversation_history = ""
            if self.session_context['multi_turn_context']:
                recent_turns = self.session_context['multi_turn_context'][-4:]
                conversation_history = "\nRECENT CONVERSATION CONTEXT:\n" + "\n".join([
                    f"User: {turn['user']}\nTherapist: {turn['therapist']}\nIntent: {turn['intent']}"
                    for turn in recent_turns
                ])

            # Therapeutic assessment
            therapeutic_context = f"""
            CURRENT SESSION ASSESSMENT:
            - Emotional State: {emotional_state}
            - Key Themes: {', '.join(themes) if themes else 'None identified'}
            - Vulnerability Level: {vulnerability}
            - Identified Strengths: {', '.join(strengths) if strengths else 'None yet identified'}
            - Current Coping Strategies: {', '.join(coping) if coping else 'None mentioned'}
            - Risk Assessment: {self.session_context['risk_assessment']}
            - Session Duration: {(datetime.now() - self.session_context['start_time']).seconds // 60} minutes
            - Therapeutic Goals: {', '.join(self.session_context['therapeutic_goals']) if self.session_context['therapeutic_goals'] else 'Building rapport'}

            USER INPUT: "{user_input}"
            """

            # Knowledge base integration
            relevant_knowledge = self._get_relevant_knowledge(user_input, themes)
            knowledge_context = ""
            if relevant_knowledge:
                knowledge_context = f"\nRELEVANT THERAPEUTIC KNOWLEDGE:\n{relevant_knowledge[:500]}..."

            full_context = therapeutic_context + conversation_history + knowledge_context

            # Enhanced OpenAI call with better parameters
            response = await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: self.openai_client.ChatCompletion.create(
                    model="gpt-4",  # Use GPT-4 for better therapeutic responses
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": full_context}
                    ],
                    max_tokens=400,
                    temperature=0.8,  # Slightly higher for more natural variation
                    presence_penalty=0.1,  # Encourage new topics
                    frequency_penalty=0.1,  # Reduce repetition
                    top_p=0.9  # Balanced creativity
                )
            )

            ai_response = response.choices[0].message.content.strip()

            # Post-process for therapeutic quality
            ai_response = self._enhance_therapeutic_response(ai_response, context)

            return ai_response

        except Exception as e:
            print(f"[WARNING] OpenAI request failed: {e}")
            return None

    def _get_relevant_knowledge(self, user_input: str, themes: List[str]) -> Optional[str]:
        """Retrieve relevant therapeutic knowledge from local database"""
        if not self.knowledge_base:
            return None

        # Simple relevance scoring
        relevant_items = []
        input_lower = user_input.lower()

        for item in self.knowledge_base[:100]:  # Sample for efficiency
            item_lower = item.lower()
            relevance_score = 0

            # Keyword matching
            for theme in themes:
                if theme in item_lower:
                    relevance_score += 2

            # Direct text overlap
            input_words = set(input_lower.split())
            item_words = set(item_lower.split())
            overlap = len(input_words & item_words)
            relevance_score += overlap

            if relevance_score > 2:
                relevant_items.append((item, relevance_score))

        if relevant_items:
            # Return most relevant item
            relevant_items.sort(key=lambda x: x[1], reverse=True)
            return relevant_items[0][0]

        return None

    def _enhance_therapeutic_response(self, response: str, context: Dict[str, Any]) -> str:
        """Enhance AI response with additional therapeutic elements"""
        enhanced_response = response

        # Add therapeutic techniques if not present
        if "what do you think" not in response.lower() and "how does that feel" not in response.lower():
            if random.random() < 0.3:  # 30% chance to add therapeutic question
                therapeutic_questions = [
                    "What comes up for you when you hear that?",
                    "How does that land with you?",
                    "What would be most helpful for you right now?",
                    "What are you noticing in your body as we talk about this?"
                ]
                enhanced_response += " " + random.choice(therapeutic_questions)

        # Add validation if emotional content detected
        emotional_state = context.get('emotional_state', 'neutral')
        if emotional_state != 'neutral' and 'I hear' not in response.lower()[:50]:
            validation_phrases = [
                f"I can really hear how {emotional_state} you're feeling.",
                f"That sounds really {emotional_state}—thank you for sharing that with me.",
                f"I hear the {emotional_state} in what you're saying."
            ]
            enhanced_response = random.choice(validation_phrases) + " " + enhanced_response

        # Ensure appropriate length
        if len(enhanced_response.split()) > 150:
            sentences = enhanced_response.split('. ')
            enhanced_response = '. '.join(sentences[:3]) + '.'

        return enhanced_response

    def _generate_therapeutic_response(self, user_input: str, analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Generate comprehensive therapeutic response"""
        emotion = analysis.get('emotional_state', 'neutral')
        themes = analysis.get('themes', [])
        vuln = analysis.get('vulnerability_level', 'low')

        # Use deep learning for intent
        predicted_intent = self._predict_intent(user_input)

        # Get base responses
        intent_responses = [r for t, r in self.response_data if t == predicted_intent]
        if intent_responses:
            response = random.choice(intent_responses)
        else:
            # Fallback to therapeutic generation
            modality = self._select_modality(emotion, themes)
            empathy = self._generate_empathy(emotion, themes, vuln)
            technique = self._get_therapeutic_technique(modality, emotion, themes)
            follow_up = self._generate_follow_up(emotion, themes, analysis)

            response = f"{empathy}\n\n{technique}\n\n{follow_up}"

        return {'response': response, 'technique': predicted_intent}

    def _generate_empathy(self, emotion: str, themes: List[str], vulnerability: str) -> str:
        """Generate natural, human-like empathy"""
        empathy_parts = []

        # Emotional resonance
        if emotion == 'sad':
            empathy_parts.append("I can really hear the sadness in what you're sharing—it sounds heavy and painful.")
        elif emotion == 'anxious':
            empathy_parts.append("I can feel the anxiety you're experiencing; it sounds really intense and overwhelming.")
        elif emotion == 'angry':
            empathy_parts.append("I hear the anger in your words, and it makes sense that you'd feel this way given what's happened.")
        elif emotion == 'depressed':
            empathy_parts.append("The depression you're describing sounds profoundly exhausting and isolating.")
        elif emotion == 'greeting':
            empathy_parts.append("I'm glad you've reached out—it's brave to share what's on your mind.")
        else:
            empathy_parts.append("I hear you, and what you're sharing matters to me.")

        # Theme-specific empathy
        if 'work_stress' in themes:
            empathy_parts.append("Work pressure can really drain your energy and spirit.")
        if 'relationships' in themes:
            empathy_parts.append("Relationship challenges can cut deep and affect every part of our lives.")
        if 'self_esteem' in themes:
            empathy_parts.append("Those inner critic voices can be so relentless and harsh.")
        if 'trauma' in themes:
            empathy_parts.append("Trauma can leave lasting imprints that shape how we see ourselves and the world.")

        # Vulnerability consideration
        if vulnerability == 'high':
            empathy_parts.append("Many people experience similar feelings, and you're not alone in this.")
        elif vulnerability == 'medium':
            empathy_parts.append("It's understandable to feel this way given everything.")

        # Human-like connection
        connection_phrases = [
            "I'm here with you in this moment.",
            "I want you to know I'm listening without judgment.",
            "Your feelings are completely valid here.",
            "Thank you for trusting me with this."
        ]
        empathy_parts.append(random.choice(connection_phrases))

        return " ".join(empathy_parts)

    def _select_modality(self, emotion: str, themes: List[str]) -> str:
        """Select appropriate therapeutic modality"""
        if 'trauma' in themes:
            return 'dbt'
        elif emotion in ['anxious', 'stressed']:
            return 'mindfulness'
        elif emotion in ['depressed', 'sad']:
            return 'cbt'
        elif 'self_esteem' in themes or 'personal_growth' in themes:
            return 'humanistic'
        else:
            return 'act'

    def _get_therapeutic_technique(self, modality: str, emotion: str, themes: List[str]) -> str:
        """Get therapeutic technique based on modality"""
        if modality not in self.therapeutic_modalities:
            return "Let's explore this together—what feels most important to address right now?"

        info = self.therapeutic_modalities[modality]
        techniques = info.get('techniques', [])
        if techniques:
            technique = random.choice(techniques)
            return f"From a {info['name']} perspective: {technique}"
        else:
            return f"From a {info['name']} perspective, let's work on this together."

    def _generate_follow_up(self, emotion: str, themes: List[str], analysis: Dict[str, Any]) -> str:
        """Generate natural follow-up questions"""
        questions = {
            'sad': [
                "What would help lift your spirits, even just a little?",
                "Is there someone or something that usually brings you comfort?",
                "What does this sadness tell you about what you might need right now?"
            ],
            'anxious': [
                "What are you noticing in your body when this anxiety comes up?",
                "What coping strategies have helped you in the past?",
                "If we could wave a magic wand, what would feel different for you?"
            ],
            'angry': [
                "What do you think is at the root of these feelings?",
                "How would you like to handle this situation?",
                "What would it look like to feel more empowered here?"
            ],
            'depressed': [
                "What small step might you be willing to take today?",
                "What usually helps when you're feeling this way?",
                "What matters most to you, even in this difficult moment?"
            ],
            'relationships': [
                "How has this been affecting your connection with others?",
                "What do you need most from the people in your life right now?",
                "How can I best support you with this relationship challenge?"
            ],
            'work_stress': [
                "Which part of work feels most overwhelming right now?",
                "What boundaries might you need to set?",
                "How can you bring more balance into your work life?"
            ],
            'self_esteem': [
                "What evidence might contradict those harsh self-judgments?",
                "If your best friend were in this situation, what would you tell them?",
                "What would it look like to treat yourself with the same kindness?"
            ],
            'default': [
                "What feels most important to explore right now?",
                "How has this been affecting you day to day?",
                "What would be most helpful for you in this moment?"
            ]
        }

        # Theme priority
        for theme in themes:
            if theme in questions:
                return random.choice(questions[theme])

        if emotion in questions:
            return random.choice(questions[emotion])

        return random.choice(questions['default'])

    def _update_multi_turn_context(self, user_input: str, response: str, intent: str):
        """Update conversation context for natural flow"""
        self.session_context['multi_turn_context'].append({
            'user': user_input,
            'therapist': response,
            'intent': intent,
            'timestamp': datetime.now()
        })

        # Keep last 5 turns for context
        if len(self.session_context['multi_turn_context']) > 5:
            self.session_context['multi_turn_context'].pop(0)

    def _check_crisis(self, user_input: str, analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Enhanced crisis detection"""
        risk = analysis.get('risk_indicators', {})
        if risk.get('level') in ('high', 'extreme'):
            kind = (risk.get('indicators') or ['severe_distress'])[0]
            if kind in self.crisis_protocols:
                proto = self.crisis_protocols[kind]
            else:
                proto = self.crisis_protocols['severe_distress']
            return {'is_crisis': True, 'response': proto['response_template']}
        return {'is_crisis': False}

    async def process_user_input(self, user_input: str) -> Dict[str, Any]:
        """Main processing function with OpenAI integration"""
        start_time = time.time()
        analysis = self._analyze_input(user_input)

        # Crisis check first
        crisis = self._check_crisis(user_input, analysis)
        if crisis['is_crisis']:
            response = crisis['response']
            technique = 'crisis_intervention'
        else:
            # Check complexity
            complexity = self._assess_case_complexity(user_input, analysis)
            if complexity['level'] == 'expert':
                response = self._generate_professional_referral(complexity)
                technique = 'professional_referral'
            else:
                # Try OpenAI for natural response
                openai_response = await self._get_openai_response(user_input, analysis)
                if openai_response:
                    response = openai_response
                    technique = 'openai_enhanced'
                else:
                    # Fallback to local model
                    therapeutic = self._generate_therapeutic_response(user_input, analysis)
                    response = therapeutic['response']
                    technique = therapeutic.get('technique', 'therapeutic')

        # Update context
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
            'response_time': time.time() - start_time,
            'complexity_assessment': complexity if 'complexity' in locals() else None
        }

    def _analyze_input(self, text: str) -> Dict[str, Any]:
        """Enhanced input analysis"""
        return {
            'emotional_state': self._detect_emotion(text),
            'themes': self._identify_themes(text),
            'risk_indicators': self._assess_risk(text),
            'communication_style': self._communication_style(text),
            'vulnerability_level': self._vulnerability(text),
            'strengths_indicators': self._identify_strengths(text),
            'coping_strategies': self._identify_coping(text)
        }

    def _detect_emotion(self, text: str) -> str:
        """Enhanced emotion detection"""
        t = text.lower().strip()

        # Greeting detection
        greetings = ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening']
        if t in greetings or any(t.startswith(g) for g in greetings):
            return 'greeting'

        # Emotion patterns with intensity
        patterns = {
            'depressed': ['hopeless', 'worthless', 'empty', 'numb', "can't go on", 'nothing matters', 'pointless'],
            'anxious': ['worried', 'anxious', 'scared', 'panicking', 'overwhelmed', "can't breathe", 'terrified', 'racing thoughts'],
            'angry': ['angry', 'furious', 'rage', 'betrayed', 'unfair', 'frustrated', 'irritated'],
            'sad': ['sad', 'heartbroken', 'lonely', 'disappointed', 'down', 'blue', 'grieving'],
            'stressed': ['stressed', 'overwhelmed', 'burned out', 'exhausted', 'pressure'],
            'confused': ['confused', 'lost', 'unsure', 'uncertain', 'mixed feelings'],
            'hopeful': ['hopeful', 'optimistic', 'better', 'improving', 'grateful']
        }

        scores = {k: sum(p in t for p in v) for k, v in patterns.items()}
        if any(scores.values()):
            return max(scores, key=scores.get)
        return 'neutral'

    def _identify_themes(self, text: str) -> List[str]:
        """Enhanced theme identification"""
        t = text.lower()
        themes = {
            'relationships': ['relationship', 'partner', 'breakup', 'family', 'friend', 'love', 'marriage', 'divorce'],
            'work_stress': ['work', 'job', 'boss', 'deadline', 'burnout', 'career', 'colleague', 'performance'],
            'self_esteem': ['worthless', 'failure', 'not good enough', 'unlovable', 'inadequate', 'self-doubt'],
            'trauma': ['trauma', 'abuse', 'assault', 'loss', 'grief', 'ptsd', 'flashbacks'],
            'anxiety_disorders': ['panic attack', 'phobia', 'ocd', 'generalized anxiety', 'social anxiety'],
            'depression': ['depressed', 'hopeless', 'suicidal', 'low mood', 'lack of interest'],
            'health': ['illness', 'chronic pain', 'medical', 'diagnosis', 'treatment'],
            'identity': ['identity', 'gender', 'sexual orientation', 'coming out', 'self-discovery'],
            'addiction': ['addiction', 'substance', 'alcohol', 'drugs', 'recovery', 'relapse'],
            'spirituality': ['spiritual', 'faith', 'religion', 'meaning', 'purpose', 'meditation']
        }

        found = []
        for k, kws in themes.items():
            if any(kw in t for kw in kws):
                found.append(k)

        return found[:4]  # Limit to most relevant

    def _assess_risk(self, text: str) -> Dict[str, Any]:
        """Enhanced risk assessment"""
        t = text.lower()
        indicators = []
        risk_score = 0

        # Crisis indicators
        crisis_patterns = {
            'suicidal_ideation': ['suicide', 'kill myself', 'want to die', 'end it all', 'better off dead'],
            'self_harm': ['cut myself', 'self harm', 'hurt myself', 'burn myself', 'scratch myself'],
            'severe_distress': ['can\'t go on', 'breaking point', 'losing control', 'falling apart', 'end everything']
        }

        for crisis_type, keywords in crisis_patterns.items():
            if any(k in t for k in keywords):
                indicators.append(crisis_type)
                risk_score += 3 if crisis_type == 'suicidal_ideation' else 2

        # Contextual risk factors
        if 'chronic' in t or 'always' in t or 'never' in t:
            risk_score += 1

        if 'plan' in t and any(word in t for word in ['suicide', 'harm', 'kill']):
            risk_score += 2

        level = 'low'
        if risk_score >= 5:
            level = 'extreme'
        elif risk_score >= 3:
            level = 'high'
        elif risk_score >= 1:
            level = 'medium'

        return {'level': level, 'indicators': indicators, 'score': risk_score}

    def _communication_style(self, text: str) -> str:
        """Analyze communication style"""
        wc = len(text.split())
        if wc < 5:
            return 'brief'
        elif '?' in text:
            return 'questioning'
        elif wc > 50:
            return 'detailed'
        elif any(word in text.lower() for word in ['feel', 'emotion', 'think', 'believe']):
            return 'reflective'
        else:
            return 'narrative'

    def _vulnerability(self, text: str) -> str:
        """Assess vulnerability level"""
        t = text.lower()
        vulnerability_indicators = [
            'never told this', 'ashamed', 'embarrassed', 'vulnerable', 'exposed',
            'scared to say', 'hard to admit', 'personal', 'private'
        ]

        if any(indicator in t for indicator in vulnerability_indicators):
            return 'high'

        moderate_indicators = ['worried', 'overwhelmed', 'struggling', 'difficult', 'challenging']
        if any(indicator in t for indicator in moderate_indicators):
            return 'medium'

        return 'low'

    def _identify_strengths(self, text: str) -> List[str]:
        """Identify user strengths and resources"""
        t = text.lower()
        strengths = []

        strength_indicators = {
            'resilience': ['kept going', 'survived', 'overcame', 'persisted', 'resilient'],
            'social_support': ['friends', 'family', 'support', 'someone to talk to', 'community'],
            'coping_skills': ['exercise', 'meditation', 'journaling', 'therapy', 'hobbies'],
            'self_awareness': ['noticed', 'realized', 'learned', 'growing', 'changing'],
            'help_seeking': ['asking for help', 'reaching out', 'seeking support', 'professional help']
        }

        for strength, keywords in strength_indicators.items():
            if any(kw in t for kw in keywords):
                strengths.append(strength)

        return strengths

    def _identify_coping(self, text: str) -> List[str]:
        """Identify current coping strategies"""
        t = text.lower()
        coping = []

        coping_strategies = {
            'breathing': ['deep breaths', 'breathing exercises', 'breathe'],
            'distraction': ['watch tv', 'listen to music', 'walk', 'exercise'],
            'social': ['talk to friend', 'call family', 'support group'],
            'cognitive': ['positive thoughts', 'reframing', 'challenging thoughts'],
            'self_care': ['sleep', 'eat well', 'shower', 'relax']
        }

        for strategy, keywords in coping_strategies.items():
            if any(kw in t for kw in keywords):
                coping.append(strategy)

        return coping

    def _update_context(self, analysis: Dict[str, Any]):
        """Update session context with analysis"""
        emotion = analysis.get('emotional_state', 'neutral')
        self.session_context['emotional_trajectory'].append({
            'emotion': emotion,
            'timestamp': datetime.now(),
            'themes': analysis.get('themes', []),
            'strengths': analysis.get('strengths_indicators', []),
            'coping': analysis.get('coping_strategies', [])
        })

        risk = analysis.get('risk_indicators', {}).get('level', 'low')
        if risk != 'low':
            self.session_context['risk_assessment'] = risk

        for theme in analysis.get('themes', []):
            if theme not in self.session_context['therapeutic_goals']:
                self.session_context['therapeutic_goals'].append(theme)

    def listen_speech(self) -> Optional[str]:
        """Enhanced speech recognition"""
        if not SPEECH_AVAILABLE or not self.recognizer:
            print("[WARNING] Speech recognition not available")
            return None

        try:
            with sr.Microphone() as source:
                print("[LISTENING] I'm listening... speak naturally")
                self.recognizer.adjust_for_ambient_noise(source, duration=0.5)
                audio = self.recognizer.listen(source, timeout=8, phrase_time_limit=10)

                print("[PROCESSING] Understanding your words...")
                text = self.recognizer.recognize_google(audio)
                print(f"[HEARD] '{text}'")
                return text

        except sr.WaitTimeoutError:
            print("[TIMEOUT] I didn't hear anything. Feel free to try again.")
            return None
        except sr.UnknownValueError:
            print("[UNCLEAR] I couldn't understand that clearly. Could you say it again?")
            return None
        except sr.RequestError as e:
            print(f"[ERROR] Speech recognition service error: {e}")
            return None
        except Exception as e:
            print(f"[ERROR] Speech processing failed: {e}")
            return None

    def speak_response(self, text: str):
        """Enhanced text-to-speech with therapeutic pacing"""
        if not SPEECH_AVAILABLE or not self.tts_engine:
            print("[WARNING] Text-to-speech not available")
            return

        try:
            # Configure for therapeutic delivery
            self.tts_engine.setProperty('rate', 165)  # Natural therapeutic pace
            self.tts_engine.setProperty('volume', 0.85)

            # Handle long responses with natural pauses
            if len(text) > 300:
                sentences = text.split('. ')
                for i, sentence in enumerate(sentences):
                    if sentence.strip():
                        self.tts_engine.say(sentence.strip())
                        if i < len(sentences) - 1:
                            self.tts_engine.runAnd_wait()
                            time.sleep(0.8)  # Therapeutic pause
            else:
                self.tts_engine.say(text)

            self.tts_engine.runAndWait()

        except Exception as e:
            print(f"[ERROR] Text-to-speech failed: {e}")
            print(f"[FALLBACK] Response: {text}")

    def get_session_summary(self) -> Dict[str, Any]:
        """Comprehensive session summary"""
        if not self.session_context['emotional_trajectory']:
            return {'status': 'no_session_data'}

        total_exchanges = len(self.session_context['emotional_trajectory'])
        duration = (datetime.now() - self.session_context['start_time']).total_seconds() / 60.0

        # Analyze emotional trajectory
        emotions = [entry['emotion'] for entry in self.session_context['emotional_trajectory']]
        emotion_counts = {}
        for emotion in emotions:
            emotion_counts[emotion] = emotion_counts.get(emotion, 0) + 1

        # Theme analysis
        all_themes = []
        for entry in self.session_context['emotional_trajectory']:
            all_themes.extend(entry.get('themes', []))
        theme_counts = {}
        for theme in all_themes:
            theme_counts[theme] = theme_counts.get(theme, 0) + 1

        # Strengths and coping analysis
        all_strengths = []
        all_coping = []
        for entry in self.session_context['emotional_trajectory']:
            all_strengths.extend(entry.get('strengths', []))
            all_coping.extend(entry.get('coping', []))

        return {
            'session_duration_minutes': duration,
            'total_exchanges': total_exchanges,
            'emotional_distribution': emotion_counts,
            'theme_analysis': theme_counts,
            'identified_strengths': list(set(all_strengths)),
            'coping_strategies': list(set(all_coping)),
            'risk_assessment': self.session_context['risk_assessment'],
            'therapeutic_goals': self.session_context['therapeutic_goals'],
            'conversation_style': self.session_context.get('conversation_style', 'natural')
        }

def main():
    """Main function with async support"""
    print("[MELIFY ADVANCED] Advanced AI Therapist")
    print("=" * 60)
    print("   - Deep Learning + OpenAI Integration")
    print("   - Human-like Natural Conversations")
    print("   - Comprehensive Knowledge Base")
    print("   - Real-time Emotional Intelligence")
    print("   - Professional Therapeutic Standards")
    print("=" * 60)

    # Get OpenAI key if available
    openai_key = input("Enter OpenAI API key (or press Enter to use local model only): ").strip()
    if not openai_key:
        openai_key = None

    therapist = MelifyAdvancedTherapist(openai_api_key=openai_key)

    voice_mode = input("Enable voice mode? (y/n): ").lower().strip() == 'y'

    async def run_session():
        while True:
            try:
                if voice_mode:
                    user_input = therapist.listen_speech()
                    if not user_input:
                        continue
                else:
                    user_input = input("\n[USER] You: ").strip()

                if user_input and user_input.lower() in ('quit', 'exit', 'bye', 'goodbye'):
                    summary = therapist.get_session_summary()
                    farewell = (
                        "Thank you for sharing your journey with me today. "
                        "Remember that healing is a process, and every step forward matters. "
                        "Take gentle care of yourself, and know that you have inner strength and resilience. "
                        "I'm here whenever you need me again."
                    )
                    print(f"\n[THERAPIST] {farewell}")
                    if voice_mode:
                        therapist.speak_response(farewell)

                    print("\n[SESSION SUMMARY]")
                    print(f"Duration: {summary['session_duration_minutes']:.1f} minutes")
                    print(f"Exchanges: {summary['total_exchanges']}")
                    print(f"Risk Level: {summary['risk_assessment']}")
                    if summary['emotional_distribution']:
                        print(f"Emotional Journey: {summary['emotional_distribution']}")
                    if summary['theme_analysis']:
                        print(f"Key Themes: {summary['theme_analysis']}")
                    break

                if not user_input:
                    continue

                # Process input asynchronously
                result = await therapist.process_user_input(user_input)

                print(f"\n[THERAPIST] {result['response']}")
                print(f"[TECHNIQUE] {result['technique_used'].replace('_', ' ').title()}")
                print(f"[TIME] {result['response_time']:.2f}s")

                if voice_mode:
                    therapist.speak_response(result['response'])

            except KeyboardInterrupt:
                print("\n[GOODBYE] Session ended. Take care!")
                break
            except Exception as e:
                print(f"[ERROR] Processing error: {e}")
                error_msg = "I'm experiencing a technical issue. Let's try again or continue our conversation."
                print(f"[THERAPIST] {error_msg}")
                if voice_mode:
                    therapist.speak_response(error_msg)
                continue

    # Run async session
    asyncio.run(run_session())

if __name__ == "__main__":
    main()
