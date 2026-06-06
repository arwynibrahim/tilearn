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
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #1A2A4A 0%, #0A111E 100%)',
        'brand-gradient': 'linear-gradient(135deg, #E8650A 0%, #C45408 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        marquee: 'marquee 30s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
