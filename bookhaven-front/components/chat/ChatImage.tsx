import React, { useState, useEffect } from 'react';
import {
    View,
    Image,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Modal,
    Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ImageService } from '@/lib/api/images';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ChatImageProps {
    imageUrl: string; // S3 key
    imageWidth?: number;
    imageHeight?: number;
    isOwnMessage: boolean;
}

export default function ChatImage({
    imageUrl,
    imageWidth = 300,
    imageHeight = 300,
    isOwnMessage
}: ChatImageProps) {
    const [signedUrl, setSignedUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [fullscreenVisible, setFullscreenVisible] = useState(false);

    const screenWidth = Dimensions.get('window').width;
    const maxWidth = screenWidth * 0.6; // 60% del ancho de pantalla
    const maxHeight = 300;

    // Calcular dimensiones manteniendo la proporción
    let displayWidth = imageWidth || maxWidth;
    let displayHeight = imageHeight || maxHeight;

    if (displayWidth > maxWidth) {
        const ratio = maxWidth / displayWidth;
        displayWidth = maxWidth;
        displayHeight = displayHeight * ratio;
    }

    if (displayHeight > maxHeight) {
        const ratio = maxHeight / displayHeight;
        displayHeight = maxHeight;
        displayWidth = displayWidth * ratio;
    }

    useEffect(() => {
        loadImage();
    }, [imageUrl]);

    const loadImage = async () => {
        try {
            setLoading(true);
            setError(false);

            if (!imageUrl) {
                console.error('❌ ChatImage: No imageUrl provided');
                setError(true);
                setLoading(false);
                return;
            }

            const token = await AsyncStorage.getItem('authToken');
            if (!token) {
                throw new Error('No token');
            }

            const url = await ImageService.getImageUrl(imageUrl, token);
            setSignedUrl(url);
        } catch (err) {
            console.error('Error loading image:', err);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, { width: displayWidth, height: displayHeight }]}>
                <ActivityIndicator size="large" color={isOwnMessage ? '#fff' : '#007AFF'} />
            </View>
        );
    }

    if (error || !signedUrl) {
        return (
            <View style={[styles.container, styles.errorContainer, { width: displayWidth, height: displayHeight }]}>
                <Ionicons
                    name="image-outline"
                    size={48}
                    color={isOwnMessage ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.3)'}
                />
            </View>
        );
    }

    return (
        <>
            <TouchableOpacity
                onPress={() => setFullscreenVisible(true)}
                activeOpacity={0.9}
            >
                <Image
                    source={{ uri: signedUrl }}
                    style={[
                        styles.image,
                        {
                            width: displayWidth,
                            height: displayHeight,
                        }
                    ]}
                    resizeMode="cover"
                />
            </TouchableOpacity>

            {/* Modal de pantalla completa */}
            <Modal
                visible={fullscreenVisible}
                transparent
                onRequestClose={() => setFullscreenVisible(false)}
            >
                <View style={styles.fullscreenContainer}>
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={() => setFullscreenVisible(false)}
                    >
                        <Ionicons name="close" size={32} color="#fff" />
                    </TouchableOpacity>

                    <Image
                        source={{ uri: signedUrl }}
                        style={styles.fullscreenImage}
                        resizeMode="contain"
                    />
                </View>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: 'rgba(0,0,0,0.1)',
    },
    errorContainer: {
        backgroundColor: 'rgba(0,0,0,0.05)',
    },
    image: {
        borderRadius: 12,
    },
    fullscreenContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.95)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 10,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 20,
        padding: 8,
    },
    fullscreenImage: {
        width: '100%',
        height: '100%',
    },
});
