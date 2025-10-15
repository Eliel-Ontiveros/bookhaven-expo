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
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
        },
        medium: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 6,
        },
        large: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.2,
            shadowRadius: 16,
            elevation: 10,
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
            backgroundColor: colors.overlay,
            justifyContent: 'center' as const,
            alignItems: 'center' as const,
            padding: BookHavenTheme.spacing.lg,
        },

        // Modal content
        modalContent: {
            backgroundColor: colors.background,
            borderRadius: BookHavenTheme.borderRadius.xl,
            padding: BookHavenTheme.spacing.xl,
            width: '100%' as const,
            maxWidth: 400,
            ...BookHavenTheme.shadows.large,
        },

        // Header styles
        header: {
            flexDirection: 'row' as const,
            alignItems: 'center' as const,
            justifyContent: 'space-between' as const,
            paddingHorizontal: BookHavenTheme.spacing.lg,
            paddingVertical: BookHavenTheme.spacing.md,
            borderBottomWidth: 1,
            borderBottomColor: colors.gray,
        },

        headerTitle: {
            ...BookHavenTheme.typography.subtitle,
            color: colors.primary,
            textAlign: 'center' as const,
        },

        closeButton: {
            width: 40,
            height: 40,
            justifyContent: 'center' as const,
            alignItems: 'center' as const,
            borderRadius: BookHavenTheme.borderRadius.md,
            backgroundColor: colors.lightGray,
        },

        // Button styles
        primaryButton: {
            backgroundColor: colors.primary,
            paddingVertical: BookHavenTheme.spacing.md,
            paddingHorizontal: BookHavenTheme.spacing.xl,
            borderRadius: BookHavenTheme.borderRadius.md,
            alignItems: 'center' as const,
            justifyContent: 'center' as const,
            ...BookHavenTheme.shadows.small,
        },

        secondaryButton: {
            backgroundColor: colors.secondary,
            paddingVertical: BookHavenTheme.spacing.md,
            paddingHorizontal: BookHavenTheme.spacing.xl,
            borderRadius: BookHavenTheme.borderRadius.md,
            alignItems: 'center' as const,
            justifyContent: 'center' as const,
            ...BookHavenTheme.shadows.small,
        },

        outlineButton: {
            backgroundColor: 'transparent',
            borderWidth: 2,
            borderColor: colors.gray,
            paddingVertical: BookHavenTheme.spacing.md,
            paddingHorizontal: BookHavenTheme.spacing.xl,
            borderRadius: BookHavenTheme.borderRadius.md,
            alignItems: 'center' as const,
            justifyContent: 'center' as const,
        },

        buttonText: {
            ...BookHavenTheme.typography.button,
            color: colors.white,
        },

        outlineButtonText: {
            ...BookHavenTheme.typography.button,
            color: colors.text,
        },

        // Input styles
        input: {
            backgroundColor: colors.surface,
            borderWidth: 2,
            borderColor: colors.gray,
            borderRadius: BookHavenTheme.borderRadius.md,
            paddingHorizontal: BookHavenTheme.spacing.md,
            paddingVertical: BookHavenTheme.spacing.md,
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
            backgroundColor: colors.surface,
            padding: BookHavenTheme.spacing.lg,
            borderRadius: BookHavenTheme.borderRadius.lg,
            marginBottom: BookHavenTheme.spacing.sm,
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