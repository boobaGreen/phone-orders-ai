// client/src/pages/NotFound.tsx
const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <h1 className="text-4xl font-bold text-[color:var(--color-primary)] mb-4">
        404
      </h1>
      <p className="text-xl mb-8">Pagina non trovata</p>
      <a
        href="/"
        className="px-4 py-2 bg-[color:var(--color-primary)] text-[color:var(--color-primary-foreground)] rounded"
      >
        Torna alla homepage
      </a>
    </div>
  );
};

export default NotFound;
