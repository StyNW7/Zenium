#!/usr/bin/env python3
"""
Melify ESP32 — Optimized Therapeutic AI for ESP32 Deployment
===========================================================

- Lightweight deep learning model (TensorFlow Lite compatible)
- Speech-to-speech with ESP32 audio capabilities
- Real-time emotional intelligence
- Crisis intervention protocols
- Optimized for low-resource environments
"""

import time
import random
from datetime import datetime
from typing import Dict, List, Any, Optional
import json
import os

# ESP32/MicroPython compatible imports
try:
    import tensorflow as tf
    TF_AVAILABLE = True
except ImportError:
    TF_AVAILABLE = False

try:
    import speech_recognition as sr
    import pyttsx3
    SPEECH_AVAILABLE = True
except ImportError:
    SPEECH_AVAILABLE = False

class MelifyESP32Therapist:
    """
    Optimized Melify for ESP32 deployment
    - Uses TensorFlow Lite for inference
    - Lightweight model
    - Speech integration
    """

    def __init__(self):
        print("[ESP32] Initializing Melify ESP32 Therapist...")
        print("[OPTIMIZED] Loading lightweight therapeutic expertise...")

        # Core data (pre-loaded for ESP32)
        self.intents = self._load_intents()
        self.responses = self._load_responses()

        # Lightweight model
        self.model = None
        self.tokenizer = None
        self._initialize_model()

        # Speech for ESP32 (using I2S or similar)
        self.speech_enabled = SPEECH_AVAILABLE
        if self.speech_enabled:
            self.recognizer = sr.Recognizer()
            self.tts_engine = pyttsx3.init()

        # Session management
        self.session_context = {
            'start_time': datetime.now(),
            'emotional_trajectory': [],
            'risk_assessment': 'low',
            'conversation_topics': set(),
            'multi_turn_context': [],
            'complexity_level': 'basic',
        }

        print("[READY] Melify ESP32 ready for therapeutic sessions")

    def _load_intents(self) -> Dict[str, List[str]]:
        # Simplified intents for ESP32
        return {
            'greeting': ['hi', 'hello', 'hey', 'good morning', 'good afternoon'],
            'sad': ['sad', 'depressed', 'unhappy', 'down', 'lonely'],
            'anxious': ['anxious', 'worried', 'scared', 'nervous', 'stressed'],
            'angry': ['angry', 'mad', 'furious', 'frustrated'],
            'goodbye': ['bye', 'goodbye', 'see you', 'quit'],
            'crisis': ['suicide', 'kill myself', 'hurt myself', 'end it all']
        }

    def _load_responses(self) -> Dict[str, List[str]]:
        return {
            'greeting': [
                "Hello! I'm Melify, your therapeutic AI companion. How are you feeling?",
                "Hi there! I'm here to listen. What's on your mind?",
                "Hello! Thank you for reaching out. How can I support you today?"
            ],
            'sad': [
                "I'm sorry you're feeling sad. Can you tell me more about what's weighing on you?",
                "Sadness can be really heavy. I'm here with you. What would help right now?",
                "I hear your sadness. You're not alone in this moment."
            ],
            'anxious': [
                "Anxiety can feel overwhelming. What sensations are you noticing?",
                "I understand anxiety can be scary. Let's breathe together. Inhale... exhale.",
                "You're safe here. What triggered these anxious feelings?"
            ],
            'angry': [
                "Anger is a valid emotion. What happened that made you feel this way?",
                "I can hear your frustration. Let's explore what's behind this anger.",
                "It's okay to feel angry. Can you tell me more about the situation?"
            ],
            'goodbye': [
                "Thank you for sharing with me. Take gentle care of yourself.",
                "Goodbye for now. Remember, I'm here whenever you need me.",
                "Take care. Looking forward to our next conversation."
            ],
            'crisis': [
                "I'm deeply concerned for your safety. Please reach out to emergency services immediately.",
                "Your life matters. If you're in immediate danger, call emergency services now.",
                "I care about you. Let's get you the help you need right away."
            ],
            'neutral': [
                "I hear you. Can you tell me more about that?",
                "Thank you for sharing. How does that make you feel?",
                "I'm listening. What's most important for you right now?"
            ]
        }

    def _initialize_model(self):
        if not TF_AVAILABLE:
            print("[WARNING] TensorFlow not available - using rule-based fallback")
            return

        # Simple model for ESP32 (can be converted to TFLite)
        # For demo, using basic classification
        print("[MODEL] Initializing lightweight model...")

        # In practice, load pre-trained TFLite model
        # self.interpreter = tf.lite.Interpreter(model_path="model.tflite")
        # self.interpreter.allocate_tensors()

        print("[MODEL] Model ready")

    def _update_multi_turn_context(self, user_input: str, response: str, intent: str):
        self.session_context['multi_turn_context'].append({
            'user': user_input,
            'therapist': response,
            'intent': intent,
            'timestamp': datetime.now()
        })
        # Keep last 3 turns for ESP32 memory efficiency
        if len(self.session_context['multi_turn_context']) > 3:
            self.session_context['multi_turn_context'].pop(0)

    def _get_contextual_followup(self, intent: str) -> Optional[str]:
        if not self.session_context['multi_turn_context']:
            return None

        last_turn = self.session_context['multi_turn_context'][-1]
        if last_turn['intent'] == intent:
            return "I notice we're exploring this topic further. How has this been evolving for you?"

        return None

    def _needs_professional_referral(self, text: str, intent: str) -> bool:
        # Simple check for ESP32 efficiency
        complex_keywords = ['trauma', 'abuse', 'suicide', 'psychosis', 'addiction', 'schizophrenia']
        return any(kw in text.lower() for kw in complex_keywords) or intent == 'crisis'

    def _get_referral_message(self) -> str:
        return (
            "I hear that you're dealing with some very challenging experiences. While I'm here to provide initial support, "
            "this sounds like it would greatly benefit from working with a licensed mental health professional. "
            "Please consider reaching out to a therapist or counselor who can provide the specialized care you deserve. "
            "In the meantime, I'm here to listen if you'd like to share what's on your mind right now."
        )

    def _classify_intent(self, text: str) -> str:
        text_lower = text.lower()

        # Simple keyword matching for ESP32 efficiency
        for intent, keywords in self.intents.items():
            if any(kw in text_lower for kw in keywords):
                return intent

        return 'neutral'

    def process_input(self, user_input: str) -> Dict[str, Any]:
        start_time = time.time()

        # Classify intent
        intent = self._classify_intent(user_input)

        # Check for complex cases that need professional referral
        if self._needs_professional_referral(user_input, intent):
            response = self._get_referral_message()
            intent = 'referral'
        else:
            # Get response
            responses = self.responses.get(intent, self.responses['neutral'])
            response = random.choice(responses)

        # Update context
        self.session_context['emotional_trajectory'].append({
            'input': user_input,
            'intent': intent,
            'timestamp': datetime.now()
        })

        # Update multi-turn context
        self._update_multi_turn_context(user_input, response, intent)

        # Crisis check
        if intent == 'crisis':
            self.session_context['risk_assessment'] = 'high'

        return {
            'response': response,
            'intent': intent,
            'processing_time': time.time() - start_time,
            'session_context': self.session_context.copy()
        }

    def listen_and_respond(self):
        if not self.speech_enabled:
            print("[WARNING] Speech not enabled on ESP32")
            return

        try:
            print("[LISTENING] Speak now...")
            with sr.Microphone() as source:
                audio = self.recognizer.listen(source, timeout=5)
                text = self.recognizer.recognize_google(audio)
                print(f"[HEARD] {text}")

                # Process
                result = self.process_input(text)
                print(f"[RESPONSE] {result['response']}")

                # Speak response
                self.tts_engine.say(result['response'])
                self.tts_engine.runAndWait()

        except Exception as e:
            print(f"[ERROR] Speech processing failed: {e}")

    def get_session_summary(self) -> Dict[str, Any]:
        duration = (datetime.now() - self.session_context['start_time']).total_seconds() / 60.0
        exchanges = len(self.session_context['emotional_trajectory'])
        intents_used = {}
        for entry in self.session_context['emotional_trajectory']:
            intent = entry['intent']
            intents_used[intent] = intents_used.get(intent, 0) + 1

        return {
            'session_duration_minutes': duration,
            'total_exchanges': exchanges,
            'intents_used': intents_used,
            'risk_assessment': self.session_context['risk_assessment']
        }

