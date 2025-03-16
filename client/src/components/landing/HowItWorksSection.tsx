import { useState, useEffect } from "react";
import { Phone, Bot, Store, Check, ArrowRight } from "lucide-react";

export function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState(0);

  // Avanza automaticamente attraverso i passaggi ogni 3 secondi
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 4);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const steps = [
    {
      icon: <Phone className="h-10 w-10" />,
      title: "Il cliente chiama",
      description:
        "Il cliente chiama il numero della pizzeria per effettuare un ordine con ritiro in sede",
      color: "text-blue-500",
      bgColor: "bg-blue-100 dark:bg-blue-950/40",
    },
    {
      icon: <Bot className="h-10 w-10" />,
      title: "L'assistente AI risponde",
      description:
        "Il nostro assistente AI risponde alla chiamata e interagisce con il cliente in modo naturale",
      color: "text-green-500",
      bgColor: "bg-green-100 dark:bg-green-950/40",
    },
    {
      icon: <Store className="h-10 w-10" />,
      title: "Creazione dell'ordine",
      description:
        "L'ordine viene registrato automaticamente nel sistema della pizzeria con tutti i dettagli",
      color: "text-amber-500",
      bgColor: "bg-amber-100 dark:bg-amber-950/40",
    },
    {
      icon: <Check className="h-10 w-10" />,
      title: "Preparazione e ritiro",
      description:
        "La pizzeria prepara l'ordine e il cliente lo ritira all'orario concordato",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Come Funziona
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Il nostro assistente AI si occupa dell'intero processo di ordine
            telefonico, lasciandoti libero di concentrarti sulla preparazione
            delle pizze.
          </p>
        </div>

        <div className="relative mt-20">
          {/* Timeline connector */}
          <div className="hidden md:block absolute top-24 left-0 right-0 h-0.5 bg-border">
            <div
              className="h-full bg-primary transition-all duration-500 ease-in-out"
              style={{ width: `${(activeStep + 1) * 25}%` }}
            ></div>
          </div>

          {/* Steps */}
          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`relative ${
                  index <= activeStep ? "opacity-100" : "opacity-50"
                } transition-all duration-500`}
              >
                <div className="md:absolute md:top-0 md:left-1/2 md:transform md:-translate-x-1/2 md:-translate-y-1/2 z-10">
                  <div
                    className={`flex items-center justify-center h-16 w-16 rounded-full border-4 border-background ${
                      step.bgColor
                    } ${step.color} ${
                      index <= activeStep ? "scale-110" : "scale-100"
                    } transition-transform duration-500`}
                  >
                    {step.icon}
                  </div>
                </div>

                <div
                  className={`pt-20 text-center transition-all duration-500 ${
                    index === activeStep ? "scale-105" : "scale-100"
                  }`}
                >
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>

                {index < steps.length - 1 && (
                  <div className="md:hidden flex justify-center my-8">
                    <ArrowRight className="text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-24 text-center">
          <div className="inline-flex items-center justify-center p-6 rounded-full bg-card border border-border mb-6">
            <div className="p-4 rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
              <Bot className="h-8 w-8" />
            </div>
          </div>
          <h3 className="text-2xl font-semibold mb-2">
            I tuoi clienti noteranno la differenza?
          </h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            La nostra AI è così naturale che la maggior parte dei clienti non si
            accorge di parlare con un assistente virtuale. La voce, le pause, e
            persino le piccole interazioni sono progettate per sembrare
            completamente umane.
          </p>
        </div>
      </div>

      {/* Animated phone call visualization */}
      <div className="mt-20 max-w-4xl mx-auto px-4 overflow-hidden">
        <div className="relative bg-background rounded-xl border border-border shadow-lg p-6">
          <div className="absolute top-4 left-4 flex space-x-2">
            <div className="h-3 w-3 rounded-full bg-destructive"></div>
            <div className="h-3 w-3 rounded-full bg-amber-500"></div>
            <div className="h-3 w-3 rounded-full bg-green-500"></div>
          </div>

          <div className="pt-8">
            <div className="flex flex-col space-y-4">
              <div className="self-start max-w-[80%] bg-muted p-4 rounded-lg rounded-tl-none">
                <p className="text-sm mb-1 font-medium">Cliente</p>
                <p className="text-muted-foreground animate-pulse">
                  Buonasera, vorrei ordinare una pizza...
                </p>
              </div>

              <div className="self-end max-w-[80%] bg-primary/10 p-4 rounded-lg rounded-tr-none">
                <p className="text-sm mb-1 font-medium text-primary">
                  Assistente AI
                </p>
                <p>
                  Buonasera! Grazie per aver chiamato Pizzeria Da Marco. Sarò
                  felice di aiutarla con il suo ordine. Cosa desidera ordinare
                  stasera?
                </p>
              </div>

              <div className="self-start max-w-[80%] bg-muted p-4 rounded-lg rounded-tl-none">
                <p className="text-sm mb-1 font-medium">Cliente</p>
                <p className="text-muted-foreground">
                  Vorrei una margherita grande e una diavola media da ritirare.
                </p>
              </div>

              <div className="self-end max-w-[80%] bg-primary/10 p-4 rounded-lg rounded-tr-none">
                <p className="text-sm mb-1 font-medium text-primary">
                  Assistente AI
                </p>
                <p>
                  Perfetto! Ho annotato una pizza margherita grande e una
                  diavola media. A che ora desidera venire a ritirarle?
                </p>
              </div>

              <div
                className={`self-start max-w-[80%] bg-muted p-4 rounded-lg rounded-tl-none transition-opacity duration-500 ${
                  activeStep >= 2 ? "opacity-100" : "opacity-0"
                }`}
              >
                <p className="text-sm mb-1 font-medium">Cliente</p>
                <p className="text-muted-foreground">
                  Tra circa 30 minuti, alle 19:30.
                </p>
              </div>

              <div
                className={`self-end max-w-[80%] bg-primary/10 p-4 rounded-lg rounded-tr-none transition-opacity duration-500 ${
                  activeStep >= 3 ? "opacity-100" : "opacity-0"
                }`}
              >
                <p className="text-sm mb-1 font-medium text-primary">
                  Assistente AI
                </p>
                <p>
                  Perfetto! Il suo ordine sarà pronto per il ritiro alle 19:30.
                  Il totale è di €18,50 da pagare in negozio. A nome di chi devo
                  registrare l'ordine?
                </p>
              </div>
            </div>

            <div className="mt-6 h-10 w-full rounded-full bg-muted/50 relative overflow-hidden">
              <div
                className="h-full bg-primary/20 transition-all duration-1000 ease-in-out rounded-full"
                style={{ width: `${(activeStep + 1) * 25}%` }}
              ></div>
            </div>

            <div className="mt-4 text-center text-sm text-muted-foreground">
              Semplice, veloce e senza errori
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HowItWorksSection;
