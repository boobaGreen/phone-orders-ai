import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { ArrowRight, Phone, Bot, Calendar } from "lucide-react";
import { Link } from "react-router-dom";

export function HeroSection() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="relative overflow-hidden bg-background">
      {/* Decorative background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-primary/10 blur-3xl"></div>
        <div className="absolute top-1/2 -left-24 h-64 w-64 rounded-full bg-secondary/20 blur-3xl"></div>
      </div>

      <div className="container relative z-10 mx-auto px-4 py-24 md:py-32">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div
            className={`flex flex-col items-start space-y-6 transition-all duration-700 ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-12 opacity-0"
            }`}
          >
            <div className="inline-block rounded-full bg-muted px-4 py-1.5">
              <span className="text-sm font-medium text-foreground">
                Rivoluziona il tuo business con l'IA
              </span>
            </div>

            <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
              Ordini telefonici{" "}
              <span className="text-primary">automatizzati</span> per la tua
              pizzeria
            </h1>

            <p className="text-lg text-muted-foreground md:text-xl">
              Trasforma la tua pizzeria con un assistente AI intelligente che
              risponde alle chiamate, prende gli ordini con precisione per il
              ritiro e ottimizza i tempi di preparazione.
            </p>

            <div className="flex flex-wrap gap-4">
              <Button size="lg" asChild>
                <Link to="/auth/register">
                  Inizia Gratuitamente <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="#">Guarda la Demo</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/ai-test">Prova la Demo</Link>
              </Button>
            </div>
          </div>

          <div
            className={`relative transition-all duration-1000 delay-300 ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-12 opacity-0"
            }`}
          >
            <div className="relative mx-auto aspect-video max-w-lg overflow-hidden rounded-xl border border-border shadow-2xl">
              <div className="bg-card p-4 rounded-t-xl border-b border-border">
                <div className="flex items-center">
                  <div className="flex space-x-2">
                    <div className="h-3 w-3 rounded-full bg-destructive"></div>
                    <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                    <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="mx-auto text-xs font-medium text-muted-foreground">
                    Assistente pizzeria AI
                  </div>
                </div>
              </div>
              <div className="relative bg-black">
                {/* Animated mockup content */}
                <div className="p-6 space-y-6 bg-gradient-to-b from-card to-muted">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="h-2 w-28 rounded-full bg-foreground/30"></div>
                      <div className="mt-1 h-2 w-20 rounded-full bg-foreground/20"></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-secondary/20 flex items-center justify-center">
                      <Bot className="h-5 w-5 text-secondary" />
                    </div>
                    <div className="flex-1">
                      <div className="h-2 w-48 rounded-full bg-foreground/30"></div>
                      <div className="mt-1 h-2 w-32 rounded-full bg-foreground/20"></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="h-2 w-40 rounded-full bg-foreground/30"></div>
                      <div className="mt-1 h-2 w-24 rounded-full bg-foreground/20"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -right-12 -bottom-12 h-64 w-64 rounded-full bg-primary/10 blur-3xl"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HeroSection;
