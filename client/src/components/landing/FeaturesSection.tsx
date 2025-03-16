import {
  Phone,
  MessageSquare,
  ClipboardCheck,
  Clock,
  BarChart,
  Settings,
  Calendar,
  Users,
} from "lucide-react";

interface FeatureProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const Feature = ({ icon, title, description }: FeatureProps) => {
  return (
    <div className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-primary hover:shadow-md">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground">
        {icon}
      </div>
      <h3 className="mb-2 text-xl font-semibold">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
};

export function FeaturesSection() {
  const features: FeatureProps[] = [
    {
      icon: <Phone className="h-6 w-6" />,
      title: "Gestione Chiamate",
      description:
        "Rispondi automaticamente alle chiamate dei clienti in qualsiasi momento della giornata.",
    },
    {
      icon: <MessageSquare className="h-6 w-6" />,
      title: "AI Conversazionale",
      description:
        "L'assistente comprende il linguaggio naturale e interagisce con i clienti in modo umano.",
    },
    {
      icon: <ClipboardCheck className="h-6 w-6" />,
      title: "Precisione negli Ordini",
      description:
        "Registrazione accurata degli ordini, riducendo gli errori e aumentando la soddisfazione.",
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Gestione Ritiri",
      description:
        "Ottimizzazione dei tempi di preparazione e ritiro con fasce orarie personalizzabili.",
    },
    {
      icon: <BarChart className="h-6 w-6" />,
      title: "Analytics Avanzate",
      description:
        "Monitora il rendimento del tuo ristorante con metriche e report dettagliati.",
    },
    {
      icon: <Settings className="h-6 w-6" />,
      title: "Menu Personalizzabili",
      description:
        "Aggiorna facilmente il tuo menu con prezzi, varianti e disponibilità in tempo reale.",
    },
    {
      icon: <Calendar className="h-6 w-6" />,
      title: "Pianificazione Intelligente",
      description:
        "Organizza gli orari di ritiro per evitare congestioni e ottimizzare la preparazione.",
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Multi-ristorante",
      description:
        "Gestisci più locali dalla stessa piattaforma con impostazioni personalizzate.",
    },
  ];

  return (
    <section className="container mx-auto px-4 py-16 md:py-24">
      <div className="text-center mb-16">
        <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
          Funzionalità Principali
        </h2>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          Tutto ciò di cui hai bisogno per gestire gli ordini telefonici della
          tua pizzeria con intelligenza artificiale.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {features.map((feature, index) => (
          <Feature
            key={index}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
          />
        ))}
      </div>
    </section>
  );
}

export default FeaturesSection;
