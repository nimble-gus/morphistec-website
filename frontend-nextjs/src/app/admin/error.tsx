"use client";
export default function Error({ reset }: { reset: () => void }) {
  return (
    <main className="crm-unavailable">
      <h1>No pudimos abrir el CRM</h1>
      <p>
        Comprueba la conexión de la base de datos y que las migraciones estén
        aplicadas.
      </p>
      <button onClick={reset}>Volver a intentar</button>
    </main>
  );
}
