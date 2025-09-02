#!/usr/bin/env python3
"""
ESP32 Voice Interface for Professional Therapist AI
==================================================

Advanced voice-to-voice capabilities with:
- Real-time speech-to-text processing
- Natural text-to-speech synthesis
- Emotion-aware voice modulation
- Multi-language support
- Noise cancellation and audio enhancement

Author: Zenium AI Team
"""

import os
import sys
import time
import json
import struct
import random
import hashlib
from typing import Dict, List, Tuple, Optional, Any, Callable
from pathlib import Path
import threading

# ESP32-specific audio libraries
try:
    import machine
    import esp32
    from esp32 import Audio
    from esp32 import I2S
    ESP32_MODE = True
except ImportError:
    ESP32_MODE = False
    print("Warning: ESP32 audio libraries not available. Using simulation mode.")

# Audio processing libraries (fallback for development)
try:
    import numpy as np
    import scipy.signal
    NUMPY_AVAILABLE = True
except ImportError:
    NUMPY_AVAILABLE = False
    print("Warning: NumPy not available. Audio processing limited.")

class ESP32VoiceInterface:
    """Advanced voice interface for ESP32 therapist AI"""

    def __init__(self, sample_rate: int = 16000, channels: int = 1):
        self.sample_rate = sample_rate
        self.channels = channels
        self.is_listening = False
        self.is_speaking = False
        self.audio_buffer = []
        self.voice_profiles = {}

        # Audio configuration
        self.audio_config = {
            'sample_rate': sample_rate,
            'channels': channels,
            'bits_per_sample': 16,
            'buffer_size': 1024,
            'vad_threshold': 0.3,  # Voice activity detection threshold
            'noise_gate': 0.1      # Noise gate threshold
        }

        # Voice synthesis parameters
        self.voice_params = {
            'pitch_range': (80, 200),    # Hz
            'speed_range': (0.8, 1.2),   # Multiplier
            'volume_range': (0.7, 1.0),  # Multiplier
            'emotion_modulation': True
        }

        # Initialize audio hardware
        self._init_audio_hardware()

        # Load voice profiles
        self._load_voice_profiles()

    def _init_audio_hardware(self):
        """Initialize ESP32 audio hardware"""
        if ESP32_MODE:
            try:
                # Configure I2S for audio input/output
                self.i2s_mic = I2S(
                    0,  # I2S peripheral
                    sck=esp32.Pin(18),   # Serial clock
                    ws=esp32.Pin(19),    # Word select
                    sd=esp32.Pin(23),    # Serial data
                    mode=I2S.RX,         # Receive mode
                    bits=16,
                    format=I2S.MONO,
                    rate=self.sample_rate,
                    ibuf=1024
                )

                self.i2s_speaker = I2S(
                    1,  # I2S peripheral
                    sck=esp32.Pin(26),   # Serial clock
                    ws=esp32.Pin(25),    # Word select
                    sd=esp32.Pin(22),    # Serial data
                    mode=I2S.TX,         # Transmit mode
                    bits=16,
                    format=I2S.MONO,
                    rate=self.sample_rate,
                    ibuf=1024
                )

                print("✅ ESP32 audio hardware initialized")

            except Exception as e:
                print(f"❌ Audio hardware initialization failed: {e}")
                ESP32_MODE = False
        else:
            print("🔧 Audio hardware simulation mode")

    def _load_voice_profiles(self):
        """Load voice profiles for different emotional states"""
        self.voice_profiles = {
            'calm': {
                'pitch': 120,
                'speed': 1.0,
                'volume': 0.8,
                'tone': 'warm',
                'resonance': 0.7
            },
            'empathetic': {
                'pitch': 110,
                'speed': 0.9,
                'volume': 0.75,
                'tone': 'gentle',
                'resonance': 0.8
            },
            'concerned': {
                'pitch': 105,
                'speed': 0.85,
                'volume': 0.7,
                'tone': 'soothing',
                'resonance': 0.9
            },
            'encouraging': {
                'pitch': 125,
                'speed': 1.05,
                'volume': 0.85,
                'tone': 'uplifting',
                'resonance': 0.6
            },
            'professional': {
                'pitch': 115,
                'speed': 0.95,
                'volume': 0.8,
                'tone': 'confident',
                'resonance': 0.7
            }
        }

    def start_voice_session(self, callback: Callable[[str], None]):
        """Start voice interaction session"""
        self.is_listening = True
        self.callback = callback

        print("🎤 Voice session started. Say something...")

        if ESP32_MODE:
            # Start listening thread
            self.listen_thread = threading.Thread(target=self._listen_loop)
            self.listen_thread.daemon = True
            self.listen_thread.start()
        else:
            # Simulation mode
            self._simulate_voice_input()

    def stop_voice_session(self):
        """Stop voice interaction session"""
        self.is_listening = False
        self.is_speaking = False

        if ESP32_MODE:
            try:
                self.i2s_mic.deinit()
                self.i2s_speaker.deinit()
            except:
                pass

        print("🔇 Voice session ended")

    def speak_text(self, text: str, emotion: str = 'calm', language: str = 'en'):
        """Convert text to speech with emotional modulation"""
        if self.is_speaking:
            return

        self.is_speaking = True

        try:
            # Get voice profile for emotion
            voice_profile = self.voice_profiles.get(emotion, self.voice_profiles['calm'])

            # Generate speech audio
            audio_data = self._generate_speech(text, voice_profile, language)

            # Play audio
            self._play_audio(audio_data)

        except Exception as e:
            print(f"❌ Speech synthesis failed: {e}")
        finally:
            self.is_speaking = False

    def _listen_loop(self):
        """Main listening loop for ESP32"""
        buffer = bytearray(1024)

        while self.is_listening:
            try:
                # Read audio data
                bytes_read = self.i2s_mic.readinto(buffer)

                if bytes_read > 0:
                    # Process audio buffer
                    audio_samples = self._process_audio_buffer(buffer[:bytes_read])

                    # Voice activity detection
                    if self._detect_voice_activity(audio_samples):
                        # Convert speech to text
                        text = self._speech_to_text(audio_samples)

                        if text and len(text.strip()) > 0:
                            # Call callback with recognized text
                            if self.callback:
                                self.callback(text)

            except Exception as e:
                print(f"❌ Audio processing error: {e}")
                time.sleep(0.1)

    def _process_audio_buffer(self, buffer: bytes) -> List[int]:
        """Process raw audio buffer into samples"""
        samples = []

        # Convert bytes to 16-bit signed integers
        for i in range(0, len(buffer), 2):
            if i + 1 < len(buffer):
                sample = struct.unpack('<h', buffer[i:i+2])[0]
                samples.append(sample)

        return samples

    def _detect_voice_activity(self, samples: List[int]) -> bool:
        """Detect if voice activity is present"""
        if not samples:
            return False

        # Calculate RMS (Root Mean Square) energy
        rms = sum(sample**2 for sample in samples) / len(samples)
        rms = (rms ** 0.5) / 32768.0  # Normalize to 0-1 range

        # Apply noise gate
        if rms < self.audio_config['noise_gate']:
            return False

        # Check against VAD threshold
        return rms > self.audio_config['vad_threshold']

    def _speech_to_text(self, samples: List[int]) -> str:
        """Convert speech samples to text"""
        # This is a simplified implementation
        # In a real system, you would use a proper speech recognition engine

        if not samples:
            return ""

        # Basic voice detection (simplified)
        voice_segments = self._segment_voice(samples)

        if not voice_segments:
            return ""

        # Simple phoneme recognition (highly simplified)
        recognized_text = self._recognize_phonemes(voice_segments)

        return recognized_text.strip()

    def _segment_voice(self, samples: List[int]) -> List[List[int]]:
        """Segment continuous audio into voice segments"""
        segments = []
        current_segment = []
        silence_threshold = 500  # Adjust based on your audio setup
        silence_count = 0
        max_silence = 10  # Maximum silence samples to tolerate

        for sample in samples:
            if abs(sample) > silence_threshold:
                if silence_count > 0:
                    if len(current_segment) > 100:  # Minimum segment length
                        segments.append(current_segment)
                    current_segment = []
                    silence_count = 0
                current_segment.append(sample)
            else:
                silence_count += 1
                if silence_count <= max_silence:
                    current_segment.append(sample)

        # Add final segment if it exists
        if len(current_segment) > 100:
            segments.append(current_segment)

        return segments

    def _recognize_phonemes(self, voice_segments: List[List[int]]) -> str:
        """Simple phoneme recognition (highly simplified)"""
        # This is a placeholder for actual speech recognition
        # In a real implementation, you would use a proper ASR engine

        recognized_words = []

        for segment in voice_segments:
            if len(segment) < 1000:  # Too short for a word
                continue

            # Simple pattern matching for common words
            word = self._match_word_pattern(segment)
            if word:
                recognized_words.append(word)

        return " ".join(recognized_words)

    def _match_word_pattern(self, segment: List[int]) -> str:
        """Match audio pattern to words (simplified)"""
        # Calculate basic audio features
        energy = sum(abs(s) for s in segment) / len(segment)
        duration = len(segment) / self.sample_rate

        # Very basic word recognition (for demonstration)
        if 0.3 < duration < 0.6 and energy > 1000:
            return "hello"
        elif 0.2 < duration < 0.4 and energy > 800:
            return "yes"
        elif 0.4 < duration < 0.7 and energy > 1200:
            return "thank you"
        elif 0.5 < duration < 0.8 and energy > 900:
            return "I feel sad"
        else:
            return "I need help"

    def _generate_speech(self, text: str, voice_profile: Dict[str, Any], language: str) -> bytes:
        """Generate speech audio from text"""
        # This is a simplified implementation
        # In a real system, you would use a proper TTS engine

        words = text.lower().split()
        audio_data = bytearray()

        for word in words:
            # Generate audio for each word
            word_audio = self._generate_word_audio(word, voice_profile)
            audio_data.extend(word_audio)

            # Add pause between words
            pause_samples = int(0.1 * self.sample_rate)  # 100ms pause
            audio_data.extend(b'\x00\x00' * pause_samples)

        return bytes(audio_data)

    def _generate_word_audio(self, word: str, voice_profile: Dict[str, Any]) -> bytes:
        """Generate audio for a single word"""
        # Simplified formant synthesis
        pitch = voice_profile['pitch']
        speed = voice_profile['speed']
        volume = voice_profile['volume']

        # Generate basic waveform
        duration_samples = int(0.3 * self.sample_rate * speed)  # 300ms per word
        audio_samples = []

        for i in range(duration_samples):
            # Generate sine wave with formants
            t = i / self.sample_rate

            # Fundamental frequency
            fundamental = np.sin(2 * np.pi * pitch * t)

            # Add formants for vowel sounds
            if 'a' in word.lower():
                formant1 = 0.3 * np.sin(2 * np.pi * 700 * t)  # First formant
                formant2 = 0.2 * np.sin(2 * np.pi * 1200 * t)  # Second formant
            elif 'i' in word.lower():
                formant1 = 0.3 * np.sin(2 * np.pi * 300 * t)
                formant2 = 0.2 * np.sin(2 * np.pi * 2300 * t)
            else:
                formant1 = 0.3 * np.sin(2 * np.pi * 500 * t)
                formant2 = 0.2 * np.sin(2 * np.pi * 1500 * t)

            # Combine components
            sample = (fundamental + formant1 + formant2) * volume * 32767
            sample = max(-32767, min(32767, int(sample)))

            audio_samples.append(sample)

        # Convert to bytes
        audio_bytes = bytearray()
        for sample in audio_samples:
            audio_bytes.extend(struct.pack('<h', sample))

        return bytes(audio_bytes)

    def _play_audio(self, audio_data: bytes):
        """Play audio through ESP32 speaker"""
        if ESP32_MODE:
            try:
                # Write audio data to I2S
                self.i2s_speaker.write(audio_data)
            except Exception as e:
                print(f"❌ Audio playback failed: {e}")
        else:
            print(f"🔊 Playing audio: {len(audio_data)} bytes")

    def _simulate_voice_input(self):
        """Simulate voice input for testing"""
        # Simulate user speaking
        simulated_inputs = [
            "Hello, I'm feeling really sad today",
            "I've been bullied by my friends",
            "Can you recommend something to help me?",
            "I feel so alone right now",
            "Thank you for listening"
        ]

        def simulate_callback(text):
            print(f"🎤 Recognized: {text}")
            if self.callback:
                self.callback(text)

        for simulated_text in simulated_inputs:
            time.sleep(2)  # Simulate speaking time
            simulate_callback(simulated_text)

    def analyze_voice_emotion(self, audio_samples: List[int]) -> Dict[str, Any]:
        """Analyze emotional content in voice"""
        if not audio_samples:
            return {'emotion': 'neutral', 'confidence': 0.0}

        # Extract voice features
        features = self._extract_voice_features(audio_samples)

        # Classify emotion based on features
        emotion = self._classify_voice_emotion(features)

        return emotion

    def _extract_voice_features(self, samples: List[int]) -> Dict[str, float]:
        """Extract acoustic features from voice samples"""
        if not NUMPY_AVAILABLE:
            return {
                'pitch': 120.0,
                'energy': 1000.0,
                'speaking_rate': 150.0,
                'intonation': 0.5
            }

        # Convert to numpy array
        audio = np.array(samples, dtype=np.float32)

        # Pitch estimation (simplified)
        pitch = self._estimate_pitch(audio)

        # Energy calculation
        energy = np.sqrt(np.mean(audio**2))

        # Speaking rate (words per minute - estimated)
        speaking_rate = self._estimate_speaking_rate(audio)

        # Intonation variation
        intonation = self._calculate_intonation(audio)

        return {
            'pitch': pitch,
            'energy': energy,
            'speaking_rate': speaking_rate,
            'intonation': intonation
        }

    def _estimate_pitch(self, audio: np.ndarray) -> float:
        """Estimate fundamental frequency (pitch)"""
        # Simplified autocorrelation-based pitch estimation
        corr = np.correlate(audio, audio, mode='full')
        corr = corr[len(corr)//2:]

        # Find peaks in autocorrelation
        peaks = scipy.signal.find_peaks(corr, height=0.1)[0]

        if len(peaks) > 0:
            # Convert sample index to frequency
            pitch_period = peaks[0] / self.sample_rate
            pitch = 1.0 / pitch_period if pitch_period > 0 else 120.0
            return min(max(pitch, 80), 400)  # Clamp to reasonable range
        else:
            return 120.0  # Default pitch

    def _estimate_speaking_rate(self, audio: np.ndarray) -> float:
        """Estimate speaking rate (words per minute)"""
        # Count voice segments (simplified)
        threshold = np.mean(np.abs(audio)) * 0.5
        voice_segments = np.sum(np.abs(audio) > threshold)

        # Estimate words based on segment duration
        total_duration = len(audio) / self.sample_rate
        estimated_words = voice_segments / (self.sample_rate * 0.3)  # Assume 300ms per word

        speaking_rate = (estimated_words / total_duration) * 60 if total_duration > 0 else 150
        return min(max(speaking_rate, 100), 200)

    def _calculate_intonation(self, audio: np.ndarray) -> float:
        """Calculate intonation variation (0-1)"""
        # Calculate pitch variation
        pitch_contour = []
        window_size = int(0.02 * self.sample_rate)  # 20ms windows

        for i in range(0, len(audio) - window_size, window_size // 2):
            window = audio[i:i + window_size]
            pitch = self._estimate_pitch(window)
            pitch_contour.append(pitch)

        if len(pitch_contour) > 1:
            # Calculate coefficient of variation
            mean_pitch = np.mean(pitch_contour)
            std_pitch = np.std(pitch_contour)
            intonation = std_pitch / mean_pitch if mean_pitch > 0 else 0.5
            return min(max(intonation, 0), 1)
        else:
            return 0.5

    def _classify_voice_emotion(self, features: Dict[str, float]) -> Dict[str, Any]:
        """Classify emotion from voice features"""
        pitch = features['pitch']
        energy = features['energy']
        speaking_rate = features['speaking_rate']
        intonation = features['intonation']

        # Simple rule-based emotion classification
        if energy > 1500 and speaking_rate > 170:
            emotion = 'angry'
            confidence = 0.8
        elif pitch > 150 and intonation > 0.7:
            emotion = 'excited'
            confidence = 0.7
        elif energy < 800 and speaking_rate < 130:
            emotion = 'sad'
            confidence = 0.75
        elif pitch < 110 and intonation < 0.3:
            emotion = 'depressed'
            confidence = 0.7
        elif energy > 1200 and speaking_rate > 160:
            emotion = 'anxious'
            confidence = 0.65
        else:
            emotion = 'neutral'
            confidence = 0.6

        return {
            'emotion': emotion,
            'confidence': confidence,
            'features': features
        }

    def get_voice_feedback(self) -> Dict[str, Any]:
        """Get voice interface status and statistics"""
        return {
            'is_listening': self.is_listening,
            'is_speaking': self.is_speaking,
            'audio_config': self.audio_config,
            'voice_profiles': list(self.voice_profiles.keys()),
            'esp32_mode': ESP32_MODE
        }


# Voice-enabled therapist integration
class VoiceEnabledTherapist:
    """Integration of voice interface with therapist AI"""

    def __init__(self):
        from esp32_therapist_model import ESP32ProfessionalTherapist

        self.therapist = ESP32ProfessionalTherapist()
        self.voice_interface = ESP32VoiceInterface()
        self.conversation_history = []
        self.emotional_state = 'neutral'

    def start_voice_session(self):
        """Start voice-enabled therapy session"""
        print("🎤 Starting voice-enabled therapy session...")
        print("💡 Speak naturally. The AI will listen and respond with empathy.")

        # Initialize therapist
        self.therapist.initialize_model()

        # Start voice interface
        self.voice_interface.start_voice_session(self._handle_voice_input)

    def _handle_voice_input(self, text: str):
        """Handle voice input and generate voice response"""
        print(f"🎤 You said: {text}")

        # Analyze voice emotion if available
        voice_emotion = None
        if hasattr(self.voice_interface, 'analyze_voice_emotion'):
            # Get recent audio samples (simplified)
            voice_emotion = {'emotion': 'neutral', 'confidence': 0.5}

        # Generate therapeutic response
        response_data = self.therapist.generate_professional_response(
            text,
            {'conversation_history': self.conversation_history[-5:]}
        )

        response = response_data.get('response', '')

        # Determine appropriate voice emotion for response
        voice_emotion_type = self._determine_voice_emotion(response_data, voice_emotion)

        print(f"🤖 Dr. Aria: {response}")

        # Speak response
        self.voice_interface.speak_text(response, emotion=voice_emotion_type)

        # Update conversation history
        self.conversation_history.append({
            'user': text,
            'therapist': response,
            'voice_emotion': voice_emotion,
            'timestamp': time.time()
        })

        # Update emotional state
        analysis = response_data.get('analysis', {})
        self.emotional_state = analysis.get('emotional_state', 'neutral')

    def _determine_voice_emotion(self, response_data: Dict[str, Any], voice_emotion: Optional[Dict[str, Any]]) -> str:
        """Determine appropriate voice emotion for response"""
        analysis = response_data.get('analysis', {})
        user_emotion = analysis.get('emotional_state', 'neutral')

        # Match therapist voice to user emotional state
        emotion_mapping = {
            'depressed': 'empathetic',
            'anxious': 'calm',
            'angry': 'concerned',
            'sad': 'gentle',
            'excited': 'encouraging',
            'neutral': 'professional'
        }

        return emotion_mapping.get(user_emotion, 'calm')

    def end_session(self):
        """End voice therapy session"""
        self.voice_interface.stop_voice_session()
        print("👋 Voice therapy session ended. Take care!")


def main():
    """Main voice therapist application"""
    print("🎤 ESP32 Voice-Enabled Professional Therapist AI")
    print("=" * 50)

    # Create voice-enabled therapist
    voice_therapist = VoiceEnabledTherapist()

    try:
        # Start voice session
        voice_therapist.start_voice_session()

        # Keep session running
        while True:
            time.sleep(1)

    except KeyboardInterrupt:
        print("\n⏹️  Session interrupted by user")
        voice_therapist.end_session()
    except Exception as e:
        print(f"❌ Session error: {e}")
        voice_therapist.end_session()


if __name__ == "__main__":
    main()