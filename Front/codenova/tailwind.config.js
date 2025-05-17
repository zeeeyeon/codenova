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
        pingScaleFade: {
          '0%': { transform: 'scale(0.6)', opacity: '0' },
          '50%': { transform: 'scale(1.2)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '0' },
        },
        poke: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(4px)' },
        },
      },
      animation: {
        shake: 'shake 0.4s ease-in-out',
        'pulse-color': 'pulseColor 2s infinite',
        'ping-scale-fade': 'pingScaleFade 1s ease-in-out',
        poke: 'poke 1s infinite ease-in-out',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
