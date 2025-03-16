import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { businessAPI } from "../../services/api";

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
  email: string;
  businessHours: Array<{
    day: number;
    open: string;
    close: string;
    maxOrdersPerSlot: number;
  }>;
  slotDuration: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const BusinessDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [business, setBusiness] = useState<Business | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBusinessDetails = async () => {
      try {
        setIsLoading(true);
        const response = await businessAPI.getBusiness(id!);

        if (response.data.success) {
          setBusiness(response.data.data);
        } else {
          throw new Error(
            response.data.message ||
              "Errore nel caricamento dei dettagli del ristorante"
          );
        }
      } catch (err: any) {
        console.error("Error fetching business details:", err);
        setError(
          "Impossibile caricare i dettagli del ristorante. Riprova più tardi."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchBusinessDetails();
  }, [id]);

  const getDayName = (day: number): string => {
    const days = [
      "Domenica",
      "Lunedì",
      "Martedì",
      "Mercoledì",
      "Giovedì",
      "Venerdì",
      "Sabato",
    ];
    return days[day];
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[color:var(--color-primary)]"></div>
      </div>
    );
  }

  if (error || !business) {
    return (
      <div className="p-6 bg-[color:var(--color-destructive-light)] text-[color:var(--color-destructive)] rounded-md">
        <h2 className="text-xl font-bold mb-2">Errore</h2>
        <p>
          {error || "Non è stato possibile caricare il ristorante richiesto."}
        </p>
        <button
          onClick={() => navigate("/dashboard")}
          className="mt-4 px-4 py-2 bg-[color:var(--color-primary)] text-[color:var(--color-primary-foreground)] rounded-md"
        >
          Torna alla Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{business.name}</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => navigate(`/businesses/${business._id}/menu`)}
            className="px-4 py-2 bg-[color:var(--color-primary)] text-[color:var(--color-primary-foreground)] rounded-md"
          >
            Gestisci Menu
          </button>
          <button
            onClick={() => navigate(`/businesses/${business._id}/orders`)}
            className="px-4 py-2 border border-[color:var(--color-border)] rounded-md"
          >
            Visualizza Ordini
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[color:var(--color-card)] p-6 rounded-lg border border-[color:var(--color-border)]">
          <h2 className="text-xl font-semibold mb-4">Informazioni Generali</h2>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <p className="text-sm text-[color:var(--color-muted-foreground)]">
                Nome
              </p>
              <p className="font-medium">{business.name}</p>
            </div>
            <div>
              <p className="text-sm text-[color:var(--color-muted-foreground)]">
                Indirizzo
              </p>
              <p className="font-medium">
                {business.address.street}, {business.address.city},{" "}
                {business.address.state} {business.address.postalCode},{" "}
                {business.address.country}
              </p>
            </div>
            <div>
              <p className="text-sm text-[color:var(--color-muted-foreground)]">
                Telefono
              </p>
              <p className="font-medium">{business.phoneNumber}</p>
            </div>
            <div>
              <p className="text-sm text-[color:var(--color-muted-foreground)]">
                Email
              </p>
              <p className="font-medium">{business.email}</p>
            </div>
            <div>
              <p className="text-sm text-[color:var(--color-muted-foreground)]">
                Stato
              </p>
              <p
                className={`font-medium ${
                  business.isActive ? "text-green-600" : "text-red-600"
                }`}
              >
                {business.isActive ? "Attivo" : "Inattivo"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-[color:var(--color-card)] p-6 rounded-lg border border-[color:var(--color-border)]">
          <h2 className="text-xl font-semibold mb-4">Orari di Apertura</h2>
          <div className="space-y-2">
            {business.businessHours.map((hour) => (
              <div key={hour.day} className="flex justify-between">
                <span className="font-medium">{getDayName(hour.day)}</span>
                {hour.open === "00:00" && hour.close === "00:00" ? (
                  <span className="text-[color:var(--color-muted-foreground)]">
                    Chiuso
                  </span>
                ) : (
                  <span>
                    {hour.open} - {hour.close}
                  </span>
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-[color:var(--color-border)]">
            <p className="text-sm text-[color:var(--color-muted-foreground)]">
              Durata slot: {business.slotDuration} minuti
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-between">
        <button
          onClick={() => navigate("/dashboard")}
          className="px-4 py-2 border border-[color:var(--color-border)] rounded-md"
        >
          Torna alla Dashboard
        </button>
        <button
          onClick={() => navigate(`/businesses/${business._id}/edit`)}
          className="px-4 py-2 bg-[color:var(--color-primary)] text-[color:var(--color-primary-foreground)] rounded-md"
        >
          Modifica Informazioni
        </button>
      </div>
    </div>
  );
};

export default BusinessDetails;
