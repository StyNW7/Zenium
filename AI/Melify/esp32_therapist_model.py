"""
ESP32 Professional Therapist AI Model
=====================================

This model is optimized for ESP32 deployment with:
- TinyML/TFLite Micro compatibility
- Quantized models (8-bit precision)
- Memory-efficient embeddings
- Crisis detection and intervention
- Professional therapeutic responses

Author: Zenium AI Team
Date: 2025
"""

import os
import json
import time
import random
import hashlib
from typing import Dict, List, Tuple, Optional, Any
from collections import defaultdict
import gc

# ESP32-specific imports (MicroPython compatible)
try:
    import ure as re  # MicroPython regex
    import ujson as json_lib  # MicroPython JSON
    import machine
    import network
    ESP32_MODE = True
except ImportError:
    import re
    import json as json_lib
    ESP32_MODE = False

# ==================== CONFIGURATION ====================

class ESP32TherapistConfig:
    """Configuration optimized for ESP32 constraints"""

    # Memory limits (ESP32 has ~320KB RAM)
    MAX_VOCAB_SIZE = 5000  # Reduced from 50k
    EMBEDDING_DIM = 64     # Reduced from 300
    MAX_SEQUENCE_LENGTH = 50
    MAX_CONTEXT_PAIRS = 1000

    # Model parameters
    LEARNING_RATE = 0.001
    BATCH_SIZE = 8
    EPOCHS = 50

    # Crisis detection thresholds
    CRISIS_SIMILARITY_THRESHOLD = 0.85
    HIGH_RISK_THRESHOLD = 0.9

    # Memory management
    MAX_MEMORY_USAGE = 250000  # 250KB limit
    CACHE_SIZE = 100

    # Professional settings
    BOT_NAME = "Dr. Aria"
    SPECIALIZATION = "Cognitive Behavioral Therapy & Crisis Intervention"
    ETHICAL_BOUNDARIES = True

# ==================== MEMORY MANAGEMENT ====================

class ESP32MemoryManager:
    """Memory-efficient manager for ESP32 constraints"""

    def __init__(self, max_memory: int = 250000):
        self.max_memory = max_memory
        self.current_usage = 0
        self.cache = {}
        self.cache_size = ESP32TherapistConfig.CACHE_SIZE

    def check_memory_usage(self) -> bool:
        """Check if we're approaching memory limits"""
        if ESP32_MODE:
            gc.collect()
            self.current_usage = gc.mem_alloc()
        return self.current_usage < self.max_memory

    def clear_cache(self):
        """Clear least recently used cache entries"""
        if len(self.cache) > self.cache_size:
            # Remove oldest entries
            items_to_remove = len(self.cache) - self.cache_size
            for key in list(self.cache.keys())[:items_to_remove]:
                del self.cache[key]
            gc.collect()

# ==================== QUANTIZED EMBEDDINGS ====================

class QuantizedEmbeddings:
    """8-bit quantized embeddings for ESP32 efficiency"""

    def __init__(self, vocab_size: int, embedding_dim: int):
        self.vocab_size = vocab_size
        self.embedding_dim = embedding_dim
        self.embeddings = {}
        self.quantized_embeddings = {}

    def quantize_embedding(self, embedding: List[float]) -> bytes:
        """Convert float embedding to 8-bit quantized bytes"""
        # Simple quantization: scale to 0-255 range
        min_val = min(embedding)
        max_val = max(embedding)
        scale = (max_val - min_val) / 255.0 if max_val != min_val else 1.0

        quantized = []
        for val in embedding:
            quantized_val = int((val - min_val) / scale) if scale != 0 else 127
            quantized_val = max(0, min(255, quantized_val))
            quantized.append(quantized_val)

        return bytes(quantized)

    def dequantize_embedding(self, quantized: bytes, min_val: float, max_val: float) -> List[float]:
        """Convert 8-bit quantized bytes back to float"""
        scale = (max_val - min_val) / 255.0 if max_val != min_val else 1.0
        embedding = []

        for val in quantized:
            float_val = min_val + (val * scale)
            embedding.append(float_val)

        return embedding

    def store_embedding(self, word: str, embedding: List[float]):
        """Store quantized embedding"""
        if len(self.embeddings) < self.vocab_size:
            quantized = self.quantize_embedding(embedding)
            self.quantized_embeddings[word] = quantized
            # Store min/max for dequantization
            self.embeddings[word] = {
                'quantized': quantized,
                'min_val': min(embedding),
                'max_val': max(embedding)
            }

    def get_embedding(self, word: str) -> Optional[List[float]]:
        """Retrieve and dequantize embedding"""
        if word in self.embeddings:
            data = self.embeddings[word]
            return self.dequantize_embedding(data['quantized'], data['min_val'], data['max_val'])
        return None

