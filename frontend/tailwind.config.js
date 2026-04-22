/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      colors: {
        bg: {
          primary: '#0a0a12',
          secondary: '#12121e',
          tertiary: '#1a1a2e',
          elevated: '#222238',
          hover: '#2a2a44',
        },
        surface: {
          glass: 'rgba(26, 26, 46, 0.7)',
          'glass-hover': 'rgba(42, 42, 68, 0.8)',
        },
        border: {
          DEFAULT: 'rgba(255, 255, 255, 0.06)',
          accent: 'rgba(124, 92, 252, 0.3)',
          hover: 'rgba(255, 255, 255, 0.12)',
        },
        txt: {
          primary: '#f0f0f5',
          secondary: '#9595b0',
          tertiary: '#6b6b85',
        },
        accent: {
          DEFAULT: '#7c5cfc',
          light: '#a78bfa',
          glow: 'rgba(124, 92, 252, 0.15)',
        },
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.4s ease-out both',
        'fade-in': 'fadeIn 0.3s ease-out both',
        'slide-in-left': 'slideInLeft 0.3s ease-out both',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideInLeft: {
          from: { opacity: '0', transform: 'translateX(-20px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 8px rgba(124, 92, 252, 0.2)' },
          '50%': { boxShadow: '0 0 20px rgba(124, 92, 252, 0.4)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
    },
  },
  plugins: [],
}
