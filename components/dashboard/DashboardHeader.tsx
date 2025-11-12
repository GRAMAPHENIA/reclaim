/**
 * Componente de encabezado del dashboard
 * Responsabilidad: Mostrar logo y título
 */
export function DashboardHeader() {
  return (
    <header className="border-b border-border bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <div className="flex items-center gap-3 sm:gap-4 mb-1 sm:mb-2">
          <img src="/logo.svg" alt="Reclaim Logo" className="w-8 h-8 sm:w-10 sm:h-10" />
          <h1 className="text-2xl sm:text-3xl font-bold">Reclaim</h1>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Importa y analiza tus datos financieros
        </p>
      </div>
    </header>
  )
}
