import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { businessAPI } from "../../services/api";

const NewRestaurant = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    address: {
      street: "",
      city: "",
      state: "",
      postalCode: "",
      country: "Italia",
    },
    phoneNumber: "",
    email: "",
    businessHours: [
      { day: 0, open: "00:00", close: "00:00", maxOrdersPerSlot: 4 }, // Domenica
      { day: 1, open: "10:00", close: "22:00", maxOrdersPerSlot: 4 }, // Lunedì
      { day: 2, open: "10:00", close: "22:00", maxOrdersPerSlot: 4 }, // Martedì
      { day: 3, open: "10:00", close: "22:00", maxOrdersPerSlot: 4 }, // Mercoledì
      { day: 4, open: "10:00", close: "22:00", maxOrdersPerSlot: 4 }, // Giovedì
      { day: 5, open: "10:00", close: "23:00", maxOrdersPerSlot: 4 }, // Venerdì
      { day: 6, open: "10:00", close: "23:00", maxOrdersPerSlot: 4 }, // Sabato
    ],
    slotDuration: 15,
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => {
        // Type assertion to tell TypeScript this is an object that can be spread
        const parentObj = prev[parent as keyof typeof prev] as Record<
          string,
          string
        >;

        return {
          ...prev,
          [parent]: {
            ...parentObj,
            [child]: value,
          },
        };
      });
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await businessAPI.createBusiness(formData);
      if (response.data.success) {
        navigate(`/businesses/${response.data.data._id}`);
      } else {
        throw new Error(
          response.data.message || "Errore durante la creazione del ristorante"
        );
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Error creating business:", err);
      setError(
        err.response?.data?.message ||
          "Errore durante la creazione del ristorante"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Nuovo Ristorante</h1>

      {error && (
        <div className="p-4 mb-6 rounded-md bg-[color:var(--color-destructive-light)] text-[color:var(--color-destructive)]">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Nome del ristorante*
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full p-2 border border-[color:var(--color-border)] rounded bg-[color:var(--color-background)]"
              disabled={isLoading}
            />
          </div>

          <div>
            <label
              htmlFor="address.street"
              className="block text-sm font-medium mb-1"
            >
              Indirizzo*
            </label>
            <input
              id="address.street"
              name="address.street"
              type="text"
              required
              value={formData.address.street}
              onChange={handleChange}
              className="w-full p-2 border border-[color:var(--color-border)] rounded bg-[color:var(--color-background)]"
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="address.city"
                className="block text-sm font-medium mb-1"
              >
                Città*
              </label>
              <input
                id="address.city"
                name="address.city"
                type="text"
                required
                value={formData.address.city}
                onChange={handleChange}
                className="w-full p-2 border border-[color:var(--color-border)] rounded bg-[color:var(--color-background)]"
                disabled={isLoading}
              />
            </div>

            <div>
              <label
                htmlFor="address.postalCode"
                className="block text-sm font-medium mb-1"
              >
                CAP*
              </label>
              <input
                id="address.postalCode"
                name="address.postalCode"
                type="text"
                required
                value={formData.address.postalCode}
                onChange={handleChange}
                className="w-full p-2 border border-[color:var(--color-border)] rounded bg-[color:var(--color-background)]"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="address.state"
                className="block text-sm font-medium mb-1"
              >
                Provincia*
              </label>
              <input
                id="address.state"
                name="address.state"
                type="text"
                required
                value={formData.address.state}
                onChange={handleChange}
                className="w-full p-2 border border-[color:var(--color-border)] rounded bg-[color:var(--color-background)]"
                disabled={isLoading}
              />
            </div>

            <div>
              <label
                htmlFor="address.country"
                className="block text-sm font-medium mb-1"
              >
                Paese*
              </label>
              <input
                id="address.country"
                name="address.country"
                type="text"
                required
                value={formData.address.country}
                onChange={handleChange}
                className="w-full p-2 border border-[color:var(--color-border)] rounded bg-[color:var(--color-background)]"
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="phoneNumber"
              className="block text-sm font-medium mb-1"
            >
              Telefono*
            </label>
            <input
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              required
              value={formData.phoneNumber}
              onChange={handleChange}
              className="w-full p-2 border border-[color:var(--color-border)] rounded bg-[color:var(--color-background)]"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email*
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full p-2 border border-[color:var(--color-border)] rounded bg-[color:var(--color-background)]"
              disabled={isLoading}
            />
          </div>

          {/* Nota: gli orari verranno gestiti in una pagina di configurazione successiva */}
          <div>
            <p className="text-sm text-[color:var(--color-muted-foreground)]">
              Gli orari di apertura predefiniti sono stati impostati. Potrai
              modificarli dopo aver creato il ristorante.
            </p>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="px-4 py-2 border border-[color:var(--color-border)] rounded"
            disabled={isLoading}
          >
            Annulla
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-[color:var(--color-primary)] text-[color:var(--color-primary-foreground)] rounded hover:opacity-90 disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? "Creazione in corso..." : "Crea Ristorante"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewRestaurant;
