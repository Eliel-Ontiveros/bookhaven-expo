/**
 * BookHaven - Biblioteca Acogedora
 * Paleta de colores inspirada en bibliotecas clásicas, pergaminos antiguos
 * y la calidez de los libros. Tonos tierra, dorados y marrones cálidos.
 */

import { Platform } from 'react-native';

// Colores principales inspirados en biblioteca clásica
const tintColorLight = '#8B4513'; // Marrón cuero de libro
const tintColorDark = '#D2B48C'; // Beige cálido
const accentLight = '#DAA520'; // Dorado elegante
const accentDark = '#F4A460'; // Dorado suave

// Paleta de colores adicionales
const parchment = '#F5F5DC'; // Color pergamino
const oldPaper = '#F7F3E9'; // Papel envejecido
const inkBlue = '#191970'; // Azul tinta
const leatherBrown = '#8B4513'; // Marrón cuero
const goldLeaf = '#FFD700'; // Oro brillante
const sageGreen = '#9CAF88'; // Verde salvia (para acentos naturales)
const warmIvory = '#FFFFF0'; // Marfil cálido

export const Colors = {
  light: {
    // Text colors - inspirados en tinta clásica
    text: '#2F1B14', // Marrón muy oscuro (como tinta sepia)
    textSecondary: '#5D4037', // Marrón medio
    textMuted: '#8D6E63', // Marrón suave

    // Background colors - tonos pergamino y papel
    background: warmIvory, // Fondo principal marfil cálido
    backgroundSecondary: parchment, // Fondo secundario pergamino
    backgroundTertiary: oldPaper, // Fondo terciario papel envejecido

    // Card & Surface colors
    card: parchment, // Tarjetas como pergamino
    cardHover: oldPaper, // Hover más cálido
    border: '#D7CCC8', // Bordes suaves marrones
    borderLight: '#EFEBE9', // Bordes muy suaves

    // Brand colors - cuero y oro
    tint: tintColorLight, // Marrón cuero principal
    accent: accentLight, // Dorado elegante

    // Icon colors
    icon: '#8D6E63', // Iconos en marrón suave
    iconActive: tintColorLight, // Iconos activos en cuero
    tabIconDefault: '#A1887F', // Tabs inactivos
    tabIconSelected: tintColorLight, // Tabs activos

    // Status colors - tonos naturales
    success: sageGreen, // Verde natural para éxito
    warning: '#FF8F00', // Ámbar para advertencias
    error: '#D32F2F', // Rojo suave para errores
    info: inkBlue, // Azul tinta para información

    // Special colors
    shadow: 'rgba(139, 69, 19, 0.15)', // Sombras marrones suaves
    overlay: 'rgba(47, 27, 20, 0.6)', // Overlay con tono sepia
    gradient: [leatherBrown, accentLight], // Gradiente cuero a oro

    // Colores adicionales para personalidad
    bookSpine: leatherBrown, // Color lomo de libro
    goldAccent: goldLeaf, // Detalles dorados
    pageYellow: '#FFFACD', // Amarillo papel viejo
    vintageRed: '#A0522D', // Rojo vintage para acentos
  },
  dark: {
    // Text colors - pergamino claro sobre fondo oscuro
    text: parchment, // Texto principal pergamino
    textSecondary: '#D7CCC8', // Texto secundario beige
    textMuted: '#A1887F', // Texto suave
    textPlaceholder: '#8D6E63', // Placeholder visible

    // Background colors - biblioteca nocturna
    background: '#1A1611', // Fondo principal muy oscuro con tono cálido
    backgroundSecondary: '#2F2419', // Fondo secundario marrón oscuro
    backgroundTertiary: '#3E2723', // Fondo terciario

    // Card & Surface colors
    card: '#2F2419', // Tarjetas en marrón oscuro
    cardHover: '#3E2723', // Hover más claro
    border: '#4E342E', // Bordes marrones oscuros
    borderLight: '#5D4037', // Bordes suaves

    // Brand colors
    tint: tintColorDark, // Beige cálido
    accent: accentDark, // Dorado suave

    // Icon colors
    icon: '#A1887F', // Iconos beige
    iconActive: tintColorDark, // Iconos activos beige cálido
    tabIconDefault: '#8D6E63', // Tabs inactivos
    tabIconSelected: tintColorDark, // Tabs activos

    // Status colors
    success: '#AED581', // Verde claro natural
    warning: '#FFB74D', // Ámbar claro
    error: '#E57373', // Rojo suave
    info: '#64B5F6', // Azul suave

    // Special colors
    shadow: 'rgba(0, 0, 0, 0.5)', // Sombras más profundas
    overlay: 'rgba(26, 22, 17, 0.8)', // Overlay oscuro cálido
    gradient: [tintColorDark, accentDark], // Gradiente beige a dorado suave

    // Colores adicionales para personalidad
    bookSpine: '#8D6E63', // Color lomo más suave
    goldAccent: accentDark, // Dorado suave para detalles
    pageYellow: '#FFF9C4', // Amarillo suave
    vintageRed: '#FFAB91', // Rojo vintage suave
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
