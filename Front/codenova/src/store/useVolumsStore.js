import { create } from "zustand";

const defaultBgm = Number(localStorage.getItem("bgmVolume")) || 0.5;
const defaultEffect = Number(localStorage.getItem("effectVolume")) || 0.7;

const useVolumeStore = create((set) => ({
    
    bgmVolume: defaultBgm,
    effectVolume: defaultEffect,  
    
    setBgmVolume: (volume) => {
      localStorage.setItem("bgmVolume", volume);
      set({ bgmVolume: volume });
    },
  
    setEffectVolume: (volume) => {
      localStorage.setItem("effectVolume", volume);
      set({ effectVolume: volume });
    }    
}));

export default useVolumeStore;