module.exports = {
  content: [
    "./src/**/*.{html,js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['NeoDGM', 'sans-serif'],
      },
      keyframes: {
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%, 60%': { transform: 'translateX(-8px)' },
          '40%, 80%': { transform: 'translateX(8px)' },
        },
        pulseColor: {
          '0%': { color: '#000000' },
          '25%': { color: '#facc15' },
          '50%': { color: '#ef4444' },
          '75%': { color: '#3b82f6' },
          '100%': { color: '#000000' },
        },
      },
      animation: {
        shake: 'shake 0.4s ease-in-out',
        'pulse-color': 'pulseColor 2s infinite',
      },
    },
  },
  plugins: [],
};
