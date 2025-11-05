"use client"

interface FooterProps {
  hasFloatingBar?: boolean
}

export function Footer({ hasFloatingBar = false }: FooterProps) {
  if (hasFloatingBar) {
    // When there's a floating bar, show footer on the right side
    return (
      <div className="fixed bottom-4 right-4 z-30">
        <div className="bg-card border border-border px-3 py-2 shadow-sm">
          <span className="text-xs text-muted-foreground">Reclaim v0.1.0</span>
        </div>
      </div>
    )
  }

  // Normal footer when no floating bar
  return (
    <footer className="border-t border-border bg-card mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-center text-sm text-muted-foreground">
          <span>Reclaim v0.1.0</span>
        </div>
      </div>
    </footer>
  )
}