/**
 * BookHaven Modal Theme
 * Colores y estilos consistentes para todas las modales de la aplicación
 */

export const BookHavenTheme = {
    colors: {
        // Colores principales de BookHaven
        primary: '#8B4513',        // Marrón tierra (Saddle Brown)
        secondary: '#4682B4',      // Azul acero (Steel Blue)
        background: '#F5F5DC',     // Beige (Beige)
        surface: '#FFFACD',        // Amarillo suave (Lemon Chiffon)

        // Tonos adicionales
        primaryLight: '#A0522D',   // Sienna
        primaryDark: '#654321',    // Dark Brown
        secondaryLight: '#5F9EA0', // Cadet Blue
        secondaryDark: '#2F4F4F',  // Dark Slate Gray

        // Colores neutros
        white: '#FFFFFF',
        lightGray: '#F8F8F8',
        gray: '#E0E0E0',
        darkGray: '#666666',
        text: '#333333',
        textSecondary: '#666666',
        textLight: '#999999',

        // Estados
        success: '#2E8B57',        // Sea Green
        error: '#CD5C5C',          // Indian Red
        warning: '#DAA520',        // Goldenrod

        // Overlays
        overlay: 'rgba(0, 0, 0, 0.5)',
        overlayLight: 'rgba(139, 69, 19, 0.1)',
    },

    spacing: {
        xs: 4,
        sm: 8,
        md: 12,
        lg: 16,
        xl: 20,
        xxl: 24,
        xxxl: 32,
    },

    borderRadius: {
        sm: 6,
        md: 8,
        lg: 12,
        xl: 16,
        xxl: 20,
    },

    typography: {
        title: {
            fontSize: 22,
            fontWeight: '700' as const,
            lineHeight: 28,
        },
        subtitle: {
            fontSize: 18,
            fontWeight: '600' as const,
            lineHeight: 24,
        },
        body: {
            fontSize: 16,
            fontWeight: '400' as const,
            lineHeight: 22,
        },
        caption: {
            fontSize: 14,
            fontWeight: '400' as const,
            lineHeight: 20,
        },
        small: {
            fontSize: 12,
            fontWeight: '400' as const,
            lineHeight: 16,
        },
        button: {
            fontSize: 16,
            fontWeight: '600' as const,
            lineHeight: 20,
        },
    },

    shadows: {
        small: {
            shadowColor: '#8B4513',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.12,
            shadowRadius: 6,
            elevation: 4,
        },
        medium: {
            shadowColor: '#8B4513',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.18,
            shadowRadius: 12,
            elevation: 8,
        },
        large: {
            shadowColor: '#8B4513',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.22,
            shadowRadius: 20,
            elevation: 14,
        },
    },

    animation: {
        duration: {
            fast: 200,
            normal: 300,
            slow: 500,
        },
        easing: {
            easeInOut: 'ease-in-out',
            easeOut: 'ease-out',
            easeIn: 'ease-in',
        },
    },
};

// Función para obtener colores según el tema (claro/oscuro)
export const getThemeColors = (isDark: boolean = false) => {
    if (isDark) {
        return {
            ...BookHavenTheme.colors,
            background: '#1C1C1E',
            surface: '#2C2C2E',
            text: '#FFFFFF',
            textSecondary: '#8E8E93',
            textLight: '#6D6D70',
            gray: '#48484A',
            lightGray: '#3A3A3C',
        };
    }
    return BookHavenTheme.colors;
};

