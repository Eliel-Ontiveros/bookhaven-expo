import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Dimensions,
    ActivityIndicator,
    ScrollView,
    Image,
    Alert,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { apiService } from '@/lib/api/service';
import { Book } from '@/lib/api/types';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const FRAME_W = SCREEN_W * 0.85;
const FRAME_H = 160;

export default function ARScannerScreen() {
    const [permission, requestPermission] = useCameraPermissions();
    const [scanning, setScanning] = useState(false);
    const [detectedBook, setDetectedBook] = useState<Book | null>(null);
    const [candidates, setCandidates] = useState<Book[]>([]);
    const [mode, setMode] = useState<'idle' | 'scanning' | 'result'>('idle');

    const lastScanRef = useRef<number>(0);
    const cameraRef = useRef<CameraView>(null);
    const insets = useSafeAreaInsets();

    // Animaciones
    const scanLineAnim = useRef(new Animated.Value(0)).current;
    const overlayAnim = useRef(new Animated.Value(0)).current;
    const overlaySlide = useRef(new Animated.Value(80)).current;
    const frameAnim = useRef(new Animated.Value(1)).current;
    const cornerGlow = useRef(new Animated.Value(0.4)).current;

    // Animación de línea de escaneo (loop)
    useEffect(() => {
        const scanLoop = Animated.loop(
            Animated.sequence([
                Animated.timing(scanLineAnim, {
                    toValue: 1,
                    duration: 1500,
                    useNativeDriver: true,
                }),
                Animated.timing(scanLineAnim, {
                    toValue: 0,
                    duration: 1500,
                    useNativeDriver: true,
                }),
            ])
        );
        scanLoop.start();

        // Animación de corners pulsando
        const cornerLoop = Animated.loop(
            Animated.sequence([
                Animated.timing(cornerGlow, { toValue: 1, duration: 1000, useNativeDriver: true }),
                Animated.timing(cornerGlow, { toValue: 0.4, duration: 1000, useNativeDriver: true }),
            ])
        );
        cornerLoop.start();

        return () => {
            scanLoop.stop();
            cornerLoop.stop();
        };
    }, []);

    const showOverlay = () => {
        Animated.parallel([
            Animated.spring(overlayAnim, {
                toValue: 1,
                useNativeDriver: true,
                tension: 60,
                friction: 9,
            }),
            Animated.spring(overlaySlide, {
                toValue: 0,
                useNativeDriver: true,
                tension: 60,
                friction: 9,
            }),
        ]).start();
    };

    const hideOverlay = () => {
        Animated.parallel([
            Animated.timing(overlayAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
            Animated.timing(overlaySlide, { toValue: 80, duration: 250, useNativeDriver: true }),
        ]).start(() => {
            setDetectedBook(null);
            setCandidates([]);
            setMode('idle');
        });
    };

    // Fallback: buscar en Open Library cuando Google Books no tiene el libro
    const searchOpenLibrary = async (isbn: string): Promise<Book | null> => {
        try {
            const res = await fetch(
                `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`
            );
            if (!res.ok) return null;
            const json = await res.json();
            const entry = json[`ISBN:${isbn}`];
            if (!entry) return null;
            return {
                id: `ol_${isbn}`,
                title: entry.title ?? 'Título no disponible',
                authors: entry.authors?.map((a: any) => a.name).join(', ') ?? 'Autor desconocido',
                description: entry.notes ?? 'Descripción no disponible',
                image: entry.cover?.medium ?? entry.cover?.large ?? entry.cover?.small ?? null,
                categories: entry.subjects?.slice(0, 3).map((s: any) => s.name ?? s) ?? [],
                averageRating: null,
            } as Book;
        } catch {
            return null;
        }
    };

    const handleBarcodeScanned = useCallback(async ({ data }: { type: string; data: string }) => {
        if (mode === 'result') return;
        const now = Date.now();
        if (now - lastScanRef.current < 3000) return;
        lastScanRef.current = now;

        setScanning(true);
        setMode('scanning');

        Animated.sequence([
            Animated.timing(frameAnim, { toValue: 1.04, duration: 120, useNativeDriver: true }),
            Animated.timing(frameAnim, { toValue: 1, duration: 120, useNativeDriver: true }),
        ]).start();

        try {
            const response = await apiService.searchBooks({ query: `isbn:${data}`, page: 1, limit: 5 });

            if (response.success && response.data && response.data.length > 0) {
                setDetectedBook(response.data[0]);
                setCandidates(response.data.slice(1, 4));
                setMode('result');
                showOverlay();
            } else {
                // Google Books no lo encontró → intentar Open Library
                console.log('[AR Scanner] Google Books sin resultados, probando Open Library...');
                const olBook = await searchOpenLibrary(data);
                if (olBook) {
                    setDetectedBook(olBook);
                    setCandidates([]);
                    setMode('result');
                    showOverlay();
                } else {
                    Alert.alert(
                        'Libro no encontrado',
                        `No se encontró el libro con ISBN: ${data}\n\nEl libro puede no estar registrado en las bases de datos disponibles.`,
                        [{ text: 'Intentar de nuevo', onPress: () => setMode('idle') }]
                    );
                    setMode('idle');
                }
            }
        } catch (error: any) {
            const msg: string = error?.message ?? 'Error desconocido';
            console.error('[AR Scanner] Error:', msg);
            Alert.alert('Error', msg, [{ text: 'OK', onPress: () => setMode('idle') }]);
            setMode('idle');
        } finally {
            setScanning(false);
        }
    }, [mode]);

    const openBookDetail = (book: Book) => {
        router.push({
            pathname: '/book-detail',
            params: { book: JSON.stringify(book) },
        });
    };

    if (!permission) {
        return (
            <View style={styles.permissionContainer}>
                <ActivityIndicator color="#8B4513" size="large" />
            </View>
        );
    }

    if (!permission.granted) {
        return (
            <View style={styles.permissionContainer}>
                <View style={styles.permissionCard}>
                    <Ionicons name="camera-outline" size={64} color="#8B4513" />
                    <Text style={styles.permissionTitle}>Cámara requerida</Text>
                    <Text style={styles.permissionText}>
                        Para escanear portadas de libros necesitamos acceso a tu cámara.
                    </Text>
                    <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
                        <Text style={styles.permissionButtonText}>Permitir acceso</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.permissionBack} onPress={() => router.back()}>
                        <Text style={styles.permissionBackText}>Volver</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    const scanLineTranslate = scanLineAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, FRAME_H - 2],
    });

    return (
        <View style={styles.container}>
            {/* Cámara en fondo completo */}
            <CameraView
                ref={cameraRef}
                style={StyleSheet.absoluteFill}
                facing="back"
                onBarcodeScanned={mode !== 'result' ? handleBarcodeScanned : undefined}
                barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8'] }}
            />

            {/* Overlay oscuro alrededor del frame */}
            <View style={styles.darkOverlay}>
                {/* Fila superior */}
                <View style={[styles.darkRegion, { height: (SCREEN_H - FRAME_H) / 2 }]} />
                {/* Fila media */}
                <View style={styles.middleRow}>
                    <View style={[styles.darkRegion, { width: (SCREEN_W - FRAME_W) / 2 }]} />
                    {/* Frame transparente (ventana de escaneo) */}
                    <Animated.View
                        style={[styles.scanFrame, { transform: [{ scale: frameAnim }] }]}
                    >
                        {/* Línea de escaneo */}
                        {mode !== 'result' && (
                            <Animated.View
                                style={[
                                    styles.scanLine,
                                    { transform: [{ translateY: scanLineTranslate }] },
                                ]}
                            />
                        )}
                        {/* Corners AR */}
                        {(['tl', 'tr', 'bl', 'br'] as const).map((pos) => (
                            <Animated.View
                                key={pos}
                                style={[styles.corner, styles[pos], { opacity: cornerGlow }]}
                            />
                        ))}
                    </Animated.View>
                    <View style={[styles.darkRegion, { width: (SCREEN_W - FRAME_W) / 2 }]} />
                </View>
                {/* Fila inferior */}
                <View style={[styles.darkRegion, { flex: 1 }]} />
            </View>

            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={styles.headerTitle}>📚 Escáner ISBN</Text>
                    <Text style={styles.headerSubtitle}>Apunta al código de barras del libro</Text>
                </View>
                <View style={{ width: 44 }} />
            </View>

            {mode === 'idle' && (
                <View style={styles.hintContainer}>
                    <Text style={styles.hintText}>Encuadra el código de barras (ISBN)</Text>
                </View>
            )}

            {mode === 'scanning' && (
                <View style={styles.hintContainer}>
                    <ActivityIndicator color="#DAA520" size="small" />
                    <Text style={[styles.hintText, { color: '#DAA520', marginTop: 6 }]}>
                        Buscando libro...
                    </Text>
                </View>
            )}

            {/* Overlay de resultado (AR panel) */}
            {mode === 'result' && detectedBook && (
                <Animated.View
                    style={[
                        styles.resultOverlay,
                        {
                            opacity: overlayAnim,
                            transform: [{ translateY: overlaySlide }],
                            paddingBottom: insets.bottom + 16,
                        },
                    ]}
                >
                    {/* Handle */}
                    <View style={styles.handleBar} />

                    {/* Libro principal detectado */}
                    <View style={styles.mainResult}>
                        {detectedBook.image ? (
                            <Image source={{ uri: detectedBook.image }} style={styles.bookCover} />
                        ) : (
                            <View style={styles.bookCoverPlaceholder}>
                                <Ionicons name="book" size={32} color="#8B4513" />
                            </View>
                        )}
                        <View style={styles.bookInfo}>
                            <View style={styles.arBadge}>
                                <Ionicons name="scan" size={10} color="#DAA520" />
                                <Text style={styles.arBadgeText}>Detectado</Text>
                            </View>
                            <Text style={styles.bookTitle} numberOfLines={2}>
                                {detectedBook.title}
                            </Text>
                            <Text style={styles.bookAuthor} numberOfLines={1}>
                                {detectedBook.authors}
                            </Text>
                            {detectedBook.averageRating && (
                                <View style={styles.ratingRow}>
                                    <Ionicons name="star" size={13} color="#DAA520" />
                                    <Text style={styles.ratingText}>
                                        {detectedBook.averageRating.toFixed(1)}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Botones de acción */}
                    <View style={styles.actionButtons}>
                        <TouchableOpacity
                            style={styles.primaryAction}
                            onPress={() => openBookDetail(detectedBook)}
                        >
                            <Ionicons name="book-outline" size={18} color="#FFFFFF" />
                            <Text style={styles.primaryActionText}>Ver detalles</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.secondaryAction} onPress={hideOverlay}>
                            <Ionicons name="scan-outline" size={18} color="#8B4513" />
                            <Text style={styles.secondaryActionText}>Escanear otro</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Otros resultados */}
                    {candidates.length > 0 && (
                        <>
                            <Text style={styles.candidatesTitle}>¿No es este? Otros resultados:</Text>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.candidatesScroll}
                            >
                                {candidates.map((candidate) => (
                                    <TouchableOpacity
                                        key={candidate.id}
                                        style={styles.candidateCard}
                                        onPress={() => openBookDetail(candidate)}
                                    >
                                        {candidate.image ? (
                                            <Image
                                                source={{ uri: candidate.image }}
                                                style={styles.candidateCover}
                                            />
                                        ) : (
                                            <View style={styles.candidateCoverPlaceholder}>
                                                <Ionicons name="book" size={18} color="#8B4513" />
                                            </View>
                                        )}
                                        <Text style={styles.candidateTitle} numberOfLines={2}>
                                            {candidate.title}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </>
                    )}
                </Animated.View>
            )}
        </View>
    );
}

