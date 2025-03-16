import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-[color:var(--color-background)] text-[color:var(--color-foreground)] flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

export default MainLayout;
