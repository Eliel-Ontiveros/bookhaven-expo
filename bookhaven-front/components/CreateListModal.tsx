import React, { useState } from 'react';
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiService } from '@/lib/api/service';
import { BookHavenTheme, getThemeColors, getModalStyles } from '@/constants/modal-theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface CreateListModalProps {
    visible: boolean;
    onClose: () => void;
    onListCreated: () => void;
}

export default function CreateListModal({ visible, onClose, onListCreated }: CreateListModalProps) {
    const [listName, setListName] = useState('');
    const [loading, setLoading] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const colors = getThemeColors(isDark);
    const modalStyles = getModalStyles(isDark);

    const handleCreateList = async () => {
        if (!listName.trim()) {
            Alert.alert('Error', 'Por favor ingresa un nombre para la lista');
            return;
        }

        setLoading(true);
        try {
            console.log('📚 Creating new book list:', listName);
            const response = await apiService.createBookList({ name: listName.trim() });

            if (response.success) {
                console.log('✅ List created successfully:', response.data);
                Alert.alert(
                    'Lista creada',
                    `La lista "${listName}" se ha creado exitosamente`,
                    [
                        {
                            text: 'OK',
                            onPress: () => {
                                setListName('');
                                onClose();
                                onListCreated();
                            }
                        }
                    ]
                );
            } else {
                console.error('❌ Failed to create list:', response.error);
                Alert.alert('Error', response.error || 'No se pudo crear la lista');
            }
        } catch (error) {
            console.error('❌ Error creating list:', error);
            Alert.alert('Error', 'Ocurrió un error al crear la lista');
        }
        setLoading(false);
    };

    const handleCancel = () => {
        setListName('');
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={modalStyles.overlay}>
                <View style={[modalStyles.modalContent, { backgroundColor: colors.background }]}>
                    {/* Header con icono */}
                    <View style={styles.iconContainer}>
                        <View style={[styles.iconCircle, { backgroundColor: colors.primary }]}>
                            <Ionicons name="library-outline" size={28} color={colors.white} />
                        </View>
                    </View>

                    <Text style={[modalStyles.title, { color: colors.primary, textAlign: 'center' as const }]}>
                        Crear Nueva Lista
                    </Text>

                    <View style={styles.inputContainer}>
                        <Text style={[modalStyles.caption, { color: colors.text, marginBottom: BookHavenTheme.spacing.sm }]}>
                            Nombre de la lista
                        </Text>
                        <TextInput
                            style={[
                                modalStyles.input,
                                { backgroundColor: colors.surface, borderColor: colors.gray, color: colors.text },
                                isFocused && { borderColor: colors.primary }
                            ]}
                            value={listName}
                            onChangeText={setListName}
                            placeholder="Ej: Mis favoritos, Clásicos, etc."
                            placeholderTextColor={colors.textLight}
                            maxLength={50}
                            editable={!loading}
                            autoFocus={true}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                        />
                        <Text style={[styles.charCounter, { color: colors.textLight }]}>
                            {listName.length}/50
                        </Text>
                    </View>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[modalStyles.outlineButton, { borderColor: colors.gray }]}
                            onPress={handleCancel}
                            disabled={loading}
                        >
                            <Text style={[modalStyles.outlineButtonText, { color: colors.textSecondary }]}>
                                Cancelar
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                modalStyles.primaryButton,
                                { backgroundColor: colors.primary },
                                (!listName.trim() || loading) && { opacity: 0.6 }
                            ]}
                            onPress={handleCreateList}
                            disabled={loading || !listName.trim()}
                        >
                            {loading ? (
                                <ActivityIndicator color={colors.white} size="small" />
                            ) : (
                                <Text style={[modalStyles.buttonText, { color: colors.white }]}>
                                    Crear Lista
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    inputContainer: {
        marginBottom: BookHavenTheme.spacing.xl,
    },
    charCounter: {
        fontSize: BookHavenTheme.typography.small.fontSize,
        textAlign: 'right' as const,
        marginTop: BookHavenTheme.spacing.xs,
    },
    buttonContainer: {
        flexDirection: 'row' as const,
        justifyContent: 'space-between' as const,
        gap: BookHavenTheme.spacing.md,
    },
    iconContainer: {
        alignItems: 'center' as const,
        marginBottom: BookHavenTheme.spacing.lg,
    },
    iconCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center' as const,
        alignItems: 'center' as const,
        ...BookHavenTheme.shadows.medium,
    },
});