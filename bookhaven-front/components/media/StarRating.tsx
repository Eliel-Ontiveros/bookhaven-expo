import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiService } from '@/lib/api/service';
import { BookRating, CreateRatingRequest } from '@/lib/api/types';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface StarRatingProps {
    bookId: string;
    showLabel?: boolean;
    size?: 'small' | 'medium' | 'large';
    readonly?: boolean;
    onRatingChange?: (rating: number) => void;
}

export default function StarRating({
    bookId,
    showLabel = true,
    size = 'medium',
    readonly = false,
    onRatingChange
}: StarRatingProps) {
    const [userRating, setUserRating] = useState(0);
    const [averageRating, setAverageRating] = useState(0);
    const [totalRatings, setTotalRatings] = useState(0);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const starSizes = {
        small: 16,
        medium: 20,
        large: 24,
    };

    const starSize = starSizes[size];

    useEffect(() => {
        if (bookId) {
            fetchRatings();
        }
    }, [bookId]);

    const fetchRatings = async () => {
        setLoading(true);
        try {
            const response = await apiService.getBookRatings(bookId);
            if (response.success && response.data) {
                const ratings = response.data;

                // Calcular promedio
                if (ratings.length > 0) {
                    const total = ratings.reduce((sum, rating) => sum + rating.rating, 0);
                    setAverageRating(total / ratings.length);
                    setTotalRatings(ratings.length);

                    // Si el usuario actual tiene un rating, mostrarlo
                    // TODO: Obtener el userId del contexto de autenticación cuando esté disponible
                    // const userRatingData = ratings.find(r => r.userId === currentUserId);
                    // if (userRatingData) {
                    //   setUserRating(userRatingData.rating);
                    // }
                } else {
                    setAverageRating(0);
                    setTotalRatings(0);
                }
            } else {
                console.error('Error fetching ratings:', response.error);
            }
        } catch (error) {
            console.error('Error fetching ratings:', error);
        } finally {
            setLoading(false);
        }
    };

    const submitRating = async (rating: number) => {
        if (readonly) return;

        setSubmitting(true);
        try {
            const ratingData: CreateRatingRequest = {
                bookId,
                rating,
            };

            const response = await apiService.createOrUpdateRating(ratingData);

            if (response.success) {
                setUserRating(rating);
                onRatingChange?.(rating);
                // Actualizar las calificaciones después de enviar
                fetchRatings();
                Alert.alert('¡Éxito!', 'Tu calificación ha sido guardada');
            } else {
                Alert.alert('Error', response.error || 'No se pudo guardar tu calificación');
            }
        } catch (error) {
            Alert.alert('Error', 'Error al guardar la calificación');
        } finally {
            setSubmitting(false);
        }
    };

    const deleteRating = async () => {
        if (readonly || userRating === 0) return;

        Alert.alert(
            'Eliminar Calificación',
            '¿Estás seguro de que quieres eliminar tu calificación?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        setSubmitting(true);
                        try {
                            const response = await apiService.deleteRating(bookId);
                            if (response.success) {
                                setUserRating(0);
                                onRatingChange?.(0);
                                fetchRatings();
                                Alert.alert('¡Éxito!', 'Tu calificación ha sido eliminada');
                            } else {
                                Alert.alert('Error', response.error || 'No se pudo eliminar la calificación');
                            }
                        } catch (error) {
                            Alert.alert('Error', 'Error al eliminar la calificación');
                        } finally {
                            setSubmitting(false);
                        }
                    }
                }
            ]
        );
    };

    const renderStars = (rating: number, interactive: boolean = false) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            const filled = i <= rating;
            const half = i - 0.5 === rating;

            stars.push(
                <TouchableOpacity
                    key={i}
                    onPress={() => interactive && !submitting ? submitRating(i) : undefined}
                    disabled={readonly || submitting}
                    style={styles.starButton}
                >
                    <Ionicons
                        name={filled ? 'star' : (half ? 'star-half' : 'star-outline')}
                        size={starSize}
                        color={filled || half ? '#FFD700' : (isDark ? '#8E8E93' : '#C7C7CC')}
                    />
                </TouchableOpacity>
            );
        }
        return stars;
    };

    if (loading && totalRatings === 0) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={isDark ? '#007AFF' : '#007AFF'} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Average Rating Display */}
            {totalRatings > 0 && (
                <View style={styles.averageContainer}>
                    <View style={styles.starsContainer}>
                        {renderStars(Math.round(averageRating))}
                    </View>
                    {showLabel && (
                        <View style={styles.ratingInfo}>
                            <Text style={[styles.averageText, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                                {averageRating.toFixed(1)}
                            </Text>
                            <Text style={[styles.countText, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
                                ({totalRatings} {totalRatings === 1 ? 'calificación' : 'calificaciones'})
                            </Text>
                        </View>
                    )}
                </View>
            )}

            {/* User Rating Section */}
            {!readonly && (
                <View style={styles.userRatingContainer}>
                    <Text style={[styles.userRatingLabel, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                        Tu calificación:
                    </Text>
                    <View style={styles.userStarsContainer}>
                        <View style={styles.starsContainer}>
                            {renderStars(userRating, true)}
                        </View>
                        {submitting && (
                            <ActivityIndicator
                                size="small"
                                color={isDark ? '#007AFF' : '#007AFF'}
                                style={styles.submitIndicator}
                            />
                        )}
                        {userRating > 0 && !submitting && (
                            <TouchableOpacity
                                onPress={deleteRating}
                                style={styles.deleteButton}
                            >
                                <Ionicons
                                    name="trash-outline"
                                    size={16}
                                    color={isDark ? '#FF3B30' : '#FF3B30'}
                                />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            )}

            {/* Read-only mode with no ratings */}
            {readonly && totalRatings === 0 && (
                <View style={styles.noRatingsContainer}>
                    <Text style={[styles.noRatingsText, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
                        Sin calificaciones aún
                    </Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 12,
    },
    loadingContainer: {
        alignItems: 'center',
        paddingVertical: 8,
    },
    averageContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    starsContainer: {
        flexDirection: 'row',
        gap: 2,
    },
    starButton: {
        padding: 2,
    },
    ratingInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    averageText: {
        fontSize: 16,
        fontWeight: '600',
    },
    countText: {
        fontSize: 14,
    },
    userRatingContainer: {
        gap: 8,
    },
    userRatingLabel: {
        fontSize: 16,
        fontWeight: '500',
    },
    userStarsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    submitIndicator: {
        marginLeft: 8,
    },
    deleteButton: {
        padding: 4,
        marginLeft: 4,
    },
    noRatingsContainer: {
        alignItems: 'center',
        paddingVertical: 8,
    },
    noRatingsText: {
        fontSize: 14,
        fontStyle: 'italic',
    },
});