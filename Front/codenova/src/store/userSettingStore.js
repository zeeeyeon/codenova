import { create } from 'zustand';

const defaultColors = {
    correct: '#98c379',
    wrong: '#e06c75',
    typing: '#ffffff'
};

export const userColorStore = create((set) => ({

    colors: JSON.parse(localStorage.getItem('text-colors')) || defaultColors,

    setColor : (type, color) => set((state) => {
        const newColors = { ...state.colors, [type]: color};

        // CSS 번수 반영
        const root = document.documentElement;
        root.style.setProperty('--typed-color', newColors.correct);
        root.style.setProperty('--wrong-color', newColors.wrong);
        root.style.setProperty('--pending-color', newColors.typing);

        localStorage.setItem('text-colors', JSON.stringify(newColors));

        return { colors: newColors};
    }),
    
    initColors: () => {
        const stored = JSON.parse(localStorage.getItem('text-colors'));
        const colors = stored || defaultColors;

        // CSS 변수 반영
        const root = document.documentElement;
        root.style.setProperty('--typed-color', colors.correct);
        root.style.setProperty('--wrong-color', colors.wrong);
        root.style.setProperty('--pending-color', colors.typing);

        return { colors };
    },

    resetSingleColor: (type) => set((state) => {
        const newColors = { ...state.colors, [type]: defaultColors[type] };

        const root = document.documentElement;
        root.style.setProperty('--typed-color', newColors.correct);
        root.style.setProperty('--wrong-color', newColors.wrong);
        root.style.setProperty('--pending-color', newColors.typing);

        localStorage.setItem('text-colors', JSON.stringify(newColors));

        return { colors: newColors };
    })
}))