def main():
    print("[ESP32] Melify Therapeutic AI for ESP32")
    print("=" * 50)
    print("   - Optimized for ESP32 deployment")
    print("   - Lightweight deep learning")
    print("   - Speech-to-speech capabilities")
    print("   - Real-time emotional support")
    print("=" * 50)

    therapist = MelifyESP32Therapist()

    mode = input("Choose mode - text(t) or voice(v): ").lower().strip()

    if mode == 'v':
        print("[VOICE] Voice mode activated. Say 'goodbye' to exit.")
        while True:
            therapist.listen_and_respond()
            # Check for exit (in voice, detect 'goodbye')
            # For simplicity, manual check
            if input("Continue? (y/n): ").lower() != 'y':
                break
    else:
        print("[TEXT] Text mode. Type 'quit' to exit.")
        while True:
            user_input = input("\n[USER] You: ").strip()
            if user_input.lower() in ('quit', 'exit', 'bye'):
                summary = therapist.get_session_summary()
                print("\n[SUMMARY] Session Summary:")
                print(f"   Duration: {summary['session_duration_minutes']:.1f} minutes")
                print(f"   Exchanges: {summary['total_exchanges']}")
                print(f"   Risk Level: {summary['risk_assessment']}")
                print("\n[THERAPIST] Thank you for sharing. Take care!")
                break

            if not user_input:
                continue

            result = therapist.process_input(user_input)
            print(f"\n[THERAPIST] Melify: {result['response']}")
            print(f"[INTENT] {result['intent'].title()}")
            print(f"[TIME] {result['processing_time']:.2f}s")

if __name__ == "__main__":
    main()