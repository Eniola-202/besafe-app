import { useEffect, useRef, useState } from 'react';
import ort  from 'onnxruntime-react-native';
import {
    ExpoSpeechRecognitionModule,
} from 'expo-speech-recognition';
import AudioRecord from 'react-native-audio-record';

interface ONNXThreatDetectionProps {
    isActive: boolean;
    onThreatDetected: (transcript: string) => void;
    sensitivityLevel: 'low' | 'medium' | 'high';
}

export const useONNXThreatDetection = ({
                                           isActive,
                                           onThreatDetected,
                                           sensitivityLevel,
                                       }: ONNXThreatDetectionProps) => {
    const [isListening, setIsListening] = useState(false);
    const [isModelLoaded, setIsModelLoaded] = useState(false);
    const sessionRef = useRef<ort.InferenceSession | null>(null);
    const recorderRef = useRef<typeof AudioRecord | null>(null);
    const processingIntervalRef = useRef<ReturnType<typeof setInterval>| null>(null);
    const audioBufferRef = useRef<Float32Array>(new Float32Array(0));

    // Load ONNX model
    useEffect(() => {
        const loadModel = async () => {
            try {
                const modelAsset = require('@/assets/SafeHer_ThreatModel.onnx');

                const session = await ort.InferenceSession.create(modelAsset);
                sessionRef.current = session;
                setIsModelLoaded(true);
                console.log('ONNX model loaded successfully');
            } catch (error) {
                console.error('Error loading ONNX model:', error);
            }
        };

        loadModel();

        return () => {
            if (sessionRef.current) {
                sessionRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (isActive && isModelLoaded) {
            startListening();
        } else {
            stopListening();
        }
    }, [isActive, isModelLoaded]);

    const base64ToFloat32Array = (base64: string): Float32Array => {
        // Decode base64 to binary string
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);

        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }

        // Convert bytes to 16-bit PCM samples
        const samples = new Float32Array(bytes.length / 2);
        const view = new DataView(bytes.buffer);

        for (let i = 0; i < samples.length; i++) {
            // Read 16-bit signed integer and normalize to [-1, 1]
            const int16 = view.getInt16(i * 2, true); // true = little endian
            samples[i] = int16 / 32768.0;
        }

        return samples;
    };

    const extractAudioFeatures = (audioData: Float32Array): Float32Array => {
        // Calculate basic audio features (mean, variance, energy)
        let sum = 0;
        let energy = 0;
        for (let i = 0; i < audioData.length; i++) {
            sum += audioData[i];
            energy += audioData[i] * audioData[i];
        }
        const mean = sum / audioData.length;
        const variance = energy / audioData.length - mean * mean;

        // Create feature vector - pad or truncate to expected model input size
        const featureSize = 512; // Adjust based on your model's expected input
        const features = new Float32Array(featureSize);

        // Fill features with audio data
        for (let i = 0; i < Math.min(featureSize, audioData.length); i++) {
            features[i] = audioData[i];
        }

        // Add statistical features at the end
        if (featureSize > 2) {
            features[featureSize - 2] = mean;
            features[featureSize - 1] = Math.sqrt(variance);
        }

        return features;
    };

    const processAudioChunk = async (audioData: Float32Array) => {
        if (!sessionRef.current || audioData.length === 0) return;

        try {
            // Check if there's actual audio (not silence)
            const hasAudio = Array.from(audioData).some(value => Math.abs(value) > 0.01);
            if (!hasAudio) return;

            // Extract features from audio
            const features = extractAudioFeatures(audioData);

            // Create tensor for model input
            const inputTensor = new ort.Tensor('float32', features, [1, features.length]);

            // Run inference
            const feeds: Record<string, ort.Tensor> = {};
            const inputName = sessionRef.current.inputNames[0];
            feeds[inputName] = inputTensor;

            const results = await sessionRef.current.run(feeds);
            const outputName = sessionRef.current.outputNames[0];
            const output = results[outputName];

            // Interpret results - assuming binary classification [non-threat, threat]
            const predictions = output.data as Float32Array;
            const threatProbability = predictions.length > 1 ? predictions[1] : predictions[0];

            // Apply sensitivity thresholds
            const threshold = sensitivityLevel === 'high' ? 0.3 :
                sensitivityLevel === 'medium' ? 0.5 : 0.7;

            if (threatProbability > threshold) {
                const confidence = (threatProbability * 100).toFixed(1);
                console.log(`Threat detected by ONNX model: ${confidence}% confidence`);
                onThreatDetected(`ONNX Model detected potential threat (${confidence}% confidence)`);

                // Stop processing temporarily to avoid duplicate alerts
                if (processingIntervalRef.current) {
                    clearInterval(processingIntervalRef.current);
                    processingIntervalRef.current = null;

                    // Resume after 5 seconds
                    setTimeout(() => {
                        if (isActive && isModelLoaded) {
                            startProcessing();
                        }
                    }, 5000);
                }
            }
        } catch (error) {
            console.error('Error processing audio with ONNX:', error);
        }
    };

    const startProcessing = () => {
        if (processingIntervalRef.current) return;

        // Process audio buffer every 500ms
        processingIntervalRef.current = setInterval(() => {
            if (audioBufferRef.current.length > 0) {
                processAudioChunk(audioBufferRef.current);
                audioBufferRef.current = new Float32Array(0); // Clear buffer
            }
        }, 500);
    };

    const startListening = async () => {
        try {
            console.log('Starting ONNX-based threat detection...');

            // Request permissions
            const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
            if (!result.granted) {
                console.warn('Permissions not granted', result);
                return;
            }

            // Initialize AudioRecord with configuration
            const options = {
                sampleRate: 16000,  // 16kHz is good for speech/threat detection
                channels: 1,        // Mono
                bitsPerSample: 16,
                audioSource: 6,     // VOICE_RECOGNITION
                wavFile: 'audio.wav'
            };

            AudioRecord.init(options);

            // Set up data listener for real-time audio chunks
            AudioRecord.on('data', (data: string) => {
                // data is base64 encoded audio chunk
                const audioChunk = base64ToFloat32Array(data);

                // Accumulate audio data in buffer
                const newBuffer = new Float32Array(
                    audioBufferRef.current.length + audioChunk.length
                );
                newBuffer.set(audioBufferRef.current);
                newBuffer.set(audioChunk, audioBufferRef.current.length);
                audioBufferRef.current = newBuffer;
            });

            // Start recording
            AudioRecord.start();
            recorderRef.current = AudioRecord;

            setIsListening(true);
            startProcessing();

            console.log('ONNX threat detection active with NitroSound');
        } catch (error) {
            console.error('Error starting ONNX threat detection:', error);
            setIsListening(false);
        }
    };

    const stopListening = async () => {
        console.log('Stopping ONNX threat detection...');

        if (processingIntervalRef.current) {
            clearInterval(processingIntervalRef.current);
            processingIntervalRef.current = null;
        }

        if (recorderRef.current) {
            try {
                AudioRecord.stop();
                recorderRef.current = null;
            } catch (error) {
                console.error('Error stopping recorder:', error);
            }
        }

        audioBufferRef.current = new Float32Array(0);
        setIsListening(false);
    };

    return { isListening, isModelLoaded };
};