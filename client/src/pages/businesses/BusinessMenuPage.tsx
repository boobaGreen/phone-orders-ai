/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { businessAPI } from "../../services/api";
import { Menu, MenuItem } from "../../types";
import { Plus, Trash2, Edit, X } from "lucide-react";

// Categorie preimpostate per ristoranti italiani
const PRESET_CATEGORIES = [
  { name: "Pizze", color: "bg-red-100 text-red-800" },
  { name: "Antipasti", color: "bg-amber-100 text-amber-800" },
  { name: "Primi", color: "bg-yellow-100 text-yellow-800" },
  { name: "Secondi", color: "bg-green-100 text-green-800" },
  { name: "Contorni", color: "bg-emerald-100 text-emerald-800" },
  { name: "Dolci", color: "bg-pink-100 text-pink-800" },
  { name: "Bevande", color: "bg-blue-100 text-blue-800" },
  { name: "Birre", color: "bg-indigo-100 text-indigo-800" },
  { name: "Vini", color: "bg-purple-100 text-purple-800" },
  { name: "Panini", color: "bg-orange-100 text-orange-800" },
  { name: "Piadine", color: "bg-lime-100 text-lime-800" },
  { name: "Crescioni", color: "bg-teal-100 text-teal-800" },
];

const BusinessMenuPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [business, setBusiness] = useState<any>(null);
  const [menu, setMenu] = useState<Menu | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  // Carica dettagli business e menu
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Carica dettagli business
        const businessResponse = await businessAPI.getBusiness(id!);
        if (!businessResponse.data.success) {
          throw new Error(
            businessResponse.data.message ||
              "Errore nel caricamento dei dettagli del ristorante"
          );
        }
        setBusiness(businessResponse.data.data);

        // Carica menu se esiste
        try {
          const menuResponse = await businessAPI.getMenu(id!);
          if (menuResponse.data.success) {
            const menuData = menuResponse.data.data;
            setMenu(menuData);

            // Estrai categorie dal menu
            const uniqueCategories = [
              ...new Set(menuData.items.map((item: MenuItem) => item.category)),
            ] as string[];
            setCategories(uniqueCategories);
            if (uniqueCategories.length > 0) {
              setActiveCategory(uniqueCategories[0]);
            }
          }
        } catch (menuErr) {
          console.log("Menu non trovato, potrebbe essere il primo accesso");
          // Non è un errore critico se il menu non esiste ancora
        }
      } catch (err: any) {
        console.error("Error fetching data:", err);
        setError("Impossibile caricare i dati necessari. Riprova più tardi.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Gestisce il salvataggio del menu

  // Aggiunge una nuova categoria
  const handleAddCategory = () => {
    if (!newCategory.trim()) return;

    if (!categories.includes(newCategory.trim())) {
      const updatedCategories = [...categories, newCategory.trim()];
      setCategories(updatedCategories);
      setActiveCategory(newCategory.trim());
      setNewCategory("");

      // Aggiorna anche il menu con le nuove categorie per assicurarsi che vengano salvate
      if (menu) {
        setMenu({
          ...menu,
          // Mantieni le categorie negli item ma aggiungi un campo categories esplicito
          categories: updatedCategories,
        });
      }
    }
  };

  // Aggiunge una categoria preimpostata
  const addPresetCategory = (categoryName: string) => {
    if (!categories.includes(categoryName)) {
      const updatedCategories = [...categories, categoryName];
      setCategories(updatedCategories);
      setActiveCategory(categoryName);

      // Aggiorna anche il menu con le nuove categorie
      if (menu) {
        setMenu({
          ...menu,
          categories: updatedCategories,
        });
      }
    } else {
      // Se la categoria esiste già, rendila attiva
      setActiveCategory(categoryName);
    }
  };

  // Prepara un nuovo item da modificare
  const handleNewItem = () => {
    const newItem: MenuItem = {
      _id: `temp-${Date.now()}`, // ID temporaneo
      name: "",
      description: "",
      price: 0,
      category: activeCategory || "",
      isAvailable: true,
      variants: [],
      options: [],
    };

    setEditingItem(newItem);
  };

  // Salva le modifiche a un item
  const handleSaveItem = (item: MenuItem) => {
    if (!menu) return;

    const isNew = item._id?.startsWith("temp-") ?? false;
    let updatedItems;

    if (isNew) {
      // Rimuovi l'ID temporaneo per il backend
      const { _id, ...newItemData } = item;
      updatedItems = [...(menu.items || []), newItemData];
    } else {
      updatedItems = menu.items.map((existingItem) =>
        existingItem._id === item._id ? item : existingItem
      );
    }

    const updatedMenu = {
      ...menu,
      items: updatedItems,
    };

    setMenu(updatedMenu);
    setEditingItem(null);

    // Salvataggio automatico dopo aver aggiunto/modificato un prodotto
    saveMenuToServer(updatedMenu);
  };

  // Eliminare un item
  const handleDeleteItem = (itemId: string) => {
    if (!menu) return;

    const updatedItems = menu.items.filter((item) => item._id !== itemId);
    const updatedMenu = {
      ...menu,
      items: updatedItems,
    };

    setMenu(updatedMenu);

    // Salvataggio automatico dopo aver eliminato un prodotto
    saveMenuToServer(updatedMenu);
  };

  // Inizializza il menu vuoto quando clicchi su "Crea il tuo primo menu"
  const handleCreateFirstMenu = () => {
    setMenu({
      name: `Menu di ${business.name}`,
      items: [],
      businessId: id || '',
      isActive: true,
      categories: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    setIsEditing(true);
  };

  // Funzione per eliminare una categoria (solo se è vuota)
  const handleDeleteCategory = (categoryToDelete: string) => {
    // Verifica se ci sono prodotti in questa categoria
    if (menu && menu.items) {
      const productsInCategory = menu.items.filter(
        (item) => item.category === categoryToDelete
      );
      if (productsInCategory.length > 0) {
        // Mostra un messaggio di errore
        alert(
          "Impossibile eliminare questa categoria perché contiene dei prodotti. Spostali o eliminali prima di procedere."
        );
        return;
      }
    }

    // Se la categoria è vuota, procedi con l'eliminazione
    const updatedCategories = categories.filter((c) => c !== categoryToDelete);
    setCategories(updatedCategories);

    // Se la categoria eliminata era quella attiva, seleziona la prima categoria disponibile
    if (activeCategory === categoryToDelete) {
      setActiveCategory(
        updatedCategories.length > 0 ? updatedCategories[0] : null
      );
    }

    // Aggiorna il menu per riflettere le categorie modificate
    if (menu) {
      const updatedMenu = {
        ...menu,
        categories: updatedCategories,
      };
      setMenu(updatedMenu);

      // Salvataggio automatico dopo l'eliminazione della categoria
      saveMenuToServer(updatedMenu);
    }
  };

  // Funzione per salvare il menu (rifattorizzata per evitare duplicazioni)
  const saveMenuToServer = async (menuToSave: Menu) => {
    try {
      setIsSaving(true);
      const response = menuToSave._id
        ? await businessAPI.updateMenu(id!, menuToSave)
        : await businessAPI.createMenu(id!, menuToSave);

      if (response.data.success) {
        // Aggiorna il menu con i dati restituiti dal server
        setMenu(response.data.data);
      } else {
        throw new Error(
          response.data.message || "Errore durante il salvataggio del menu"
        );
      }
    } catch (err: any) {
      console.error("Error saving menu:", err);
      setError("Impossibile salvare il menu. Riprova più tardi.");
    } finally {
      setIsSaving(false);
    }
  };

  // Componente per l'editor degli item
  const ItemEditor = ({ item }: { item: MenuItem }) => {
    const [itemData, setItemData] = useState<MenuItem>(item);

    const updateField = (field: string, value: any) => {
      setItemData({
        ...itemData,
        [field]: value,
      });
    };

    // Non permettere di salvare un item se non ci sono categorie o se la categoria non è selezionata
    const canSave =
      itemData.name.trim() !== "" &&
      itemData.category !== "" &&
      categories.length > 0;

    return (
      <div className="bg-background p-4 border rounded-md">
        <h3 className="font-medium mb-4">
          {item._id?.startsWith("temp-")
            ? "Nuovo prodotto"
            : "Modifica prodotto"}
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-1">
              Nome <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={itemData.name}
              onChange={(e) => updateField("name", e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Descrizione</label>
            <textarea
              value={itemData.description}
              onChange={(e) => updateField("description", e.target.value)}
              className="w-full p-2 border rounded"
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm mb-1">
              Prezzo (€) <span className="text-destructive">*</span>
            </label>
            <input
              type="number"
              step="0.10"
              min="0"
              value={itemData.price}
              onChange={(e) =>
                updateField("price", parseFloat(e.target.value) || 0)
              }
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">
              Categoria <span className="text-destructive">*</span>
            </label>
            {categories.length > 0 ? (
              <select
                value={itemData.category}
                onChange={(e) => updateField("category", e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="" disabled>
                  Seleziona una categoria
                </option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            ) : (
              <div className="w-full p-2 border rounded bg-muted text-muted-foreground">
                Non ci sono categorie disponibili. Crea una categoria prima di
                continuare.
              </div>
            )}
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isAvailable"
              checked={itemData.isAvailable}
              onChange={(e) => updateField("isAvailable", e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="isAvailable">Disponibile</label>
          </div>

          {/* TODO: Aggiungere gestione varianti e opzioni */}

          <div className="flex justify-end space-x-2 mt-4">
            <button
              onClick={() => setEditingItem(null)}
              className="px-4 py-2 border rounded"
            >
              Annulla
            </button>
            <button
              onClick={() => handleSaveItem(itemData)}
              disabled={!canSave}
              className={`px-4 py-2 rounded ${
                canSave
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              }`}
            >
              Salva
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Componente per i badge delle categorie preimpostate
  const PresetCategoryBadges = () => (
    <div className="mt-4 pt-4 border-t border-border">
      <h3 className="text-sm font-medium mb-2">Categorie consigliate</h3>
      <div className="flex flex-wrap gap-2">
        {PRESET_CATEGORIES.map((category) => (
          <button
            key={category.name}
            onClick={() => addPresetCategory(category.name)}
            disabled={categories.includes(category.name)}
            className={`text-xs py-1 px-2 rounded-full transition-colors ${
              categories.includes(category.name)
                ? "opacity-50 cursor-not-allowed"
                : "hover:opacity-80 cursor-pointer"
            } ${category.color}`}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );

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
          onClick={() => navigate(`/dashboard/businesses/${id}`)}
          className="px-4 py-2 border border-border rounded-md"
        >
          Torna ai Dettagli
        </button>
      </div>

      {!menu && !isEditing ? (
        <div className="bg-card p-6 rounded-lg border border-border">
          <p className="mb-6">
            Non è stato ancora creato un menu per questo ristorante.
          </p>
          <button
            onClick={handleCreateFirstMenu}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
          >
            Crea il tuo primo menu
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar - Categorie */}
          <div className="md:col-span-1">
            <div className="bg-card p-4 rounded-lg border border-border">
              <h2 className="font-medium mb-4">Categorie</h2>

              <ul className="space-y-1 mb-4">
                {categories.map((category) => (
                  <li
                    key={category}
                    className={`px-3 py-2 rounded cursor-pointer flex justify-between items-center ${
                      activeCategory === category
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-muted"
                    }`}
                  >
                    <span
                      onClick={() => setActiveCategory(category)}
                      className="flex-grow"
                    >
                      {category}
                    </span>

                    {isEditing && (
                      <button
                        onClick={() => handleDeleteCategory(category)}
                        className="p-1 rounded-full hover:bg-destructive/10 hover:text-destructive"
                        title={
                          (menu?.items || []).filter(
                            (item) => item.category === category
                          ).length > 0
                            ? "Elimina tutti i prodotti prima di poter eliminare questa categoria"
                            : "Elimina categoria"
                        }
                      >
                        <X size={14} />
                      </button>
                    )}
                  </li>
                ))}
              </ul>

              {isEditing && (
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex items-center">
                    <input
                      type="text"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      placeholder="Nuova categoria"
                      className="flex-1 p-2 border rounded-l text-sm"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          handleAddCategory();
                        }
                      }}
                    />
                    <button
                      onClick={handleAddCategory}
                      disabled={!newCategory.trim()}
                      className={`p-2 ${
                        !newCategory.trim()
                          ? "bg-muted text-muted-foreground"
                          : "bg-primary text-primary-foreground"
                      } rounded-r`}
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  {/* Aggiungi i badge delle categorie preimpostate */}
                  <PresetCategoryBadges />
                </div>
              )}
            </div>
          </div>

          {/* Contenuto principale - Prodotti */}
          <div className="md:col-span-3">
            <div className="bg-card p-4 rounded-lg border border-border mb-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-medium">Prodotti</h2>

                <div className="flex items-center space-x-4">
                  {/* Sostituisci i pulsanti con un toggle per la modalità modifica */}
                  <div className="flex items-center">
                    <span className="text-sm mr-2">Modalità modifica</span>
                    <div
                      onClick={() => setIsEditing(!isEditing)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full cursor-pointer transition-colors ${
                        isEditing ? "bg-primary" : "bg-gray-200"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          isEditing ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </div>
                  </div>

                  {/* Mostra solo il pulsante "Nuovo prodotto" quando sono in modalità modifica */}
                  {isEditing && categories.length > 0 && (
                    <button
                      onClick={handleNewItem}
                      className="px-3 py-1.5 text-sm bg-secondary text-secondary-foreground rounded-md"
                    >
                      <span className="flex items-center">
                        <Plus size={16} className="mr-1" />
                        Nuovo prodotto
                      </span>
                    </button>
                  )}
                </div>
              </div>

              {isEditing && !localStorage.getItem("hasEditedMenuBefore") && (
                <div className="p-3 bg-blue-50 text-blue-800 rounded-md mb-4 mt-2">
                  <p className="text-sm">
                    <strong>Consiglio:</strong> Tutte le modifiche vengono
                    salvate automaticamente. Puoi disattivare la modalità
                    modifica quando hai finito.
                    <button
                      className="ml-2 text-xs underline"
                      onClick={() =>
                        localStorage.setItem("hasEditedMenuBefore", "true")
                      }
                    >
                      Non mostrare più
                    </button>
                  </p>
                </div>
              )}

              {/* Aggiungi un messaggio di guida se non ci sono categorie */}
              {isEditing && categories.length === 0 && (
                <div className="p-4 bg-amber-50 text-amber-800 rounded-md mb-4 mt-2">
                  <p className="text-sm font-medium">
                    Prima di aggiungere prodotti, crea almeno una categoria.
                  </p>
                  <p className="text-xs mt-1">
                    Usa il campo "Nuova categoria" nel pannello a sinistra.
                  </p>
                </div>
              )}

              {/* Qui mostriamo l'editor o la lista dei prodotti */}
              {editingItem ? (
                <ItemEditor item={editingItem} />
              ) : (
                <div>
                  {activeCategory &&
                  menu?.items && menu.items.filter(
                    (item) => item.category === activeCategory
                  ).length > 0 ? (
                    <div className="space-y-2">
                      {menu.items
                        .filter((item) => item.category === activeCategory)
                        .map((item) => (
                          <div
                            key={item._id}
                            className={`p-3 border rounded flex justify-between items-center ${
                              !item.isAvailable ? "opacity-60" : ""
                            }`}
                          >
                            <div>
                              <h3 className="font-medium">{item.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {item.description}
                              </p>
                              <p className="text-sm font-medium">
                                €{item.price.toFixed(2)}
                              </p>
                            </div>

                            {isEditing && (
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => setEditingItem(item)}
                                  className="p-1.5 rounded hover:bg-muted"
                                >
                                  <Edit size={16} />
                                </button>
                                <button
                                  onClick={() => item._id && handleDeleteItem(item._id)}
                                  className="p-1.5 rounded hover:bg-destructive/10 text-destructive"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      {!activeCategory
                        ? "Seleziona una categoria o creane una nuova"
                        : isEditing
                        ? "Aggiungi prodotti a questa categoria con il pulsante 'Nuovo prodotto'"
                        : "Nessun prodotto in questa categoria"}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessMenuPage;
