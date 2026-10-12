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
        navy: {
          950: '#060A14',
          900: '#0A0F1D',
          850: '#0E172A',
          800: '#131F38',
          700: '#1E2D4F',
          600: '#2A3F6D',
        },
        emergency: {
          critical: '#EF4444',
          high: '#F97316',
          moderate: '#EAB308',
          low: '#10B981',
          glow: 'rgba(239, 68, 68, 0.4)',
        },
        cyber: {
          blue: '#00E5FF',
          accent: '#3B82F6',
          indigo: '#6366F1',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-fast': 'pulse 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'glow-red': 'glowRed 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glowRed: {
          '0%': { boxShadow: '0 0 15px rgba(239, 68, 68, 0.3)' },
          '100%': { boxShadow: '0 0 35px rgba(239, 68, 68, 0.8)' },
        }
      }
    },
  },
  plugins: [],
}
