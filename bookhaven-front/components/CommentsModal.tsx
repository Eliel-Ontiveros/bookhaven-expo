import React from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Comments from './Comments';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { BookHavenTheme, getThemeColors, getModalStyles } from '@/constants/modal-theme';

interface CommentsModalProps {
    visible: boolean;
    onClose: () => void;
    bookId: string;
    bookTitle: string;
}

export default function CommentsModal({
    visible,
    onClose,
    bookId,
    bookTitle
}: CommentsModalProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const colors = getThemeColors(isDark);
    const modalStyles = getModalStyles(isDark);

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <View style={[modalStyles.modalContainer, { backgroundColor: colors.background }]}>
                {/* Header */}
                <View style={[modalStyles.header, { borderBottomColor: colors.gray }]}>
                    <TouchableOpacity
                        onPress={onClose}
                        style={[modalStyles.closeButton, { backgroundColor: colors.lightGray }]}
                    >
                        <Ionicons
                            name="close"
                            size={20}
                            color={colors.primary}
                        />
                    </TouchableOpacity>
                    <View style={styles.titleContainer}>
                        <View style={[styles.commentIcon, { backgroundColor: colors.primary }]}>
                            <Ionicons name="chatbubbles" size={20} color={colors.white} />
                        </View>
                        <Text style={[modalStyles.headerTitle, { color: colors.primary }]}>
                            Comentarios
                        </Text>
                        <Text style={[modalStyles.caption, { color: colors.textSecondary, textAlign: 'center' as const }]} numberOfLines={1}>
                            {bookTitle}
                        </Text>
                    </View>
                    <View style={{ width: 40 }} />
                </View>

                {/* Comments Component */}
                <Comments bookId={bookId} />
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        justifyContent: 'space-between' as const,
        paddingHorizontal: BookHavenTheme.spacing.lg,
        paddingVertical: BookHavenTheme.spacing.md,
        borderBottomWidth: 1,
    },
    closeButton: {
        width: 40,
        height: 40,
        justifyContent: 'center' as const,
        alignItems: 'flex-start' as const,
    },
    titleContainer: {
        flex: 1,
        alignItems: 'center' as const,
        gap: BookHavenTheme.spacing.xs,
    },
    commentIcon: {
        width: 32,
        height: 32,
        borderRadius: BookHavenTheme.borderRadius.md,
        justifyContent: 'center' as const,
        alignItems: 'center' as const,
        ...BookHavenTheme.shadows.small,
    },
    title: {
        fontSize: 18,
        fontWeight: '600' as const,
        marginBottom: 2,
    },
    bookTitle: {
        fontSize: 14,
        textAlign: 'center' as const,
    },
});