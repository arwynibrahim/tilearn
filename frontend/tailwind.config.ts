import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          DEFAULT: '#E8650A',
          50: '#FDF2EB',
          100: '#FAE0C8',
          200: '#F5BE91',
          300: '#F09C5A',
          400: '#EC7B23',
          500: '#E8650A',
          600: '#C45408',
          700: '#984107',
          800: '#6C2E05',
          900: '#3F1B03',
        },
        navy: {
          DEFAULT: '#1A2A4A',
          50: '#EDF1F9',
          100: '#D3DCF0',
          200: '#A7B9E1',
          300: '#7B96D2',
          400: '#4F73C3',
          500: '#2E54A8',
          600: '#244186',
          700: '#1A2A4A',
          800: '#121E34',
          900: '#0A111E',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          secondary: '#F8FAFB',
          tertiary: '#F1F4F6',
        },
      },
      boxShadow: {
        'soft': '0 1px 3px 0 rgba(0,0,0,0.04), 0 1px 2px -1px rgba(0,0,0,0.06)',
        'card': '0 1px 4px 0 rgba(0,0,0,0.04), 0 2px 6px -1px rgba(0,0,0,0.03)',
        'card-hover': '0 4px 12px 0 rgba(0,0,0,0.06), 0 2px 4px -1px rgba(0,0,0,0.04)',
        'sidebar': '4px 0 12px 0 rgba(0,0,0,0.04)',
        'navbar': '0 1px 4px 0 rgba(0,0,0,0.04)',
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #1A2A4A 0%, #0A111E 100%)',
        'brand-gradient': 'linear-gradient(135deg, #E8650A 0%, #C45408 100%)',
        'stat-brand': 'linear-gradient(135deg, #E8650A 0%, #F09C5A 100%)',
        'stat-blue': 'linear-gradient(135deg, #244186 0%, #4F73C3 100%)',
        'stat-green': 'linear-gradient(135deg, #059669 0%, #34D399 100%)',
        'stat-purple': 'linear-gradient(135deg, #7C3AED 0%, #A78BFA 100%)',
        'stat-amber': 'linear-gradient(135deg, #D97706 0%, #FBBF24 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
        marquee: 'marquee 30s linear infinite',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