const CORNER_SIZE = 22;
const CORNER_THICKNESS = 3;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    permissionContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFF0',
        padding: 24,
    },
    permissionCard: {
        backgroundColor: '#FFF8F0',
        borderRadius: 24,
        padding: 32,
        alignItems: 'center',
        shadowColor: '#8B4513',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
        maxWidth: 320,
        width: '100%',
    },
    permissionTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#2F1B14',
        marginTop: 16,
        marginBottom: 10,
    },
    permissionText: {
        fontSize: 15,
        color: '#5D4037',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 24,
    },
    permissionButton: {
        backgroundColor: '#8B4513',
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 24,
        width: '100%',
        alignItems: 'center',
        shadowColor: '#8B4513',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    permissionButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    permissionBack: {
        marginTop: 14,
        padding: 8,
    },
    permissionBackText: {
        color: '#8D6E63',
        fontSize: 15,
    },
    darkOverlay: {
        ...StyleSheet.absoluteFillObject,
        flexDirection: 'column',
    },
    darkRegion: {
        backgroundColor: 'rgba(0,0,0,0.62)',
    },
    middleRow: {
        flexDirection: 'row',
        height: FRAME_H,
    },
    scanFrame: {
        width: FRAME_W,
        height: FRAME_H,
        overflow: 'hidden',
        position: 'relative',
    },
    scanLine: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: 2,
        backgroundColor: 'rgba(218, 165, 32, 0.85)',
        shadowColor: '#DAA520',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 6,
        elevation: 5,
    },
    // Corners AR
    corner: {
        position: 'absolute',
        width: CORNER_SIZE,
        height: CORNER_SIZE,
        borderColor: '#DAA520',
    },
    tl: {
        top: 0,
        left: 0,
        borderTopWidth: CORNER_THICKNESS,
        borderLeftWidth: CORNER_THICKNESS,
        borderTopLeftRadius: 4,
    },
    tr: {
        top: 0,
        right: 0,
        borderTopWidth: CORNER_THICKNESS,
        borderRightWidth: CORNER_THICKNESS,
        borderTopRightRadius: 4,
    },
    bl: {
        bottom: 0,
        left: 0,
        borderBottomWidth: CORNER_THICKNESS,
        borderLeftWidth: CORNER_THICKNESS,
        borderBottomLeftRadius: 4,
    },
    br: {
        bottom: 0,
        right: 0,
        borderBottomWidth: CORNER_THICKNESS,
        borderRightWidth: CORNER_THICKNESS,
        borderBottomRightRadius: 4,
    },
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 12,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerCenter: {
        flex: 1,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
        letterSpacing: 0.3,
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    headerSubtitle: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.75)',
        marginTop: 2,
    },
    hintContainer: {
        position: 'absolute',
        top: SCREEN_H / 2 + FRAME_H / 2 + 16,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    hintText: {
        color: 'rgba(255,255,255,0.85)',
        fontSize: 14,
        fontWeight: '500',
        textShadowColor: 'rgba(0,0,0,0.6)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
    },
    captureArea: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    captureButton: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: '#8B4513',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: 'rgba(255,255,255,0.35)',
        shadowColor: '#8B4513',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 10,
    },
    captureButtonDisabled: {
        backgroundColor: '#5D4037',
        opacity: 0.8,
    },
    captureLabel: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 13,
        marginTop: 10,
        fontWeight: '500',
    },
    // Overlay resultado
    resultOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFFFF0',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -6 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 20,
    },
    handleBar: {
        width: 40,
        height: 4,
        backgroundColor: '#D7CCC8',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 18,
    },
    mainResult: {
        flexDirection: 'row',
        marginBottom: 16,
        gap: 14,
    },
    bookCover: {
        width: 80,
        height: 112,
        borderRadius: 10,
        backgroundColor: '#F0E8E0',
        shadowColor: '#8B4513',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    bookCoverPlaceholder: {
        width: 80,
        height: 112,
        borderRadius: 10,
        backgroundColor: '#F0E8E0',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(139,69,19,0.15)',
    },
    bookInfo: {
        flex: 1,
        justifyContent: 'center',
        gap: 5,
    },
    arBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: 'rgba(218,165,32,0.12)',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 20,
        alignSelf: 'flex-start',
        borderWidth: 1,
        borderColor: 'rgba(218,165,32,0.3)',
    },
    arBadgeText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#B8860B',
        letterSpacing: 0.5,
    },
    bookTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#2F1B14',
        lineHeight: 22,
    },
    bookAuthor: {
        fontSize: 14,
        color: '#5D4037',
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    ratingText: {
        fontSize: 13,
        color: '#8D6E63',
        fontWeight: '600',
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 16,
    },
    primaryAction: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        backgroundColor: '#8B4513',
        paddingVertical: 13,
        borderRadius: 24,
        shadowColor: '#8B4513',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    primaryActionText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 15,
    },
    secondaryAction: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        backgroundColor: 'transparent',
        paddingVertical: 13,
        borderRadius: 24,
        borderWidth: 2,
        borderColor: 'rgba(139,69,19,0.25)',
    },
    secondaryActionText: {
        color: '#8B4513',
        fontWeight: '700',
        fontSize: 15,
    },
    candidatesTitle: {
        fontSize: 12,
        fontWeight: '700',
        color: '#8D6E63',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginBottom: 10,
    },
    candidatesScroll: {
        gap: 10,
        paddingRight: 4,
    },
    candidateCard: {
        width: 90,
        alignItems: 'center',
        gap: 6,
    },
    candidateCover: {
        width: 90,
        height: 126,
        borderRadius: 8,
        backgroundColor: '#F0E8E0',
    },
    candidateCoverPlaceholder: {
        width: 90,
        height: 126,
        borderRadius: 8,
        backgroundColor: '#F0E8E0',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(139,69,19,0.15)',
    },
    candidateTitle: {
        fontSize: 11,
        color: '#5D4037',
        textAlign: 'center',
        lineHeight: 15,
    },
});
