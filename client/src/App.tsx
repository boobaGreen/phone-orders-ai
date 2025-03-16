import { useState } from "react";

function App() {
  const [count, setCount] = useState(0);
  const [isDark, setIsDark] = useState(false);

  // Funzione per cambiare il tema
  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);

    // Applica la classe dark al documento
    if (newTheme) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <div className="min-h-screen bg-[color:var(--color-background)] text-[color:var(--color-foreground)] flex flex-col justify-center items-center">
      <div className="max-w-md w-full bg-[color:var(--color-card)] text-[color:var(--color-card-foreground)] rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center text-[color:var(--color-primary)] mb-6">
          Pizzeria SaaS
        </h1>

        <div className="text-center">
          <p className="mb-4">
            Sistema di ordini telefonici con AI per pizzerie
          </p>

          <div className="flex justify-center gap-4 mb-6">
            <button
              className="px-4 py-2 bg-[color:var(--color-primary)] text-[color:var(--color-primary-foreground)] rounded hover:opacity-90 active:opacity-80 transition-opacity"
              onClick={() => setCount(count + 1)}
            >
              Count: {count}
            </button>

            <button
              className="px-4 py-2 bg-[color:var(--color-secondary)] text-[color:var(--color-secondary-foreground)] rounded hover:opacity-90 active:opacity-80 transition-opacity"
              onClick={toggleTheme}
            >
              {isDark ? "☀️ Light" : "🌙 Dark"}
            </button>
          </div>

          <p className="text-sm text-[color:var(--color-muted-foreground)]">
            Clicca i pulsanti per testare l'interattività e il tema
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
