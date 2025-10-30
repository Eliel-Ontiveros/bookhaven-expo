/**
 * Modern color palette for BookHaven app
 * Inspired by contemporary design systems with vibrant gradients
 */

import { Platform } from 'react-native';

// Primary brand colors - Purple & Teal gradient theme
const tintColorLight = '#7C3AED'; // Vivid Purple
const tintColorDark = '#A78BFA'; // Light Purple
const accentLight = '#14B8A6'; // Teal
const accentDark = '#5EEAD4'; // Light Teal

export const Colors = {
  light: {
    // Text colors
    text: '#1F2937',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',

    // Background colors
    background: '#FFFFFF',
    backgroundSecondary: '#F9FAFB',
    backgroundTertiary: '#F3F4F6',

    // Card & Surface colors
    card: '#FFFFFF',
    cardHover: '#F9FAFB',
    border: '#E5E7EB',
    borderLight: '#F3F4F6',

    // Brand colors
    tint: tintColorLight,
    accent: accentLight,

    // Icon colors
    icon: '#6B7280',
    iconActive: tintColorLight,
    tabIconDefault: '#9CA3AF',
    tabIconSelected: tintColorLight,

    // Status colors
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',

    // Special colors
    shadow: 'rgba(0, 0, 0, 0.1)',
    overlay: 'rgba(0, 0, 0, 0.5)',
    gradient: ['#7C3AED', '#14B8A6'],
  },
  dark: {
    // Text colors
    text: '#F9FAFB',
    textSecondary: '#D1D5DB',
    textMuted: '#9CA3AF',
    textPlaceholder: '#1111',

    // Background colors
    background: '#111827',
    backgroundSecondary: '#1F2937',
    backgroundTertiary: '#374151',

    // Card & Surface colors
    card: '#1F2937',
    cardHover: '#374151',
    border: '#374151',
    borderLight: '#4B5563',

    // Brand colors
    tint: tintColorDark,
    accent: accentDark,

    // Icon colors
    icon: '#9CA3AF',
    iconActive: tintColorDark,
    tabIconDefault: '#6B7280',
    tabIconSelected: tintColorDark,

    // Status colors
    success: '#34D399',
    warning: '#FBBF24',
    error: '#F87171',
    info: '#60A5FA',

    // Special colors
    shadow: 'rgba(0, 0, 0, 0.4)',
    overlay: 'rgba(0, 0, 0, 0.7)',
    gradient: ['#A78BFA', '#5EEAD4'],
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