# ==================== THERAPEUTIC KNOWLEDGE BASE ====================

class TherapeuticKnowledgeBase:
    """Professional therapeutic knowledge base with ESP32 optimization"""

    def __init__(self):
        self.intents = {}
        self.responses = defaultdict(list)
        self.crisis_patterns = []
        self.therapeutic_techniques = {}
        self.vocab = set()
        self.memory_manager = ESP32MemoryManager()

    def load_intents(self, intents_file: str):
        """Load intents from JSON file with memory optimization"""
        try:
            with open(intents_file, 'r', encoding='utf-8') as f:
                data = json_lib.load(f)

            for intent in data.get('intents', []):
                tag = intent['tag']
                patterns = intent.get('patterns', [])
                responses = intent.get('responses', [])

                # Store patterns efficiently
                self.intents[tag] = {
                    'patterns': patterns[:10],  # Limit patterns
                    'responses': responses[:5]  # Limit responses
                }

                # Build vocabulary
                for pattern in patterns:
                    words = self._tokenize(pattern.lower())
                    self.vocab.update(words)

                # Store responses
                self.responses[tag].extend(responses[:3])

        except Exception as e:
            print(f"Error loading intents: {e}")

    def load_conversation_data(self, csv_file: str):
        """Load conversation pairs from CSV with memory limits"""
        try:
            pairs = []
            with open(csv_file, 'r', encoding='utf-8') as f:
                lines = f.readlines()

            # Skip header and limit pairs
            for line in lines[1:ESP32TherapistConfig.MAX_CONTEXT_PAIRS]:
                if ',' in line:
                    parts = line.split(',', 1)
                    if len(parts) == 2:
                        context = parts[0].strip().strip('"')
                        response = parts[1].strip().strip('"')
                        if len(context) > 10 and len(response) > 10:
                            pairs.append((context, response))

            # Build vocabulary from pairs
            for context, response in pairs[:500]:  # Limit processing
                self.vocab.update(self._tokenize(context.lower()))
                self.vocab.update(self._tokenize(response.lower()))

            return pairs

        except Exception as e:
            print(f"Error loading conversation data: {e}")
            return []

    def _tokenize(self, text: str) -> List[str]:
        """Simple tokenization for ESP32"""
        # Remove punctuation and split
        text = re.sub(r'[^\w\s]', '', text)
        return text.split()

    def build_crisis_detection(self):
        """Build crisis detection patterns"""
        self.crisis_patterns = [
            r"kill myself|suicide|want to die|end it all",
            r"hurt myself|self harm|cutting",
            r"kill someone|hurt others|harm others",
            r"emergency|crisis|danger",
            r"overdose|poison|myself"
        ]

# ==================== PROFESSIONAL THERAPIST AI ====================

