import { useEffect, useRef, useState } from 'react';
import {
    ExpoSpeechRecognitionModule,
    useSpeechRecognitionEvent,
} from 'expo-speech-recognition';

interface AudioThreatDetectionProps {
    isActive: boolean;
    onThreatDetected: (transcript: string) => void;
    sensitivityLevel: 'low' | 'medium' | 'high';
}

// Actual threat-related keywords
const THREAT_KEYWORDS = [
    'help', 'attack', 'danger', 'emergency', 'police', 'fire', 'ambulance',
    'hurt', 'scared', 'threatening', 'weapon', 'gun', 'knife', 'assault',
    'rape', 'kidnap', 'abduct', 'murder', 'kill', 'harm', 'violence',
    'threat', 'threatening', 'stalking', 'following', 'chase', 'run',
    'scream', 'yell', 'stop', 'leave me alone', 'get away', 'help me'
];

export const useAudioThreatDetection = ({
                                            isActive,
                                            onThreatDetected,
                                            sensitivityLevel,
                                        }: AudioThreatDetectionProps) => {
    const [isListening, setIsListening] = useState(false);
    const isActiveRef = useRef(isActive);

    useEffect(() => {
        isActiveRef.current = isActive;
    }, [isActive]);

    useEffect(() => {
        console.log('Threat detection initialized with sensitivity:', sensitivityLevel);
    }, [sensitivityLevel]);

    // Listen for speech recognition results
    useSpeechRecognitionEvent('result', (event: any) => {
        const transcript = event.results[0]?.transcript?.toLowerCase() || '';

        if (!transcript) return;

        console.log('Transcript:', transcript);

        // Check for threat words using whole-word matching
        const words = transcript.split(/\s+/);
        const detectedThreats = THREAT_KEYWORDS.filter(keyword => {
            // Handle multi-word phrases
            if (keyword.includes(' ')) {
                return transcript.includes(keyword.toLowerCase());
            }
            // Single word - check for whole word match
            return words.includes(keyword.toLowerCase());
        });

        if (detectedThreats.length > 0) {
            const confidence = calculateConfidence(detectedThreats.length, sensitivityLevel);
            const minConfidence = sensitivityLevel === 'high' ? 30 : sensitivityLevel === 'medium' ? 50 : 70;

            if (parseInt(confidence) >= minConfidence) {
                console.log('Threat detected:', detectedThreats, 'Confidence:', confidence + '%');
                onThreatDetected(`Threat detected: "${detectedThreats.join(', ')}" (confidence: ${confidence}%)`);
            }
        }
    });

    // Listen for speech recognition events
    useSpeechRecognitionEvent('start', () => {
        setIsListening(true);
        console.log('Speech recognition started');
    });

    useSpeechRecognitionEvent('end', () => {
        setIsListening(false);
        console.log('Speech recognition ended');

        // Auto-restart if still active
        if (isActiveRef.current) {
            setTimeout(async () => {
                if (isActiveRef.current) {
                    await startListening();
                }
            }, 1000);
        }
    });

    useSpeechRecognitionEvent('error', (event: any) => {
        console.error('Speech recognition error:', event.error);

        if (event.error === 'no-speech' && isActiveRef.current) {
            // Restart on no-speech
            setTimeout(async () => {
                if (isActiveRef.current) {
                    await startListening();
                }
            }, 1000);
        }
    });

    useEffect(() => {
        const initListening = async () => {
            if (isActive) {
                await startListening();
            } else {
                stopListening();
            }
        };

        initListening();

        return () => {
            stopListening();
        };
    }, [isActive]);

    const startListening = async () => {
        try {
            console.log('Starting speech recognition for threat detection...');

            // Request permissions
            const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
            if (!result.granted) {
                console.warn('Speech recognition permissions not granted', result);
                return;
            }

            // Start speech recognition
            ExpoSpeechRecognitionModule.start({
                lang: 'en-US',
                interimResults: true,
                maxAlternatives: 1,
                continuous: true,
                requiresOnDeviceRecognition: false,
            });

            setIsListening(true);
        } catch (error) {
            console.error('Error starting speech recognition:', error);
            setIsListening(false);
        }
    };

    const stopListening = () => {
        try {
            console.log('Stopping speech recognition...');
            ExpoSpeechRecognitionModule.stop();
            setIsListening(false);
        } catch (error) {
            console.error('Error stopping recognition:', error);
        }
    };

    const calculateConfidence = (threatCount: number, sensitivity: string): string => {
        const baseConfidence = Math.min(threatCount * 30, 100);
        const sensitivityMultiplier = sensitivity === 'high' ? 1.2 : sensitivity === 'medium' ? 1.0 : 0.8;
        return Math.min(baseConfidence * sensitivityMultiplier, 100).toFixed(0);
    };

    return { isListening };
};