// Estilos comunes para modales
export const getModalStyles = (isDark: boolean = false) => {
    const colors = getThemeColors(isDark);

    return {
        // Container principal del modal
        modalContainer: {
            flex: 1,
            backgroundColor: colors.background,
        },

        // Overlay para modales transparentes
        overlay: {
            flex: 1,
            backgroundColor: 'rgba(47, 27, 20, 0.65)',
            justifyContent: 'center' as const,
            alignItems: 'center' as const,
            padding: BookHavenTheme.spacing.lg,
        },

        // Modal content
        modalContent: {
            backgroundColor: colors.background,
            borderRadius: 28,
            padding: BookHavenTheme.spacing.xxl,
            width: '100%' as const,
            maxWidth: 400,
            ...BookHavenTheme.shadows.large,
            borderWidth: 1,
            borderColor: 'rgba(139, 69, 19, 0.08)',
        },

        // Header styles
        header: {
            flexDirection: 'row' as const,
            alignItems: 'center' as const,
            justifyContent: 'space-between' as const,
            paddingHorizontal: BookHavenTheme.spacing.lg,
            paddingVertical: BookHavenTheme.spacing.lg,
            borderBottomWidth: 1,
            borderBottomColor: 'rgba(139, 69, 19, 0.1)',
            backgroundColor: '#FFFAF5',
        },

        headerTitle: {
            ...BookHavenTheme.typography.subtitle,
            color: colors.primary,
            textAlign: 'center' as const,
            fontWeight: '700' as const,
            letterSpacing: 0.3,
        },

        closeButton: {
            width: 36,
            height: 36,
            justifyContent: 'center' as const,
            alignItems: 'center' as const,
            borderRadius: 18,
            backgroundColor: '#F0E8E0',
        },

        // Button styles
        primaryButton: {
            backgroundColor: colors.primary,
            paddingVertical: 14,
            paddingHorizontal: BookHavenTheme.spacing.xl,
            borderRadius: 24,
            alignItems: 'center' as const,
            justifyContent: 'center' as const,
            flexDirection: 'row' as const,
            ...BookHavenTheme.shadows.medium,
        },

        secondaryButton: {
            backgroundColor: colors.secondary,
            paddingVertical: 14,
            paddingHorizontal: BookHavenTheme.spacing.xl,
            borderRadius: 24,
            alignItems: 'center' as const,
            justifyContent: 'center' as const,
            ...BookHavenTheme.shadows.small,
        },

        outlineButton: {
            backgroundColor: 'transparent',
            borderWidth: 2,
            borderColor: 'rgba(139, 69, 19, 0.25)',
            paddingVertical: 14,
            paddingHorizontal: BookHavenTheme.spacing.xl,
            borderRadius: 24,
            alignItems: 'center' as const,
            justifyContent: 'center' as const,
        },

        buttonText: {
            ...BookHavenTheme.typography.button,
            color: colors.white,
            letterSpacing: 0.3,
        },

        outlineButtonText: {
            ...BookHavenTheme.typography.button,
            color: colors.primary,
            letterSpacing: 0.3,
        },

        // Input styles
        input: {
            backgroundColor: '#FFFAF5',
            borderWidth: 1.5,
            borderColor: 'rgba(139, 69, 19, 0.2)',
            borderRadius: 16,
            paddingHorizontal: BookHavenTheme.spacing.lg,
            paddingVertical: 14,
            fontSize: BookHavenTheme.typography.body.fontSize,
            color: colors.text,
        },

        inputFocused: {
            borderColor: colors.primary,
        },

        // Text styles
        title: {
            ...BookHavenTheme.typography.title,
            color: colors.primary,
            textAlign: 'center' as const,
            marginBottom: BookHavenTheme.spacing.lg,
        },

        subtitle: {
            ...BookHavenTheme.typography.subtitle,
            color: colors.text,
        },

        body: {
            ...BookHavenTheme.typography.body,
            color: colors.text,
        },

        caption: {
            ...BookHavenTheme.typography.caption,
            color: colors.textSecondary,
        },

        // List item styles
        listItem: {
            flexDirection: 'row' as const,
            alignItems: 'center' as const,
            backgroundColor: '#FFFAF5',
            padding: BookHavenTheme.spacing.lg,
            borderRadius: 16,
            marginBottom: BookHavenTheme.spacing.sm,
            borderWidth: 1,
            borderColor: 'rgba(139, 69, 19, 0.1)',
            borderLeftWidth: 4,
            borderLeftColor: colors.primary,
            ...BookHavenTheme.shadows.small,
        },

        // Empty state styles
        emptyContainer: {
            flex: 1,
            justifyContent: 'center' as const,
            alignItems: 'center' as const,
            paddingHorizontal: BookHavenTheme.spacing.xxxl,
        },

        emptyText: {
            ...BookHavenTheme.typography.subtitle,
            color: colors.textSecondary,
            textAlign: 'center' as const,
            marginTop: BookHavenTheme.spacing.lg,
            marginBottom: BookHavenTheme.spacing.sm,
        },

        emptySubtext: {
            ...BookHavenTheme.typography.caption,
            color: colors.textLight,
            textAlign: 'center' as const,
            lineHeight: 20,
        },
    };
};