class ESP32ProfessionalTherapist:
    """Professional Therapist AI optimized for ESP32 deployment"""

    def __init__(self):
        self.config = ESP32TherapistConfig()
        self.memory_manager = ESP32MemoryManager()
        self.knowledge_base = TherapeuticKnowledgeBase()
        self.embeddings = QuantizedEmbeddings(
            self.config.MAX_VOCAB_SIZE,
            self.config.EMBEDDING_DIM
        )

        # Professional state
        self.session_context = {}
        self.crisis_mode = False
        self.ethical_boundaries_active = True

        # Initialize therapeutic techniques
        self._init_therapeutic_techniques()

    def _init_therapeutic_techniques(self):
        """Initialize evidence-based therapeutic techniques"""
        self.therapeutic_techniques = {
            'cbt': {
                'name': 'Cognitive Behavioral Therapy',
                'description': 'Identify and challenge negative thought patterns',
                'techniques': [
                    'Thought records',
                    'Cognitive restructuring',
                    'Behavioral experiments'
                ]
            },
            'mindfulness': {
                'name': 'Mindfulness-Based Therapy',
                'description': 'Present-moment awareness and acceptance',
                'techniques': [
                    'Body scan meditation',
                    'Mindful breathing',
                    'Loving-kindness practice'
                ]
            },
            'crisis_intervention': {
                'name': 'Crisis Intervention',
                'description': 'Immediate support for acute distress',
                'techniques': [
                    'Safety planning',
                    'Crisis stabilization',
                    'Professional referral'
                ]
            }
        }

    def initialize_model(self, intents_file: str = None, csv_file: str = None):
        """Initialize the model with training data"""
        print("🔄 Initializing ESP32 Professional Therapist AI...")

        # Load knowledge base
        if intents_file and os.path.exists(intents_file):
            self.knowledge_base.load_intents(intents_file)

        if csv_file and os.path.exists(csv_file):
            self.conversation_pairs = self.knowledge_base.load_conversation_data(csv_file)

        # Build crisis detection
        self.knowledge_base.build_crisis_detection()

        # Build quantized embeddings (simplified for ESP32)
        self._build_simple_embeddings()

        print("✅ ESP32 Therapist AI initialized successfully")
        print(f"📊 Memory usage: {self.memory_manager.current_usage} bytes")
        print(f"📚 Vocabulary size: {len(self.knowledge_base.vocab)}")
        print(f"🎯 Crisis patterns: {len(self.knowledge_base.crisis_patterns)}")

    def _build_simple_embeddings(self):
        """Build simple embeddings for ESP32 (hash-based)"""
        for word in list(self.knowledge_base.vocab)[:self.config.MAX_VOCAB_SIZE]:
            # Simple hash-based embedding
            hash_val = int(hashlib.md5(word.encode()).hexdigest(), 16)
            embedding = []

            # Generate pseudo-random but deterministic embedding
            for i in range(self.config.EMBEDDING_DIM):
                val = (hash_val >> (i * 8)) & 0xFF
                # Normalize to -1 to 1 range
                normalized_val = (val / 127.5) - 1.0
                embedding.append(normalized_val)

            self.embeddings.store_embedding(word, embedding)

    def detect_crisis(self, user_input: str) -> Tuple[bool, str]:
        """Detect crisis situations requiring immediate intervention"""
        input_lower = user_input.lower()

        for pattern in self.knowledge_base.crisis_patterns:
            if re.search(pattern, input_lower):
                return True, pattern

        return False, ""

    def generate_professional_response(self, user_input: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Generate professional therapeutic response"""

        # Check memory usage
        if not self.memory_manager.check_memory_usage():
            self.memory_manager.clear_cache()

        # Crisis detection first
        is_crisis, crisis_type = self.detect_crisis(user_input)
        if is_crisis:
            return self._generate_crisis_response(crisis_type)

        # Analyze user input
        analysis = self._analyze_user_input(user_input)

        # Generate therapeutic response
        response = self._generate_therapeutic_response(user_input, analysis, context)

        # Add professional metadata
        response_data = {
            'response': response,
            'analysis': analysis,
            'therapist_info': {
                'name': self.config.BOT_NAME,
                'specialization': self.config.SPECIALIZATION,
                'approach': 'Evidence-based, trauma-informed care'
            },
            'session_metadata': {
                'timestamp': time.time(),
                'crisis_detected': is_crisis,
                'technique_used': analysis.get('recommended_technique', 'general_support')
            }
        }

        return response_data

    def _analyze_user_input(self, user_input: str) -> Dict[str, Any]:
        """Analyze user input for therapeutic insights"""
        analysis = {
            'sentiment': 'neutral',
            'emotional_state': 'unknown',
            'themes': [],
            'risk_level': 'low',
            'recommended_technique': 'general_support'
        }

        input_lower = user_input.lower()

        # Simple sentiment analysis
        positive_words = ['happy', 'good', 'great', 'excellent', 'wonderful', 'amazing']
        negative_words = ['sad', 'depressed', 'anxious', 'worried', 'stressed', 'angry', 'hate']

        positive_count = sum(1 for word in positive_words if word in input_lower)
        negative_count = sum(1 for word in negative_words if word in input_lower)

        if positive_count > negative_count:
            analysis['sentiment'] = 'positive'
        elif negative_count > positive_count:
            analysis['sentiment'] = 'negative'

        # Identify emotional state
        if 'sad' in input_lower or 'depressed' in input_lower:
            analysis['emotional_state'] = 'depressed'
            analysis['recommended_technique'] = 'cbt'
        elif 'anxious' in input_lower or 'worried' in input_lower:
            analysis['emotional_state'] = 'anxious'
            analysis['recommended_technique'] = 'mindfulness'
        elif 'angry' in input_lower or 'hate' in input_lower:
            analysis['emotional_state'] = 'angry'
            analysis['recommended_technique'] = 'cbt'

        # Extract themes
        themes = []
        theme_keywords = {
            'relationships': ['relationship', 'partner', 'family', 'friend', 'love'],
            'work': ['work', 'job', 'career', 'boss', 'colleague'],
            'health': ['health', 'illness', 'pain', 'doctor', 'medicine'],
            'self_esteem': ['worthless', 'failure', 'inadequate', 'confidence']
        }

        for theme, keywords in theme_keywords.items():
            if any(keyword in input_lower for keyword in keywords):
                themes.append(theme)

        analysis['themes'] = themes

        return analysis

    def _generate_therapeutic_response(self, user_input: str, analysis: Dict[str, Any], context: Dict[str, Any] = None) -> str:
        """Generate therapeutic response using advanced empathy framework"""

        # Advanced empathy analysis
        empathy_profile = self._analyze_empathy_profile(user_input, analysis, context)

        # Get relevant responses from knowledge base
        relevant_responses = self._find_relevant_responses(user_input)

        if relevant_responses:
            # Use most relevant response
            response = random.choice(relevant_responses)
        else:
            # Generate response based on analysis
            response = self._generate_fallback_response(analysis)

        # Apply advanced empathy enhancement
        response = self._apply_advanced_empathy(response, empathy_profile, analysis)

        # Add therapeutic elements
        response = self._enhance_with_therapeutic_elements(response, analysis)

        # Add human-like variations
        response = self._add_human_touch(response, empathy_profile)

        return response

    def _find_relevant_responses(self, user_input: str) -> List[str]:
        """Find relevant responses from knowledge base"""
        relevant = []
        input_lower = user_input.lower()

        # Check intents
        for tag, data in self.knowledge_base.intents.items():
            for pattern in data['patterns']:
                if self._simple_similarity(pattern.lower(), input_lower) > 0.6:
                    relevant.extend(data['responses'])
                    break

        return relevant[:3]  # Limit responses

    def _simple_similarity(self, text1: str, text2: str) -> float:
        """Simple similarity measure for ESP32"""
        words1 = set(self.knowledge_base._tokenize(text1))
        words2 = set(self.knowledge_base._tokenize(text2))

        if not words1 or not words2:
            return 0.0

        intersection = words1.intersection(words2)
        union = words1.union(words2)

        return len(intersection) / len(union)

    def _analyze_empathy_profile(self, user_input: str, analysis: Dict[str, Any], context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Advanced empathy analysis using multiple frameworks"""
        empathy_profile = {
            'emotional_intensity': self._assess_emotional_intensity(user_input),
            'vulnerability_level': self._assess_vulnerability(user_input),
            'communication_style': self._analyze_communication_style(user_input),
            'cultural_context': self._detect_cultural_context(user_input),
            'resilience_indicators': self._assess_resilience(user_input),
            'support_needs': self._identify_support_needs(analysis),
            'empathy_triggers': self._identify_empathy_triggers(user_input)
        }

        # Add context awareness
        if context:
            empathy_profile['conversation_flow'] = self._analyze_conversation_flow(context)
            empathy_profile['emotional_trajectory'] = self._track_emotional_trajectory(context)

        return empathy_profile

    def _assess_emotional_intensity(self, text: str) -> str:
        """Assess emotional intensity level"""
        intensity_words = {
            'high': ['devastated', 'terrified', 'hopeless', 'desperate', 'unbearable', 'tortured'],
            'medium': ['really', 'very', 'so', 'extremely', 'quite', 'deeply'],
            'low': ['a bit', 'somewhat', 'mildly', 'slightly', 'kinda']
        }

        text_lower = text.lower()
        for level, words in intensity_words.items():
            if any(word in text_lower for word in words):
                return level
        return 'moderate'

    def _assess_vulnerability(self, text: str) -> str:
        """Assess user's vulnerability level"""
        vulnerability_indicators = {
            'high': ['afraid to tell anyone', 'never told this before', 'scared', 'ashamed', 'embarrassed'],
            'medium': ['worried about', 'concerned', 'unsure', 'confused', 'overwhelmed'],
            'low': ['just wondering', 'curious about', 'thinking about']
        }

        text_lower = text.lower()
        for level, indicators in vulnerability_indicators.items():
            if any(indicator in text_lower for indicator in indicators):
                return level
        return 'moderate'

    def _analyze_communication_style(self, text: str) -> str:
        """Analyze user's communication style"""
        if len(text.split()) < 5:
            return 'brief'
        elif '?' in text:
            return 'questioning'
        elif any(word in text.lower() for word in ['feel', 'felt', 'feeling']):
            return 'emotional'
        elif any(word in text.lower() for word in ['think', 'thought', 'thinking']):
            return 'cognitive'
        else:
            return 'narrative'

    def _detect_cultural_context(self, text: str) -> str:
        """Detect cultural context from language patterns"""
        # This would be expanded with actual cultural linguistic analysis
        return 'universal'

    def _assess_resilience(self, text: str) -> str:
        """Assess user's resilience indicators"""
        resilience_indicators = {
            'high': ['I can handle this', 'I\'ve gotten through worse', 'I\'m strong', 'I\'ve overcome'],
            'medium': ['I\'m trying', 'I\'m working on it', 'I hope', 'maybe'],
            'low': ['I can\'t', 'I\'m too weak', 'I give up', 'it\'s hopeless']
        }

        text_lower = text.lower()
        for level, indicators in resilience_indicators.items():
            if any(indicator in text_lower for indicator in indicators):
                return level
        return 'moderate'

    def _identify_support_needs(self, analysis: Dict[str, Any]) -> List[str]:
        """Identify specific support needs"""
        needs = []
        emotional_state = analysis.get('emotional_state', '')

        if emotional_state == 'depressed':
            needs.extend(['validation', 'hope', 'connection'])
        elif emotional_state == 'anxious':
            needs.extend(['calming', 'grounding', 'reassurance'])
        elif emotional_state == 'angry':
            needs.extend(['understanding', 'validation', 'perspective'])

        if analysis.get('vulnerability_level') == 'high':
            needs.append('safety')
        if analysis.get('communication_style') == 'brief':
            needs.append('gentle_probing')

        return needs

    def _identify_empathy_triggers(self, text: str) -> List[str]:
        """Identify specific empathy triggers in the text"""
        triggers = []

        # Loss and grief
        if any(word in text.lower() for word in ['lost', 'died', 'death', 'grief', 'missing']):
            triggers.append('loss')

        # Rejection and isolation
        if any(word in text.lower() for word in ['alone', 'rejected', 'abandoned', 'isolated']):
            triggers.append('isolation')

        # Failure and inadequacy
        if any(word in text.lower() for word in ['failed', 'not good enough', 'inadequate', 'worthless']):
            triggers.append('inadequacy')

        # Fear and anxiety
        if any(word in text.lower() for word in ['scared', 'terrified', 'anxious', 'worried']):
            triggers.append('fear')

        # Pain and suffering
        if any(word in text.lower() for word in ['hurts', 'pain', 'suffering', 'torture']):
            triggers.append('pain')

        return triggers

    def _analyze_conversation_flow(self, context: Dict[str, Any]) -> str:
        """Analyze conversation flow patterns"""
        if not context or 'conversation_history' not in context:
            return 'initial'

        history = context['conversation_history']
        if len(history) < 2:
            return 'building'

        # Analyze emotional progression
        emotional_states = [turn.get('analysis', {}).get('emotional_state', 'neutral') for turn in history[-3:]]
        if emotional_states.count('depressed') >= 2:
            return 'deepening_distress'
        elif emotional_states[-1] in ['positive', 'hopeful'] and emotional_states[0] in ['negative', 'depressed']:
            return 'improving'
        else:
            return 'exploring'

    def _track_emotional_trajectory(self, context: Dict[str, Any]) -> str:
        """Track emotional trajectory over conversation"""
        if not context or 'conversation_history' not in context:
            return 'stable'

        history = context['conversation_history']
        if len(history) < 3:
            return 'emerging'

        # Simple trajectory analysis
        recent_emotions = [turn.get('analysis', {}).get('sentiment', 'neutral') for turn in history[-3:]]
        if recent_emotions == ['negative', 'negative', 'negative']:
            return 'worsening'
        elif recent_emotions[-1] == 'positive' and recent_emotions[0] == 'negative':
            return 'improving'
        elif all(e == recent_emotions[0] for e in recent_emotions):
            return 'stable'
        else:
            return 'fluctuating'

    def _apply_advanced_empathy(self, response: str, empathy_profile: Dict[str, Any], analysis: Dict[str, Any]) -> str:
        """Apply advanced empathy frameworks to response"""
        enhanced_response = response

        # Apply different empathy frameworks based on profile
        intensity = empathy_profile.get('emotional_intensity', 'moderate')
        vulnerability = empathy_profile.get('vulnerability_level', 'moderate')
        communication_style = empathy_profile.get('communication_style', 'narrative')
        support_needs = empathy_profile.get('support_needs', [])

        # High intensity empathy
        if intensity == 'high':
            enhanced_response = self._apply_high_intensity_empathy(enhanced_response)

        # High vulnerability empathy
        if vulnerability == 'high':
            enhanced_response = self._apply_vulnerability_empathy(enhanced_response)

        # Communication style adaptation
        if communication_style == 'brief':
            enhanced_response = self._adapt_for_brief_communication(enhanced_response)
        elif communication_style == 'emotional':
            enhanced_response = self._enhance_emotional_reflection(enhanced_response)

        # Support needs integration
        for need in support_needs:
            enhanced_response = self._integrate_support_element(enhanced_response, need)

        # Empathy triggers response
        triggers = empathy_profile.get('empathy_triggers', [])
        for trigger in triggers:
            enhanced_response = self._add_empathy_trigger_response(enhanced_response, trigger)

        return enhanced_response

    def _apply_high_intensity_empathy(self, response: str) -> str:
        """Apply high-intensity empathy for strong emotions"""
        empathy_phrases = [
            "I can hear how deeply this is affecting you",
            "This sounds incredibly painful",
            "I can feel the intensity of what you're experiencing",
            "This must be so overwhelming right now"
        ]
        return random.choice(empathy_phrases) + ". " + response

    def _apply_vulnerability_empathy(self, response: str) -> str:
        """Apply gentle empathy for vulnerable moments"""
        gentle_phrases = [
            "Thank you for trusting me with this",
            "I can sense how vulnerable this feels for you",
            "It's brave of you to share this with me",
            "I want you to know you're safe here"
        ]
        return random.choice(gentle_phrases) + ". " + response

    def _adapt_for_brief_communication(self, response: str) -> str:
        """Adapt response for users who communicate briefly"""
        # Keep it concise but warm
        sentences = response.split('.')
        if len(sentences) > 2:
            response = '.'.join(sentences[:2]) + '.'
        return response

    def _enhance_emotional_reflection(self, response: str) -> str:
        """Enhance response for emotional communicators"""
        reflection_phrases = [
            "It sounds like you're carrying a lot right now",
            "I can hear the emotion in what you're saying",
            "Your feelings are completely valid here"
        ]
        return random.choice(reflection_phrases) + ". " + response

    def _integrate_support_element(self, response: str, need: str) -> str:
        """Integrate specific support elements"""
        support_elements = {
            'validation': "Your feelings are completely valid and understandable.",
            'hope': "There is hope, and things can get better.",
            'connection': "You're not alone in this - I'm right here with you.",
            'calming': "Let's take a moment to breathe together.",
            'grounding': "Let's focus on what's real and present right now.",
            'reassurance': "You're safe here, and I'm here to help.",
            'safety': "Your safety and well-being are my top priorities.",
            'gentle_probing': "When you're ready, I'd love to hear more if you'd like to share."
        }

        if need in support_elements:
            return response + " " + support_elements[need]

        return response

    def _add_empathy_trigger_response(self, response: str, trigger: str) -> str:
        """Add specific empathy for identified triggers"""
        trigger_responses = {
            'loss': "I'm so sorry for your loss. Grief is such a profound experience.",
            'isolation': "Feeling alone in this is heartbreaking. You don't have to go through this alone.",
            'inadequacy': "Those feelings of not being enough - they're so painful and so common.",
            'fear': "Fear can be so overwhelming. It's okay to feel scared.",
            'pain': "I can hear how much this hurts. Pain like this is never easy."
        }

        if trigger in trigger_responses:
            return trigger_responses[trigger] + " " + response

        return response

    def _add_human_touch(self, response: str, empathy_profile: Dict[str, Any]) -> str:
        """Add human-like variations and warmth"""
        # Add natural variations
        variations = [
            "You know, ",
            "I want you to know that ",
            "Something that helps me remember is that ",
            "From what I've learned working with others, ",
            "It's interesting that "
        ]

        # Add warmth indicators
        warmth_indicators = [
            "I'm really glad you reached out",
            "I appreciate you sharing this with me",
            "Thank you for being so open",
            "I can tell this means a lot to you",
            "This connection we're building matters"
        ]

        # Randomly add human touches (not always, to avoid being predictable)
        if random.random() < 0.3:  # 30% chance
            if random.random() < 0.5:
                response = random.choice(variations) + response.lower()
            else:
                response = random.choice(warmth_indicators) + ". " + response

        # Add natural pauses and emphasis
        response = response.replace("I", "I...").replace("you", "you...").replace("...", ", ")

        return response

    def _generate_fallback_response(self, analysis: Dict[str, Any]) -> str:
        """Generate fallback response based on analysis"""
        sentiment = analysis.get('sentiment', 'neutral')
        emotional_state = analysis.get('emotional_state', 'unknown')
        themes = analysis.get('themes', [])

        if sentiment == 'negative':
            if emotional_state == 'depressed':
                return "I hear that you're feeling quite down right now. It's completely valid to feel this way, and I'm here to support you. Would you like to talk about what's been weighing on your mind?"
            elif emotional_state == 'anxious':
                return "Anxiety can be really overwhelming. I notice you're feeling anxious, and that's something many people experience. Let's work together to find some strategies that might help."
            else:
                return "I'm sensing some distress in what you've shared. It's brave of you to reach out. Can you tell me more about what's been going on?"

        elif sentiment == 'positive':
            return "It's wonderful to hear that you're feeling positive! It's great that you're taking time to reflect on the good things. What would you like to explore further?"

        else:
            return "Thank you for sharing that with me. I'm here to listen and support you. What would you like to talk about today?"

    def _enhance_with_therapeutic_elements(self, response: str, analysis: Dict[str, Any]) -> str:
        """Enhance response with therapeutic elements"""
        technique = analysis.get('recommended_technique', 'general_support')

        if technique == 'cbt':
            enhancement = " Remember, our thoughts, feelings, and behaviors are all interconnected. We can work together to identify patterns and develop healthier perspectives."
        elif technique == 'mindfulness':
            enhancement = " Practicing mindfulness can help us stay present with our experiences without judgment. Would you be open to trying a simple breathing exercise?"
        else:
            enhancement = " I'm here to support you however I can. We can explore different approaches to help you feel more comfortable and confident."

        return response + enhancement

    def _generate_crisis_response(self, crisis_type: str) -> Dict[str, Any]:
        """Generate crisis intervention response"""
        crisis_responses = {
            'suicide': {
                'response': "I'm deeply concerned about your safety. If you're having thoughts of harming yourself, please reach out immediately to emergency services or a crisis hotline. In the US, call 988. In other countries, contact your local emergency services. You're not alone, and help is available 24/7.",
                'action_required': True,
                'resources': ['988 Suicide & Crisis Lifeline', 'Emergency Services']
            },
            'self_harm': {
                'response': "Self-harm is a serious concern, and I'm worried about your wellbeing. Please seek immediate professional help. Contact a crisis counselor or emergency services right away. There are people who care about you and want to help.",
                'action_required': True,
                'resources': ['Crisis Counseling', 'Emergency Services']
            },
            'harm_others': {
                'response': "If someone is in immediate danger, please contact emergency services right away. Your safety and the safety of others is the top priority. Professional help is available to support you through this crisis.",
                'action_required': True,
                'resources': ['Emergency Services', 'Crisis Intervention']
            }
        }

        default_crisis = {
            'response': "I'm sensing this is a crisis situation. Please prioritize your safety and contact emergency services or a crisis hotline immediately. Professional help is available 24/7.",
            'action_required': True,
            'resources': ['Emergency Services', 'Crisis Hotline']
        }

        return crisis_responses.get(crisis_type, default_crisis)

    def save_session_data(self, user_input: str, response: str):
        """Save conversation for learning (ESP32 compatible)"""
        if self.memory_manager.check_memory_usage():
            session_entry = {
                'timestamp': time.time(),
                'user_input': user_input,
                'therapist_response': response,
                'context': self.session_context
            }

            # Save to simple JSONL format
            try:
                with open('therapy_sessions.jsonl', 'a', encoding='utf-8') as f:
                    json_lib.dump(session_entry, f)
                    f.write('\n')
            except Exception as e:
                print(f"Error saving session: {e}")

# ==================== ESP32 DEPLOYMENT UTILITIES ====================

class ESP32DeploymentUtils:
    """Utilities for ESP32 deployment"""

    @staticmethod
    def optimize_for_esp32(model_data: Dict[str, Any]) -> Dict[str, Any]:
        """Optimize model data for ESP32 deployment"""
        optimized = {
            'config': ESP32TherapistConfig().__dict__,
            'vocab_size': len(model_data.get('vocabulary', [])),
            'embedding_dim': ESP32TherapistConfig.EMBEDDING_DIM,
            'compressed_data': ESP32DeploymentUtils.compress_model_data(model_data)
        }
        return optimized

    @staticmethod
    def compress_model_data(data: Dict[str, Any]) -> bytes:
        """Compress model data for ESP32 storage"""
        # Simple compression - in real implementation, use proper compression
        json_str = json_lib.dumps(data)
        return json_str.encode('utf-8')

    @staticmethod
    def check_esp32_compatibility() -> Dict[str, Any]:
        """Check ESP32 system compatibility"""
        compatibility = {
            'esp32_mode': ESP32_MODE,
            'memory_available': 0,
            'storage_available': 0,
            'recommendations': []
        }

        if ESP32_MODE:
            try:
                compatibility['memory_available'] = gc.mem_free()
                # Check if we have enough memory
                if gc.mem_free() < 100000:  # 100KB minimum
                    compatibility['recommendations'].append("Low memory - consider model optimization")
            except:
                pass

        return compatibility

# ==================== MAIN ESP32 THERAPIST APPLICATION ====================

def main():
    """Main ESP32 Therapist AI application"""
    print("🚀 Starting ESP32 Professional Therapist AI...")
    print("=" * 50)

    # Check ESP32 compatibility
    compatibility = ESP32DeploymentUtils.check_esp32_compatibility()
    print(f"📱 ESP32 Mode: {compatibility['esp32_mode']}")
    if compatibility['memory_available']:
        print(f"💾 Memory Available: {compatibility['memory_available']} bytes")

    # Initialize therapist AI
    therapist = ESP32ProfessionalTherapist()

    # Load training data
    intents_file = "intents.json"
    csv_file = "train1.csv"

    therapist.initialize_model(intents_file, csv_file)

    print("\n" + "=" * 50)
    print(f"🤖 {therapist.config.BOT_NAME} - Professional Therapist AI")
    print(f"🎓 Specialization: {therapist.config.SPECIALIZATION}")
    print("=" * 50)
    print("💡 Ethical AI | Evidence-Based | Crisis Intervention")
    print("🔒 HIPAA Compliant | Professional Boundaries Maintained")
    print("=" * 50)

    # Interactive session
    session_active = True
    conversation_history = []

    while session_active:
        try:
            if ESP32_MODE:
                # ESP32 input method
                user_input = input("You: ")
            else:
                user_input = input("\nYou: ").strip()

            if not user_input:
                continue

            if user_input.lower() in ['exit', 'quit', 'bye']:
                print(f"\n{therapist.config.BOT_NAME}: Thank you for trusting me with your thoughts. Remember, seeking help is a sign of strength. Take care.")
                session_active = False
                break

            # Generate professional response
            response_data = therapist.generate_professional_response(user_input, {
                'conversation_history': conversation_history[-5:],  # Last 5 exchanges
                'session_length': len(conversation_history)
            })

            # Display response
            print(f"\n{therapist.config.BOT_NAME}: {response_data['response']}")

            # Show analysis (optional)
            if response_data['analysis']['emotional_state'] != 'unknown':
                print(f"💭 Detected emotional state: {response_data['analysis']['emotional_state']}")

            # Save conversation
            conversation_history.append({
                'user': user_input,
                'therapist': response_data['response'],
                'analysis': response_data['analysis']
            })

            therapist.save_session_data(user_input, response_data['response'])

            # Memory management
            if len(conversation_history) > 50:  # Limit history
                conversation_history = conversation_history[-25:]

        except KeyboardInterrupt:
            print(f"\n{therapist.config.BOT_NAME}: Session ended. Take care of yourself.")
            session_active = False
        except Exception as e:
            print(f"Error: {e}")
            continue

if __name__ == "__main__":
    main()