import { useState } from "react";
import { ArrowLeft, ArrowRight, Star } from "lucide-react";

interface Testimonial {
  content: string;
  author: {
    name: string;
    role: string;
    business: string;
  };
  rating: number;
}

export function TestimonialsSection() {
  const [activeIndex, setActiveIndex] = useState(0);

  const testimonials: Testimonial[] = [
    {
      content:
        "Da quando ho attivato l'assistente AI, gli errori negli ordini sono diminuiti del 60% e i clienti sono più soddisfatti. Posso concentrarmi sulla preparazione delle pizze mentre l'assistente gestisce tutte le chiamate.",
      author: {
        name: "Marco Rossi",
        role: "Proprietario",
        business: "Pizzeria Da Marco",
      },
      rating: 5,
    },
    {
      content:
        "Inizialmente ero scettico sull'uso di un assistente AI per prendere ordini, ma mi ha stupito quanto sia naturale e preciso. I clienti spesso non si rendono conto di parlare con un'intelligenza artificiale!",
      author: {
        name: "Laura Bianchi",
        role: "Direttrice",
        business: "Pizza Express",
      },
      rating: 5,
    },
    {
      content:
        "Nelle ore di punta riuscivamo a gestire solo il 70% delle chiamate. Ora con l'assistente AI non perdiamo più nessun ordine e abbiamo aumentato il fatturato del 25% nel primo mese.",
      author: {
        name: "Antonio Verdi",
        role: "Co-fondatore",
        business: "Pizzeria Napoletana",
      },
      rating: 4,
    },
  ];

  const nextTestimonial = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setActiveIndex(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length
    );
  };

  return (
    <section className="bg-background py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            I Nostri Clienti Parlano
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Scopri come le pizzerie di tutta Italia stanno migliorando la loro
            attività con il nostro assistente AI.
          </p>
        </div>

        <div className="relative mx-auto max-w-4xl">
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${activeIndex * 100}%)` }}
            >
              {testimonials.map((testimonial, index) => (
                <div key={index} className="w-full flex-shrink-0 px-4">
                  <div className="bg-card p-8 rounded-xl border border-border shadow-md">
                    <div className="flex mb-6">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${
                            i < testimonial.rating
                              ? "fill-primary text-primary"
                              : "fill-muted text-muted"
                          }`}
                        />
                      ))}
                    </div>
                    <blockquote className="mb-8 text-lg italic text-foreground">
                      "{testimonial.content}"
                    </blockquote>
                    <div className="flex items-center">
                      <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-medium">
                        {testimonial.author.name.charAt(0)}
                      </div>
                      <div className="ml-4">
                        <div className="font-semibold">
                          {testimonial.author.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {testimonial.author.role},{" "}
                          {testimonial.author.business}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 flex justify-center gap-4">
            <button
              className="p-2 rounded-full border border-border bg-background text-foreground hover:bg-muted transition-colors"
              onClick={prevTestimonial}
              aria-label="Testimonianza precedente"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            {testimonials.map((_, index) => (
              <button
                key={index}
                className={`h-3 w-3 rounded-full ${
                  index === activeIndex
                    ? "bg-primary"
                    : "bg-muted border border-border"
                }`}
                onClick={() => setActiveIndex(index)}
                aria-label={`Vai alla testimonianza ${index + 1}`}
              />
            ))}
            <button
              className="p-2 rounded-full border border-border bg-background text-foreground hover:bg-muted transition-colors"
              onClick={nextTestimonial}
              aria-label="Testimonianza successiva"
            >
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default TestimonialsSection;
