import { useState } from "react";
import { Check, Info } from "lucide-react";
import { Link } from "react-router-dom";

export function PricingSection() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly"
  );

  // Funzionalità base presenti in tutti i piani a pagamento
  const standardFeatures = [
    "Dashboard completa",
    "Storico dati illimitato",
    "Tutte le funzionalità avanzate",
    "Backup in tempo reale",
  ];

  const plans = [
    {
      name: "Free",
      description: "Per testare il servizio prima di iniziare",
      price: "€0",
      period: "/sempre",
      features: [
        "1 ristorante",
        "10 ordini/mese",
        "Funzionalità base",
        "Assistenza via email",
        "Dashboard base",
        "7 giorni di storico dati",
      ],
      cta: "Inizia gratis",
      ctaLink: "/auth/register",
      popular: false,
    },
    {
      name: "Standard",
      description: "Per pizzerie con volume di chiamate medio",
      price: billingCycle === "monthly" ? "€39" : "€390",
      period: billingCycle === "monthly" ? "/mese" : "/anno",
      features: [
        "Fino a 3 ristoranti*",
        "Fino a 1.000 ordini/mese per ristorante",
        ...standardFeatures,
        "Report settimanali",
        "Assistenza via email",
      ],
      cta: "Abbonati",
      ctaLink: "/auth/register?plan=standard",
      popular: true,
    },
    {
      name: "Professional",
      description: "Per pizzerie con alto volume di ordini o catene",
      price: billingCycle === "monthly" ? "€99" : "€990",
      period: billingCycle === "monthly" ? "/mese" : "/anno",
      features: [
        "Fino a 10 ristoranti*",
        "Fino a 3.000 ordini/mese per ristorante",
        ...standardFeatures,
        "Report settimanali",
        "Assistenza via email",
      ],
      cta: "Abbonati",
      ctaLink: "/auth/register?plan=professional",
      popular: false,
    },
  ];

  return (
    <section className="bg-card py-16 md:py-24" id="pricing">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Piani semplici e scalabili
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Scegli il piano più adatto alle dimensioni della tua attività, con
            costi prevedibili e crescita flessibile.
          </p>

          <div className="mt-8 inline-flex items-center p-1 bg-muted rounded-full">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                billingCycle === "monthly"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground"
              }`}
            >
              Mensile
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                billingCycle === "yearly"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground"
              }`}
            >
              Annuale{" "}
              <span className="text-xs text-primary">Risparmia 17%</span>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-xl border ${
                plan.popular
                  ? "border-primary relative shadow-lg"
                  : "border-border"
              } bg-background p-8 transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl`}
            >
              {plan.popular && (
                <div className="absolute -top-3 right-6 bg-primary text-primary-foreground px-3 py-1 text-xs font-semibold rounded-full">
                  Popolare
                </div>
              )}

              <div className="mb-5">
                <h3 className="text-2xl font-bold">{plan.name}</h3>
                <p className="mt-2 text-muted-foreground text-sm">
                  {plan.description}
                </p>
              </div>

              <div className="my-8">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground">{plan.period}</span>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start">
                    <Check size={18} className="text-primary mr-3 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                to={plan.ctaLink}
                className={`block w-full py-3 text-center rounded-lg font-medium transition-colors ${
                  plan.popular
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-background text-foreground border border-border hover:bg-muted"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-12 mx-auto max-w-3xl px-6 py-5 bg-background/50 border border-border rounded-lg">
          <div className="flex items-start">
            <Info
              size={20}
              className="text-muted-foreground mr-3 mt-0.5 shrink-0"
            />
            <div className="text-sm text-muted-foreground">
              <p>
                <strong>* Note sui piani:</strong>
              </p>
              <p className="mt-2">
                Gli ordini sono calcolati per singolo ristorante, con un massimo
                di 3 ristoranti per il piano Standard e 10 per il piano
                Professional. In caso di superamento occasionale dei limiti, non
                ci saranno interruzioni del servizio.
              </p>
              <p className="mt-2">
                Per esigenze superiori ai limiti indicati o per catene più
                grandi,
                <a
                  href="/contact"
                  className="text-primary hover:underline ml-1"
                >
                  contattaci
                </a>{" "}
                per un piano Enterprise personalizzato.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default PricingSection;
