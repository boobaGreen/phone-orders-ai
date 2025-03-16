import { Link } from "react-router-dom";
import { useState } from "react";
import {
  Phone,
  Mail,
  MapPin,
  Instagram,
  Facebook,
  Twitter,
  X,
} from "lucide-react";

const Footer = () => {
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[color:var(--color-card)] border-t border-[color:var(--color-border)] mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo e info */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center mb-4">
              <span className="text-xl font-bold text-[color:var(--color-primary)]">
                Phone Orders AI
              </span>
            </Link>
            <p className="text-sm text-[color:var(--color-muted-foreground)] mb-4">
              La piattaforma ideale per gestire gli ordini della tua pizzeria
              con intelligenza artificiale.
            </p>
            <div className="flex space-x-3">
              <a
                href="#"
                className="text-[color:var(--color-muted-foreground)] hover:text-[color:var(--color-primary)]"
              >
                <Facebook size={20} />
              </a>
              <a
                href="#"
                className="text-[color:var(--color-muted-foreground)] hover:text-[color:var(--color-primary)]"
              >
                <Instagram size={20} />
              </a>
              <a
                href="#"
                className="text-[color:var(--color-muted-foreground)] hover:text-[color:var(--color-primary)]"
              >
                <Twitter size={20} />
              </a>
            </div>
          </div>

          {/* Collegamenti rapidi */}
          <div>
            <h3 className="font-medium mb-4">Collegamenti rapidi</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/dashboard"
                  className="text-[color:var(--color-muted-foreground)] hover:text-[color:var(--color-primary)]"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  to="/businesses"
                  className="text-[color:var(--color-muted-foreground)] hover:text-[color:var(--color-primary)]"
                >
                  I tuoi ristoranti
                </Link>
              </li>
              <li>
                <Link
                  to="/businesses/new"
                  className="text-[color:var(--color-muted-foreground)] hover:text-[color:var(--color-primary)]"
                >
                  Aggiungi ristorante
                </Link>
              </li>
              <li>
                <Link
                  to="/settings"
                  className="text-[color:var(--color-muted-foreground)] hover:text-[color:var(--color-primary)]"
                >
                  Impostazioni
                </Link>
              </li>
            </ul>
          </div>

          {/* Servizi */}
          <div>
            <h3 className="font-medium mb-4">Servizi</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/pricing"
                  className="text-[color:var(--color-muted-foreground)] hover:text-[color:var(--color-primary)]"
                >
                  Piani e prezzi
                </Link>
              </li>
              <li>
                <Link
                  to="/docs"
                  className="text-[color:var(--color-muted-foreground)] hover:text-[color:var(--color-primary)]"
                >
                  Documentazione
                </Link>
              </li>
              <li>
                <Link
                  to="/support"
                  className="text-[color:var(--color-muted-foreground)] hover:text-[color:var(--color-primary)]"
                >
                  Supporto
                </Link>
              </li>
              <li>
                <Link
                  to="/faq"
                  className="text-[color:var(--color-muted-foreground)] hover:text-[color:var(--color-primary)]"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Contatti */}
          <div>
            <h3 className="font-medium mb-4">Contattaci</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center text-[color:var(--color-muted-foreground)]">
                <Phone size={16} className="mr-2" />
                <span>+39 123 456 7890</span>
              </li>
              <li className="flex items-center text-[color:var(--color-muted-foreground)]">
                <Mail size={16} className="mr-2" />
                <span>info@pizzeriasaas.it</span>
              </li>
              <li className="flex items-start text-[color:var(--color-muted-foreground)]">
                <MapPin size={16} className="mr-2 mt-1" />
                <span>Via Roma 123, 00100 Roma, Italia</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[color:var(--color-border)] mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-[color:var(--color-muted-foreground)] mb-4 md:mb-0">
            &copy; {currentYear} Phone Orders AI. Tutti i diritti riservati.
          </p>
          <div className="flex space-x-4 text-sm">
            <button
              onClick={() => setShowPrivacy(true)}
              className="text-[color:var(--color-muted-foreground)] hover:text-[color:var(--color-primary)]"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => setShowTerms(true)}
              className="text-[color:var(--color-muted-foreground)] hover:text-[color:var(--color-primary)]"
            >
              Termini di Servizio
            </button>
          </div>
        </div>
      </div>

      {/* Modal Privacy Policy */}
      {showPrivacy && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[color:var(--color-card)] rounded-lg shadow-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Privacy Policy</h2>
                <button
                  onClick={() => setShowPrivacy(false)}
                  className="text-[color:var(--color-muted-foreground)] hover:text-[color:var(--color-foreground)]"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="prose prose-sm max-w-none text-[color:var(--color-foreground)]">
                <p>
                  La tua privacy è importante per noi. Questa Privacy Policy
                  spiega come raccogliamo, utilizziamo, divulghiamo,
                  trasmettiamo e conserviamo i tuoi dati. Ti preghiamo di
                  dedicare qualche minuto alla lettura per comprendere le nostre
                  pratiche.
                </p>
                <h3>Raccolta e utilizzo delle informazioni</h3>
                <p>
                  Raccogliamo informazioni per fornire servizi migliori a tutti
                  i nostri utenti. Il tipo di informazioni che raccogliamo
                  dipende dal modo in cui utilizzi i nostri servizi.
                </p>
                <h3>Cookie e tecnologie simili</h3>
                <p>
                  Utilizziamo varie tecnologie per raccogliere e memorizzare
                  informazioni quando visiti i nostri servizi, che potrebbero
                  includere l'uso di cookie o tecnologie simili per identificare
                  il tuo browser o dispositivo.
                </p>
                <h3>Contattaci</h3>
                <p>
                  Se hai domande sulla nostra Privacy Policy, puoi contattarci a
                  privacy@pizzeriasaas.it.
                </p>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowPrivacy(false)}
                  className="px-4 py-2 bg-[color:var(--color-primary)] text-[color:var(--color-primary-foreground)] rounded hover:opacity-90"
                >
                  Chiudi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Terms of Service */}
      {showTerms && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[color:var(--color-card)] rounded-lg shadow-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Termini di Servizio</h2>
                <button
                  onClick={() => setShowTerms(false)}
                  className="text-[color:var(--color-muted-foreground)] hover:text-[color:var(--color-foreground)]"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="prose prose-sm max-w-none text-[color:var(--color-foreground)]">
                <p>
                  Utilizzando i nostri servizi, accetti di essere vincolato dai
                  seguenti termini e condizioni ("Termini di servizio"). Ti
                  preghiamo di leggerli attentamente.
                </p>
                <h3>Utilizzo dei nostri servizi</h3>
                <p>
                  Non utilizzare impropriamente i nostri Servizi. Ad esempio,
                  non interferire con i nostri Servizi o tentare di accedervi
                  utilizzando un metodo diverso dall'interfaccia e dalle
                  istruzioni che forniamo.
                </p>
                <h3>La tua responsabilità</h3>
                <p>
                  L'utilizzo dei nostri servizi non ti conferisce la proprietà
                  intellettuale sui nostri servizi o sui contenuti a cui accedi.
                  Non puoi utilizzare i contenuti dei nostri servizi a meno che
                  non ottenga l'autorizzazione dal proprietario.
                </p>
                <h3>Risoluzione</h3>
                <p>
                  Ci riserviamo il diritto di sospendere o terminare il tuo
                  accesso ai nostri servizi se violi i nostri Termini di
                  servizio.
                </p>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowTerms(false)}
                  className="px-4 py-2 bg-[color:var(--color-primary)] text-[color:var(--color-primary-foreground)] rounded hover:opacity-90"
                >
                  Chiudi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};

export default Footer;
