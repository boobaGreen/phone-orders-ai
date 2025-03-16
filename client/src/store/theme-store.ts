import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
  isDark: boolean;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      isDark: window.matchMedia('(prefers-color-scheme: dark)').matches,
      toggleTheme: () => set((state) => {
        const newTheme = !state.isDark;
        
        // Aggiorna le classi del documento
        if (newTheme) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        
        return { isDark: newTheme };
      }),
    }),
    {
      name: 'theme-storage',
    }
  )
);

// Inizializza il tema al caricamento
const initializeTheme = () => {
  const { isDark } = useThemeStore.getState();
  if (isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

// Esegui l'inizializzazione
initializeTheme();