import { Link } from "react-router-dom";

export function CTASection() {
  return (
    <section className="bg-gradient-to-br from-primary to-primary/80 py-16 md:py-24 text-primary-foreground">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Pronto a rivoluzionare la tua pizzeria?
        </h2>
        <p className="text-xl max-w-2xl mx-auto mb-10 text-primary-foreground/90">
          Unisciti alle centinaia di pizzerie che stanno già migliorando la loro
          efficienza e soddisfazione dei clienti con Phone Order AI.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            to="/auth/register"
            className="px-8 py-4 bg-white text-primary rounded-lg font-medium hover:bg-white/90 transition-colors shadow-lg"
          >
            Inizia Gratuitamente
          </Link>
          <Link
            to="/contact"
            className="px-8 py-4 bg-transparent text-white border border-white rounded-lg font-medium hover:bg-white/10 transition-colors"
          >
            Parla con un esperto
          </Link>
        </div>
      </div>
    </section>
  );
}

export default CTASection;
