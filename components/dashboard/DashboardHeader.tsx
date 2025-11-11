/**
 * Componente de encabezado del dashboard
 * Responsabilidad: Mostrar logo y título
 */
export function DashboardHeader() {
  return (
    <header className="border-b border-border bg-card">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-2">
          <img src="/logo.svg" alt="Reclaim Logo" className="w-10 h-10" />
          <h1 className="text-3xl font-bold">Reclaim</h1>
        </div>
        <p className="text-muted-foreground">
          Importa y analiza tus datos financieros en tiempo real
        </p>
      </div>
    </header>
  )
}
