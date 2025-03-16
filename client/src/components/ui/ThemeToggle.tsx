import { Moon, Sun } from "lucide-react";
import { useThemeStore } from "../../store/theme-store";

export const ThemeToggle = () => {
  const { isDark, toggleTheme } = useThemeStore();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full bg-[color:var(--color-muted)] text-[color:var(--color-muted-foreground)] hover:bg-[color:var(--color-muted)]/80 transition-colors"
      aria-label={isDark ? "Attiva tema chiaro" : "Attiva tema scuro"}
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
};
