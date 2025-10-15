import React from 'react';
import {
    Modal,
    View,
    StyleSheet,
} from 'react-native';
import BookListView from './BookListView';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface BookListModalProps {
    visible: boolean;
    onClose: () => void;
    listId: number;
    listName: string;
}

export default function BookListModal({
    visible,
    onClose,
    listId,
    listName
}: BookListModalProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <View style={[styles.container, { backgroundColor: isDark ? '#000000' : '#FFFFFF' }]}>
                <BookListView
                    listId={listId}
                    listName={listName}
                    onClose={onClose}
                />
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});