/**
 * Componente de filtros del dashboard
 * Responsabilidad: Manejar filtros de fecha y categoría
 */
interface DashboardFiltersProps {
  startDate: string
  endDate: string
  selectedCategory: string
  categories: string[]
  onStartDateChange: (date: string) => void
  onEndDateChange: (date: string) => void
  onCategoryChange: (category: string) => void
}

export function DashboardFilters({
  startDate,
  endDate,
  selectedCategory,
  categories,
  onStartDateChange,
  onEndDateChange,
  onCategoryChange
}: DashboardFiltersProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div>
        <label className="block text-sm font-medium mb-2">Desde</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Hasta</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Categoría</label>
        <select
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md"
        >
          <option value="">Todas las categorías</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>
    </div>
  )
}
