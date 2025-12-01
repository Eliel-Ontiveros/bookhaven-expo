import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    TouchableOpacity,
    Text,
    StyleSheet,
    Alert,
    Animated,
    Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import * as Haptics from 'expo-haptics';

interface VoiceRecorderProps {
    onRecordingComplete: (audioUri: string, duration: number) => void;
    onCancel: () => void;
    disabled?: boolean;
}

export default function VoiceRecorder({
    onRecordingComplete,
    onCancel,
    disabled = false
}: VoiceRecorderProps) {
    const [recording, setRecording] = useState<Audio.Recording | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const [hasPermission, setHasPermission] = useState(false);
    const durationRef = useRef(0);
    const intervalRef = useRef<NodeJS.Timeout>();
    const pulseAnimation = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        requestPermissions();
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    // Animación de pulso durante la grabación
    useEffect(() => {
        if (isRecording) {
            const pulse = Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnimation, {
                        toValue: 1.2,
                        duration: 500,
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnimation, {
                        toValue: 1,
                        duration: 500,
                        useNativeDriver: true,
                    }),
                ])
            );
            pulse.start();
        } else {
            pulseAnimation.setValue(1);
        }
    }, [isRecording]);

    const requestPermissions = async () => {
        try {
            const { status } = await Audio.requestPermissionsAsync();
            setHasPermission(status === 'granted');

            if (status !== 'granted') {
                Alert.alert(
                    'Permisos requeridos',
                    'Necesitamos permisos para acceder al micrófono para grabar notas de voz.',
                    [{ text: 'OK' }]
                );
            }
        } catch (error) {
            console.error('Error requesting permissions:', error);
        }
    };

    const startRecording = async () => {
        try {
            if (!hasPermission) {
                await requestPermissions();
                return;
            }

            // Configurar modo de audio
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
                playThroughEarpieceAndroid: false,
                shouldDuckAndroid: true,
                staysActiveInBackground: false,
            });

            const { recording } = await Audio.Recording.createAsync({
                android: {
                    extension: '.m4a',
                    outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
                    audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
                    sampleRate: 44100,
                    numberOfChannels: 2,
                    bitRate: 128000,
                },
                ios: {
                    extension: '.m4a',
                    outputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_MPEG4AAC,
                    audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
                    sampleRate: 44100,
                    numberOfChannels: 2,
                    bitRate: 128000,
                    linearPCMBitDepth: 16,
                    linearPCMIsBigEndian: false,
                    linearPCMIsFloat: false,
                },
                web: {
                    mimeType: 'audio/webm;codecs=opus',
                    bitsPerSecond: 128000,
                },
            });

            setRecording(recording);
            setIsRecording(true);
            setRecordingDuration(0);
            durationRef.current = 0;

            // Iniciar contador de duración
            intervalRef.current = setInterval(() => {
                durationRef.current += 1;
                setRecordingDuration(durationRef.current);
            }, 1000);

            // Haptic feedback al iniciar
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } catch (error) {
            console.error('Error starting recording:', error);
            Alert.alert('Error', 'No se pudo iniciar la grabación');
        }
    };

    const stopRecording = async () => {
        try {
            if (!recording) return;

            await recording.stopAndUnloadAsync();
            setIsRecording(false);

            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }

            const uri = recording.getURI();
            if (uri) {
                // Haptic feedback al completar
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

                onRecordingComplete(uri, durationRef.current);
            }

            setRecording(null);
        } catch (error) {
            console.error('Error stopping recording:', error);
            Alert.alert('Error', 'No se pudo detener la grabación');
        }
    };

    const cancelRecording = async () => {
        try {
            if (recording) {
                await recording.stopAndUnloadAsync();
                setRecording(null);
            }

            setIsRecording(false);
            setRecordingDuration(0);

            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }

            // Haptic feedback para cancelación
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onCancel();
        } catch (error) {
            console.error('Error canceling recording:', error);
        }
    };

    const formatDuration = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (!hasPermission) {
        return (
            <View style={styles.permissionContainer}>
                <Text style={styles.permissionText}>
                    Permisos de micrófono requeridos
                </Text>
                <TouchableOpacity onPress={requestPermissions} style={styles.permissionButton}>
                    <Text style={styles.permissionButtonText}>Conceder permisos</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {isRecording ? (
                // Interfaz durante la grabación
                <View style={styles.recordingContainer}>
                    <View style={styles.recordingInfo}>
                        <Animated.View style={[
                            styles.recordingIndicator,
                            { transform: [{ scale: pulseAnimation }] }
                        ]}>
                            <View style={styles.recordingDot} />
                        </Animated.View>
                        <Text style={styles.recordingText}>Grabando...</Text>
                        <Text style={styles.durationText}>{formatDuration(recordingDuration)}</Text>
                    </View>

                    <View style={styles.recordingButtons}>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={cancelRecording}
                        >
                            <Ionicons name="close" size={24} color="#ffffff" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.stopButton}
                            onPress={stopRecording}
                        >
                            <Ionicons name="stop" size={24} color="#ffffff" />
                        </TouchableOpacity>
                    </View>
                </View>
            ) : (
                // Botón para iniciar grabación
                <TouchableOpacity
                    style={[styles.startButton, disabled && styles.disabledButton]}
                    onPress={startRecording}
                    disabled={disabled}
                >
                    <Ionicons
                        name="mic"
                        size={24}
                        color={disabled ? "#999" : "#ffffff"}
                    />
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    permissionContainer: {
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        margin: 16,
    },
    permissionText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 12,
    },
    permissionButton: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 6,
    },
    permissionButtonText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '500',
    },
    recordingContainer: {
        alignItems: 'center',
        padding: 16,
        backgroundColor: 'rgba(255, 59, 48, 0.1)',
        borderRadius: 12,
        minWidth: 200,
    },
    recordingInfo: {
        alignItems: 'center',
        marginBottom: 16,
    },
    recordingIndicator: {
        marginBottom: 8,
    },
    recordingDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#FF3B30',
    },
    recordingText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#FF3B30',
        marginBottom: 4,
    },
    durationText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    recordingButtons: {
        flexDirection: 'row',
        gap: 16,
    },
    cancelButton: {
        backgroundColor: '#666',
        width: 50,
        height: 50,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
    },
    stopButton: {
        backgroundColor: '#FF3B30',
        width: 50,
        height: 50,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
    },
    startButton: {
        backgroundColor: '#007AFF',
        width: 50,
        height: 50,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
    },
    disabledButton: {
        backgroundColor: '#ccc',
    },
});