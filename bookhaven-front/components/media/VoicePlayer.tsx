import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    TouchableOpacity,
    Text,
    StyleSheet,
    Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { VoiceNoteService } from '@/lib/api/voiceNotes';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface VoicePlayerProps {
    audioUrl: string; // S3 key
    audioDuration: number; // duración en segundos
    audioSize?: number;
    isOwnMessage?: boolean;
}

export default function VoicePlayer({
    audioUrl,
    audioDuration,
    audioSize = 0,
    isOwnMessage = false
}: VoicePlayerProps) {
    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [currentPosition, setCurrentPosition] = useState(0);
    const [duration, setDuration] = useState(audioDuration);
    const [signedUrl, setSignedUrl] = useState<string | null>(null);
    const positionUpdateRef = useRef<any>(null);

    useEffect(() => {
        return () => {
            if (sound) {
                sound.unloadAsync();
            }
        };
    }, [sound]);

    const getSignedUrl = async (): Promise<string> => {
        if (signedUrl) {
            return signedUrl;
        }

        try {
            const token = await AsyncStorage.getItem('authToken');
            if (!token) {
                throw new Error('No token available');
            }

            const url = await VoiceNoteService.getVoiceNoteUrl(audioUrl, token);
            setSignedUrl(url);
            return url;
        } catch (error) {
            console.error('Error getting signed URL:', error);
            throw error;
        }
    };

    const loadAudio = async () => {
        try {
            setIsLoading(true);

            const url = await getSignedUrl();

            // Configurar modo de audio
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: false,
                playsInSilentModeIOS: true,
                playThroughEarpieceAndroid: false,
                shouldDuckAndroid: true,
                staysActiveInBackground: false,
            });

            const { sound: newSound } = await Audio.Sound.createAsync(
                { uri: url },
                { shouldPlay: false }
            );

            setSound(newSound);

            // Obtener la duración real del audio
            const status = await newSound.getStatusAsync();
            if (status.isLoaded) {
                setDuration(Math.floor((status.durationMillis || audioDuration * 1000) / 1000));
            }

            return newSound;
        } catch (error) {
            console.error('Error loading audio:', error);
            Alert.alert('Error', 'No se pudo cargar la nota de voz');
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const playAudio = async () => {
        try {
            let audioSound = sound;

            if (!audioSound) {
                audioSound = await loadAudio();
            }

            if (audioSound) {
                await audioSound.playAsync();
                setIsPlaying(true);

                // Monitorear progreso
                positionUpdateRef.current = setInterval(async () => {
                    const status = await audioSound.getStatusAsync();
                    if (status.isLoaded) {
                        setCurrentPosition(Math.floor((status.positionMillis || 0) / 1000));

                        if (status.didJustFinish) {
                            setIsPlaying(false);
                            setCurrentPosition(0);
                            clearInterval(positionUpdateRef.current);
                        }
                    }
                }, 100);
            }
        } catch (error) {
            console.error('Error playing audio:', error);
            Alert.alert('Error', 'No se pudo reproducir la nota de voz');
        }
    };

    const pauseAudio = async () => {
        try {
            if (sound) {
                await sound.pauseAsync();
                setIsPlaying(false);
                if (positionUpdateRef.current) {
                    clearInterval(positionUpdateRef.current);
                }
            }
        } catch (error) {
            console.error('Error pausing audio:', error);
        }
    };

    const stopAudio = async () => {
        try {
            if (sound) {
                await sound.stopAsync();
                setIsPlaying(false);
                setCurrentPosition(0);
                if (positionUpdateRef.current) {
                    clearInterval(positionUpdateRef.current);
                }
            }
        } catch (error) {
            console.error('Error stopping audio:', error);
        }
    };

    const formatDuration = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '';
        const kb = bytes / 1024;
        if (kb < 1024) {
            return `${Math.round(kb)}KB`;
        }
        const mb = kb / 1024;
        return `${Math.round(mb * 10) / 10}MB`;
    };

    const getProgress = (): number => {
        return duration > 0 ? (currentPosition / duration) : 0;
    };

    return (
        <View style={[
            styles.container,
            isOwnMessage ? styles.ownMessage : styles.otherMessage
        ]}>
            <TouchableOpacity
                style={[
                    styles.playButton,
                    isOwnMessage ? styles.ownPlayButton : styles.otherPlayButton
                ]}
                onPress={isPlaying ? pauseAudio : playAudio}
                disabled={isLoading}
            >
                {isLoading ? (
                    <Ionicons name="refresh" size={20} color="#ffffff" />
                ) : (
                    <Ionicons
                        name={isPlaying ? "pause" : "play"}
                        size={20}
                        color="#ffffff"
                    />
                )}
            </TouchableOpacity>

            <View style={styles.audioInfo}>
                <View style={styles.waveformContainer}>
                    {/* Indicador de progreso visual */}
                    <View style={[
                        styles.progressBar,
                        isOwnMessage ? styles.ownProgressBar : styles.otherProgressBar
                    ]}>
                        <View
                            style={[
                                styles.progressFill,
                                isOwnMessage ? styles.ownProgressFill : styles.otherProgressFill,
                                { width: `${getProgress() * 100}%` }
                            ]}
                        />
                    </View>
                </View>

                <View style={styles.audioMeta}>
                    <Text style={[
                        styles.durationText,
                        isOwnMessage ? styles.ownText : styles.otherText
                    ]}>
                        {formatDuration(currentPosition)} / {formatDuration(duration)}
                    </Text>

                    {audioSize > 0 && (
                        <Text style={[
                            styles.sizeText,
                            isOwnMessage ? styles.ownText : styles.otherText
                        ]}>
                            {formatFileSize(audioSize)}
                        </Text>
                    )}
                </View>
            </View>

            {isPlaying && (
                <TouchableOpacity
                    style={styles.stopButton}
                    onPress={stopAudio}
                >
                    <Ionicons name="stop" size={16} color="#666" />
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 18,
        maxWidth: 250,
        minWidth: 200,
    },
    ownMessage: {
        backgroundColor: '#007AFF',
    },
    otherMessage: {
        backgroundColor: '#E5E5EA',
    },
    playButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    ownPlayButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
    },
    otherPlayButton: {
        backgroundColor: '#007AFF',
    },
    audioInfo: {
        flex: 1,
    },
    waveformContainer: {
        height: 20,
        justifyContent: 'center',
        marginBottom: 4,
    },
    progressBar: {
        height: 3,
        borderRadius: 1.5,
        overflow: 'hidden',
    },
    ownProgressBar: {
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
    },
    otherProgressBar: {
        backgroundColor: '#C7C7CC',
    },
    progressFill: {
        height: '100%',
        borderRadius: 1.5,
    },
    ownProgressFill: {
        backgroundColor: '#ffffff',
    },
    otherProgressFill: {
        backgroundColor: '#007AFF',
    },
    audioMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    durationText: {
        fontSize: 12,
        fontWeight: '500',
    },
    sizeText: {
        fontSize: 10,
        opacity: 0.7,
    },
    ownText: {
        color: '#ffffff',
    },
    otherText: {
        color: '#333333',
    },
    stopButton: {
        marginLeft: 8,
        padding: 4,
    },
});