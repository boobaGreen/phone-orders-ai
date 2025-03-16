import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { businessAPI } from "../../services/api";

const RestaurantMenu = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [restaurant, setRestaurant] = useState<any>(null);

  useEffect(() => {
    const fetchRestaurantDetails = async () => {
      try {
        setIsLoading(true);
        const response = await businessAPI.getBusiness(id!);

        if (response.data.success) {
          setRestaurant(response.data.data);
        } else {
          throw new Error(
            response.data.message ||
              "Errore nel caricamento dei dettagli del ristorante"
          );
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        console.error("Error fetching restaurant details:", err);
        setError(
          "Impossibile caricare i dettagli del ristorante. Riprova più tardi."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchRestaurantDetails();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !restaurant) {
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
        <h1 className="text-2xl font-bold">Menu di {restaurant.name}</h1>
        <button
          onClick={() => navigate(`/businesses/${id}`)}
          className="px-4 py-2 border border-border rounded-md"
        >
          Torna ai Dettagli
        </button>
      </div>

      <div className="bg-card p-6 rounded-lg border border-border">
        <p className="text-center text-muted-foreground">
          Funzionalità di gestione menu in fase di sviluppo. Presto potrai
          aggiungere e modificare i piatti del tuo menu.
        </p>
      </div>
    </div>
  );
};

export default RestaurantMenu;
