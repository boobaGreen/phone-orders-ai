/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../store/auth-store";
import { businessAPI } from "../../services/api";
import { Plus, RefreshCcw, Phone, Menu as MenuIcon } from "lucide-react"; // Assicurati di installare lucide-react

interface Business {
  _id: string;
  name: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  phoneNumber: string;
  isActive: boolean;
  createdAt: string;
}

const Dashboard = () => {
  const { user } = useAuthStore();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        setIsLoading(true);
        const response = await businessAPI.getBusinesses();
        if (response.data.success) {
          setBusinesses(response.data.data);
        } else {
          throw new Error(
            response.data.message || "Errore nel caricamento dei ristoranti"
          );
        }
      } catch (err: any) {
        console.error("Error fetching businesses:", err);
        setError("Impossibile caricare i tuoi ristoranti. Riprova più tardi.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBusinesses();
  }, []);

  return (
    <div className="p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-[color:var(--color-muted-foreground)]">
          Benvenuto, {user?.name || "Utente"}! Gestisci le tue attività.
        </p>
      </header>

      {error && (
        <div className="p-4 mb-6 rounded-md bg-[color:var(--color-destructive-light)] text-[color:var(--color-destructive)]">
          {error}
          <button
            onClick={() => window.location.reload()}
            className="ml-2 underline"
          >
            Ricarica
          </button>
        </div>
      )}

      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-xl font-semibold">I tuoi ristoranti</h2>
        <Link
          to="/businesses/new"
          className="inline-flex items-center px-4 py-2 rounded-md bg-[color:var(--color-primary)] text-[color:var(--color-primary-foreground)] hover:bg-[color:var(--color-primary-dark)]"
        >
          <Plus size={16} className="mr-2" />
          Nuovo ristorante
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[color:var(--color-primary)]"></div>
        </div>
      ) : businesses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {businesses.map((business) => (
            <BusinessCard key={business._id} business={business} />
          ))}
        </div>
      ) : (
        <div className="text-center p-8 border rounded-md border-dashed border-[color:var(--color-border)]">
          <h3 className="font-semibold text-lg mb-2">Nessun ristorante</h3>
          <p className="text-[color:var(--color-muted-foreground)] mb-4">
            Non hai ancora creato nessun ristorante.
          </p>
          <Link
            to="/businesses/new"
            className="inline-flex items-center px-4 py-2 rounded-md bg-[color:var(--color-primary)] text-[color:var(--color-primary-foreground)] hover:bg-[color:var(--color-primary-dark)]"
          >
            <Plus size={16} className="mr-2" />
            Crea il tuo primo ristorante
          </Link>
        </div>
      )}

      <div className="mt-12">
        <h2 className="text-xl font-semibold mb-4">Statistiche generali</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Ordini totali"
            value="0"
            icon={<Phone size={18} />}
          />
          <StatCard
            title="Incasso totale"
            value="€0.00"
            icon={<RefreshCcw size={18} />}
          />
          <StatCard
            title="Menu attivi"
            value="0"
            icon={<MenuIcon size={18} />}
          />
        </div>
      </div>
    </div>
  );
};

interface BusinessCardProps {
  business: Business;
}

const BusinessCard = ({ business }: BusinessCardProps) => {
  return (
    <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-[color:var(--color-card)]">
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-lg">{business.name}</h3>
          <span
            className={`px-2 py-1 text-xs rounded-full ${
              business.isActive
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {business.isActive ? "Attivo" : "Inattivo"}
          </span>
        </div>
        <p className="text-[color:var(--color-muted-foreground)] text-sm mt-1">
          {business.address.street}, {business.address.city}
        </p>
        <p className="text-[color:var(--color-muted-foreground)] text-sm">
          {business.phoneNumber}
        </p>
      </div>
      <div className="border-t p-4 bg-[color:var(--color-accent)] bg-opacity-5 flex justify-between">
        <Link
          to={`/businesses/${business._id}`}
          className="text-[color:var(--color-primary)] hover:underline text-sm"
        >
          Gestisci
        </Link>
        <Link
          to={`/businesses/${business._id}/orders`}
          className="text-[color:var(--color-primary)] hover:underline text-sm"
        >
          Visualizza ordini
        </Link>
      </div>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string;
  icon?: React.ReactNode;
}

const StatCard = ({ title, value, icon }: StatCardProps) => {
  return (
    <div className="bg-[color:var(--color-card)] p-4 rounded-lg border">
      <div className="flex items-center mb-2">
        {icon && (
          <div className="mr-2 text-[color:var(--color-primary)]">{icon}</div>
        )}
        <h3 className="text-[color:var(--color-muted-foreground)] text-sm">
          {title}
        </h3>
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
};

export default Dashboard;
