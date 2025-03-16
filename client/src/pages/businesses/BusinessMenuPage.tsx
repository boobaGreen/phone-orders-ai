import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { businessAPI } from "../../services/api";

const BusinessMenuPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [business, setBusiness] = useState<any>(null);
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !business) {
    return (
      <div className="p-6 bg-destructive/10 text-destructive rounded-md">
        <h2 className="text-xl font-bold mb-2">Errore</h2>
        <p>
          {error || "Non è stato possibile caricare il ristorante richiesto."}
        </p>
        <button
          onClick={() => navigate("/dashboard")}
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md"
        >
          Torna alla Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Menu di {business.name}</h1>
        <button
          onClick={() => navigate(`/businesses/${id}`)}
          className="px-4 py-2 border border-border rounded-md"
        >
          Torna ai Dettagli
        </button>
      </div>

      <div className="bg-card p-6 rounded-lg border border-border">
        <p className="mb-6">
          Gestisci i piatti e le categorie del menu del tuo ristorante.
        </p>

        {/* Placeholder per lo sviluppo futuro */}
        <div className="p-8 border border-dashed border-muted-foreground/50 rounded-lg text-center">
          <h3 className="text-lg font-medium mb-2">
            Gestione Menu in Sviluppo
          </h3>
          <p className="text-muted-foreground">
            Questa funzionalità è in fase di sviluppo. Presto potrai aggiungere,
            modificare ed organizzare i piatti del tuo menu.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BusinessMenuPage;
