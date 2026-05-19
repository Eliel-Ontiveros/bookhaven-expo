import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Modal,
    Alert,
    ActivityIndicator,
    Image,
    Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface ImagePickerModalProps {
    visible: boolean;
    onClose: () => void;
    onImageSelected: (imageUri: string) => void;
}

export default function ImagePickerModal({
    visible,
    onClose,
    onImageSelected
}: ImagePickerModalProps) {
    const theme = Colors['light'];
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const requestCameraPermission = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(
                'Permisos requeridos',
                'Necesitamos permisos para acceder a la cámara.',
                [{ text: 'OK' }]
            );
            return false;
        }
        return true;
    };

    const requestMediaLibraryPermission = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(
                'Permisos requeridos',
                'Necesitamos permisos para acceder a tus fotos.',
                [{ text: 'OK' }]
            );
            return false;
        }
        return true;
    };

    const handleTakePhoto = async () => {
        try {
            const hasPermission = await requestCameraPermission();
            if (!hasPermission) return;

            setLoading(true);
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8, // Comprimir un poco para reducir el tamaño
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const imageUri = result.assets[0].uri;
                setSelectedImage(imageUri);
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
        } catch (error) {
            console.error('Error al tomar foto:', error);
            Alert.alert('Error', 'No se pudo tomar la foto');
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } finally {
            setLoading(false);
        }
    };

    const handlePickFromGallery = async () => {
        try {
            const hasPermission = await requestMediaLibraryPermission();
            if (!hasPermission) return;

            setLoading(true);
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const imageUri = result.assets[0].uri;
                setSelectedImage(imageUri);
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
        } catch (error) {
            console.error('Error al seleccionar foto:', error);
            Alert.alert('Error', 'No se pudo seleccionar la foto');
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } finally {
            setLoading(false);
        }
    };

    const handleSendImage = () => {
        if (selectedImage) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onImageSelected(selectedImage);
            handleClose();
        }
    };

    const handleClose = () => {
        setSelectedImage(null);
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={handleClose}
        >
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={[styles.headerTitle, { color: theme.text }]}>
                            Compartir imagen
                        </Text>
                        <TouchableOpacity
                            onPress={handleClose}
                            style={styles.closeButton}
                        >
                            <Ionicons name="close" size={24} color={theme.text} />
                        </TouchableOpacity>
                    </View>

                    {/* Preview de imagen seleccionada */}
                    {selectedImage && (
                        <View style={styles.previewContainer}>
                            <Image
                                source={{ uri: selectedImage }}
                                style={styles.previewImage}
                                resizeMode="contain"
                            />
                            <TouchableOpacity
                                style={styles.removeImageButton}
                                onPress={() => {
                                    setSelectedImage(null);
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                }}
                            >
                                <Ionicons name="close-circle" size={32} color="#FF6B6B" />
                            </TouchableOpacity>
                        </View>
                    )}

                    {loading && (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={theme.tint} />
                            <Text style={[styles.loadingText, { color: theme.text }]}>
                                Procesando...
                            </Text>
                        </View>
                    )}

                    {/* Botones de acción */}
                    {!selectedImage && !loading && (
                        <View style={styles.actionsContainer}>
                            <TouchableOpacity
                                style={[styles.actionButton, { backgroundColor: theme.tint }]}
                                onPress={handleTakePhoto}
                            >
                                <Ionicons name="camera" size={32} color="#fff" />
                                <Text style={styles.actionButtonText}>Tomar foto</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.actionButton, { backgroundColor: theme.tint }]}
                                onPress={handlePickFromGallery}
                            >
                                <Ionicons name="images" size={32} color="#fff" />
                                <Text style={styles.actionButtonText}>Galería</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Botón enviar */}
                    {selectedImage && !loading && (
                        <TouchableOpacity
                            style={[styles.sendButton, { backgroundColor: '#4CAF50' }]}
                            onPress={handleSendImage}
                        >
                            <Ionicons name="send" size={20} color="#fff" />
                            <Text style={styles.sendButtonText}>Enviar imagen</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(47, 27, 20, 0.65)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        padding: 24,
        minHeight: 300,
        maxHeight: '80%',
        backgroundColor: '#FFFFF0',
        shadowColor: '#8B4513',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.18,
        shadowRadius: 16,
        elevation: 12,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(139, 69, 19, 0.1)',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#2F1B14',
        letterSpacing: 0.2,
    },
    closeButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#F0E8E0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    previewContainer: {
        width: '100%',
        height: 280,
        marginBottom: 20,
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: '#F5F0E8',
        position: 'relative',
        borderWidth: 1,
        borderColor: 'rgba(139, 69, 19, 0.12)',
        shadowColor: '#8B4513',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 5,
    },
    previewImage: {
        width: '100%',
        height: '100%',
    },
    removeImageButton: {
        position: 'absolute',
        top: 12,
        right: 12,
        backgroundColor: 'white',
        borderRadius: 18,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    loadingContainer: {
        alignItems: 'center',
        padding: 40,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 15,
        color: '#8D6E63',
    },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        gap: 14,
        marginTop: 8,
    },
    actionButton: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 24,
        paddingHorizontal: 16,
        borderRadius: 20,
        gap: 10,
        backgroundColor: '#8B4513',
        shadowColor: '#8B4513',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 6,
    },
    actionButtonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '700',
        letterSpacing: 0.2,
    },
    sendButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 24,
        gap: 8,
        marginTop: 12,
        backgroundColor: '#2E8B57',
        shadowColor: '#2E8B57',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 6,
    },
    sendButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
});
