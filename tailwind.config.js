/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
      },
      borderRadius: {
        sm: '4px',
        md: '6px',
        lg: '8px',
        xl: '12px',
        '2xl': '18px',
        '3xl': '24px',
      },
      boxShadow: {
        'swiftui-card': '0 2px 10px -2px rgba(0, 0, 0, 0.04), 0 1px 3px 0 rgba(0, 0, 0, 0.02), inset 0 1px 0 0 rgba(255, 255, 255, 0.85)',
        'swiftui-card-dark': '0 4px 16px -2px rgba(0, 0, 0, 0.45), 0 1px 4px 0 rgba(0, 0, 0, 0.3), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)',
        'swiftui-card-hover': '0 8px 24px -4px rgba(0, 0, 0, 0.08), 0 2px 8px -2px rgba(0, 0, 0, 0.03), inset 0 1px 0 0 rgba(255, 255, 255, 1)',
        'swiftui-card-hover-dark': '0 12px 30px -4px rgba(0, 0, 0, 0.65), 0 3px 10px -2px rgba(0, 0, 0, 0.4), inset 0 1px 0 0 rgba(255, 255, 255, 0.15)',
        'swiftui-popover': '0 16px 40px -6px rgba(0, 0, 0, 0.12), 0 4px 12px -2px rgba(0, 0, 0, 0.06), inset 0 1px 1.5px 0 rgba(255, 255, 255, 0.95)',
        'swiftui-popover-dark': '0 20px 48px -6px rgba(0, 0, 0, 0.8), 0 6px 16px -2px rgba(0, 0, 0, 0.6), inset 0 1px 1.5px 0 rgba(255, 255, 255, 0.15)',
        'liquid-glass': '0 12px 36px -4px rgba(0, 0, 0, 0.06), 0 4px 12px -2px rgba(0, 0, 0, 0.03), inset 0 1px 1.5px 0 rgba(255, 255, 255, 0.95), inset 0 -1px 1px 0 rgba(0, 0, 0, 0.02)',
        'liquid-glass-dark': '0 16px 44px -4px rgba(0, 0, 0, 0.65), 0 4px 14px -2px rgba(0, 0, 0, 0.4), inset 0 1px 1.5px 0 rgba(255, 255, 255, 0.16), inset 0 -1px 1px 0 rgba(0, 0, 0, 0.45)',
        'liquid-glass-hover': '0 16px 40px -4px rgba(0, 0, 0, 0.1), 0 6px 16px -2px rgba(0, 0, 0, 0.05), inset 0 1px 2px 0 rgba(255, 255, 255, 1)',
        'liquid-glass-hover-dark': '0 20px 48px -4px rgba(0, 0, 0, 0.75), 0 6px 20px -2px rgba(0, 0, 0, 0.5), inset 0 1px 2px 0 rgba(255, 255, 255, 0.22)',
        'liquid-btn': '0 4px 14px -2px rgba(0, 0, 0, 0.16), inset 0 1px 1px 0 rgba(255, 255, 255, 0.45), inset 0 -1px 1px 0 rgba(0, 0, 0, 0.15)',
        'liquid-btn-dark': '0 4px 16px -2px rgba(0, 0, 0, 0.5), inset 0 1px 1px 0 rgba(255, 255, 255, 0.85), inset 0 -1px 1px 0 rgba(0, 0, 0, 0.2)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        scaleInSpring: {
          '0%': { opacity: '0', transform: 'scale(0.92)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        scaleUp: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        popCheck: {
          '0%': { transform: 'scale(0.85)' },
          '50%': { transform: 'scale(1.22)' },
          '100%': { transform: 'scale(1)' },
        },
        archiveOut: {
          '0%': { opacity: '1', transform: 'translateX(0)' },
          '100%': { opacity: '0', transform: 'translateX(12px)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(12px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-12px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        dialPulse: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.012)' },
        },
        barGrow: {
          '0%': { transform: 'scaleY(0)', transformOrigin: 'bottom' },
          '100%': { transform: 'scaleY(1)', transformOrigin: 'bottom' },
        },
        liquidFloat: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-3px)' },
        },
        appleSpringSubtle: {
          '0%': { transform: 'scale(0.98)' },
          '60%': { transform: 'scale(1.01)' },
          '100%': { transform: 'scale(1)' },
        },
        appleSpringScale: {
          '0%': { transform: 'scale(0.94)', opacity: '0' },
          '60%': { transform: 'scale(1.015)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in-up': 'fadeInUp 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-down': 'slideDown 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scale-in': 'scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scale-in-spring': 'scaleInSpring 0.32s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'scale-up': 'scaleUp 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pop-check': 'popCheck 0.26s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'archive-out': 'archiveOut 0.25s ease-out forwards',
        'slide-in-right': 'slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-in-left': 'slideInLeft 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'dial-pulse': 'dialPulse 3s ease-in-out infinite',
        'bar-grow': 'barGrow 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'liquid-float': 'liquidFloat 4s ease-in-out infinite',
        'spring-subtle': 'appleSpringSubtle 0.24s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'spring-scale': 'appleSpringScale 0.28s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
      },
    },
  },
  plugins: [],
}
