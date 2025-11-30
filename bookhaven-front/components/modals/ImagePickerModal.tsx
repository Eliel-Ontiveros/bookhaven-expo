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
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
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
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        minHeight: 300,
        maxHeight: '80%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    closeButton: {
        padding: 4,
    },
    previewContainer: {
        width: '100%',
        height: 300,
        marginBottom: 20,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#f0f0f0',
        position: 'relative',
    },
    previewImage: {
        width: '100%',
        height: '100%',
    },
    removeImageButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'white',
        borderRadius: 16,
    },
    loadingContainer: {
        alignItems: 'center',
        padding: 40,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
    },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        gap: 16,
        marginTop: 20,
    },
    actionButton: {
        flex: 1,
        alignItems: 'center',
        padding: 20,
        borderRadius: 12,
        gap: 8,
    },
    actionButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    sendButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        gap: 8,
        marginTop: 12,
    },
    sendButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
