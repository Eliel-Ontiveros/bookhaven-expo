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
import { apiService } from '@/lib/api/service';

interface CreateListModalProps {
    visible: boolean;
    onClose: () => void;
    onListCreated: () => void;
}

export default function CreateListModal({ visible, onClose, onListCreated }: CreateListModalProps) {
    const [listName, setListName] = useState('');
    const [loading, setLoading] = useState(false);

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
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    <Text style={styles.title}>Crear Nueva Lista</Text>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Nombre de la lista</Text>
                        <TextInput
                            style={styles.input}
                            value={listName}
                            onChangeText={setListName}
                            placeholder="Ej: Mis favoritos, Clásicos, etc."
                            placeholderTextColor="#999"
                            maxLength={50}
                            editable={!loading}
                            autoFocus={true}
                        />
                        <Text style={styles.charCounter}>{listName.length}/50</Text>
                    </View>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton]}
                            onPress={handleCancel}
                            disabled={loading}
                        >
                            <Text style={styles.cancelButtonText}>Cancelar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.button, styles.createButton]}
                            onPress={handleCreateList}
                            disabled={loading || !listName.trim()}
                        >
                            {loading ? (
                                <ActivityIndicator color="#FFFFFF" size="small" />
                            ) : (
                                <Text style={styles.createButtonText}>Crear Lista</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modal: {
        backgroundColor: '#F5F5DC',
        borderRadius: 15,
        padding: 25,
        width: '100%',
        maxWidth: 400,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 10,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#8B4513',
        textAlign: 'center',
        marginBottom: 25,
    },
    inputContainer: {
        marginBottom: 25,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#8B4513',
        marginBottom: 8,
    },
    input: {
        borderWidth: 2,
        borderColor: '#DDD',
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 12,
        fontSize: 16,
        backgroundColor: '#FFFACD',
        color: '#8B4513',
    },
    charCounter: {
        fontSize: 12,
        color: '#999',
        textAlign: 'right',
        marginTop: 5,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 15,
    },
    button: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 45,
    },
    cancelButton: {
        backgroundColor: '#DDD',
        borderWidth: 1,
        borderColor: '#999',
    },
    createButton: {
        backgroundColor: '#4682B4',
    },
    cancelButtonText: {
        color: '#666',
        fontSize: 16,
        fontWeight: '600',
    },
    createButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});