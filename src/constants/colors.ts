// Centralized color constants for the application
export const COLORS = {
  // Primary brand colors
  primary: '#582F4D',      // Main brand color (dark purple)
  secondary: '#BAAAC7',    // Secondary color (light purple)
  tertiary: '#A43286',     // Accent color (magenta)
  
  // Derived colors for better UI
  primaryLight: '#6D4862',  // Lighter shade of primary
  primaryDark: '#4A2640',   // Darker shade of primary
  
  secondaryLight: '#D4CDDB', // Lighter shade of secondary
  secondaryDark: '#A594B3',  // Darker shade of secondary
  
  tertiaryLight: '#C85FA8',  // Lighter shade of tertiary
  tertiaryDark: '#8A2971',   // Darker shade of tertiary
  
  // Neutral colors
  white: '#FFFFFF',
  black: '#000000',
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  
  // Status colors with brand influence
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  // Background variants
  background: {
    primary: '#582F4D',
    secondary: '#BAAAC7',
    tertiary: '#A43286',
    light: '#F9F7FB',     // Very light tinted background
    gradient: 'linear-gradient(135deg, #582F4D 0%, #A43286 100%)',
  }
} as const;

// CSS classes for easy use in Tailwind (if needed)
export const COLOR_CLASSES = {
  // Background classes
  bgPrimary: 'bg-[#582F4D]',
  bgSecondary: 'bg-[#BAAAC7]',
  bgTertiary: 'bg-[#A43286]',
  bgPrimaryLight: 'bg-[#6D4862]',
  bgPrimaryDark: 'bg-[#4A2640]',
  bgSecondaryLight: 'bg-[#D4CDDB]',
  bgSecondaryDark: 'bg-[#A594B3]',
  bgTertiaryLight: 'bg-[#C85FA8]',
  bgTertiaryDark: 'bg-[#8A2971]',
  bgSignupCustom: 'bg-[#6c8eff]',

  // Text classes
  textPrimary: 'text-[#582F4D]',
  textSecondary: 'text-[#BAAAC7]',
  textTertiary: 'text-[#A43286]',
  textPrimaryLight: 'text-[#6D4862]',
  textPrimaryDark: 'text-[#4A2640]',
  
  // Border classes
  borderPrimary: 'border-[#582F4D]',
  borderSecondary: 'border-[#BAAAC7]',
  borderTertiary: 'border-[#A43286]',
  
  // Hover classes
  hoverBgPrimary: 'hover:bg-[#4A2640]',
  hoverBgSecondary: 'hover:bg-[#A594B3]',
  hoverBgTertiary: 'hover:bg-[#8A2971]',
  hoverTextPrimary: 'hover:text-[#582F4D]',
  hoverTextSecondary: 'hover:text-[#BAAAC7]',
  hoverTextTertiary: 'hover:text-[#A43286]',
  
  // Focus classes
  focusRingPrimary: 'focus:ring-[#582F4D]',
  focusRingSecondary: 'focus:ring-[#BAAAC7]',
  focusRingTertiary: 'focus:ring-[#A43286]',
  
  // Status color classes
  bgError: 'bg-[#EF4444]',
  bgSuccess: 'bg-[#10B981]',
  bgWarning: 'bg-[#F59E0B]',
  bgInfo: 'bg-[#3B82F6]',
  textError: 'text-[#EF4444]',
  textSuccess: 'text-[#10B981]',
  textWarning: 'text-[#F59E0B]',
  textInfo: 'text-[#3B82F6]',
  hoverBgError: 'hover:bg-[#DC2626]',
  hoverBgSuccess: 'hover:bg-[#059669]',
  hoverBgWarning: 'hover:bg-[#D97706]',
  hoverBgInfo: 'hover:bg-[#2563EB]',
  
  // Gradient classes
  gradientPrimary: 'bg-gradient-to-r from-[#582F4D] to-[#A43286]',
  gradientSecondary: 'bg-gradient-to-r from-[#BAAAC7] to-[#A594B3]',
  gradientTertiary: 'bg-gradient-to-r from-[#A43286] to-[#8A2971]',
  gradientMixed: 'bg-gradient-to-br from-[#582F4D] to-[#A43286]',
  gradientAlternate: 'bg-gradient-to-br from-[#A43286] to-[#BAAAC7]',
  gradientAccent: 'bg-gradient-to-br from-[#A43286] to-[#8A2971]',
  gradientFull: 'bg-gradient-to-br from-[#582F4D] via-[#A43286] to-[#BAAAC7]',
  gradientReverse: 'bg-gradient-to-r from-[#A43286] to-[#582F4D]',
  gradientLinear:'bg-gradient-to-t from-[#582F4D] from-0% to-white to-30%'
} as const;

// Chart colors based on our brand palette
export const CHART_COLORS = [
  COLORS.primary,        // #582F4D
  COLORS.tertiary,       // #A43286  
  COLORS.secondary,      // #BAAAC7
  COLORS.primaryLight,   // #6D4862
  COLORS.tertiaryLight,  // #C85FA8
  COLORS.secondaryDark,  // #A594B3
  COLORS.primaryDark,    // #4A2640
  COLORS.tertiaryDark,   // #8A2971
  COLORS.secondaryLight, // #D4CDDB
] as const;

// Utility functions for easier color composition
export const getColorClasses = {
  // Button variants
  button: {
    primary: `${COLOR_CLASSES.bgPrimary} ${COLOR_CLASSES.hoverBgPrimary} text-white`,
    secondary: `${COLOR_CLASSES.bgSecondary} ${COLOR_CLASSES.hoverBgSecondary} text-white`,
    tertiary: `${COLOR_CLASSES.bgTertiary} ${COLOR_CLASSES.hoverBgTertiary} text-white`,
    outline: `border-2 ${COLOR_CLASSES.borderPrimary} ${COLOR_CLASSES.textPrimary} hover:${COLOR_CLASSES.bgPrimary} hover:text-white`,
  },
  
  // Link variants
  link: {
    primary: `${COLOR_CLASSES.textPrimary} ${COLOR_CLASSES.hoverTextPrimary}`,
    secondary: `${COLOR_CLASSES.textSecondary} ${COLOR_CLASSES.hoverTextSecondary}`,
    tertiary: `${COLOR_CLASSES.textTertiary} ${COLOR_CLASSES.hoverTextTertiary}`,
    nav: `text-gray-700 ${COLOR_CLASSES.hoverTextPrimary}`,
  },
  
  // Input variants
  input: {
    default: `border-gray-300 ${COLOR_CLASSES.focusRingPrimary} focus:outline-none focus:ring-2`,
    error: `border-red-300 focus:ring-red-500 focus:outline-none focus:ring-2`,
    success: `border-green-300 focus:ring-green-500 focus:outline-none focus:ring-2`,
  },
  
  // Card variants
  card: {
    primary: `bg-white border ${COLOR_CLASSES.borderPrimary}`,
    secondary: `${COLOR_CLASSES.bgSecondary} border ${COLOR_CLASSES.borderSecondary}`,
    gradient: `${COLOR_CLASSES.gradientPrimary} text-white`,
  }
} as const;

export default COLORS;
