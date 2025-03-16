import { Outlet } from "react-router-dom";

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-[color:var(--color-background)] text-[color:var(--color-foreground)]">
      <header className="bg-[color:var(--color-card)] border-b border-[color:var(--color-border)] py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-[color:var(--color-primary)]">
            Pizzeria SaaS
          </h1>
          <nav className="flex items-center gap-4">
            {/* Nav links will go here */}
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>

      <footer className="bg-[color:var(--color-card)] border-t border-[color:var(--color-border)] py-4 mt-auto">
        <div className="container mx-auto px-4 text-center text-[color:var(--color-muted-foreground)]">
          &copy; {new Date().getFullYear()} Pizzeria SaaS - Tutti i diritti
          riservati
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
