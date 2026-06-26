import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Contenedor de página reutilizable para todas las vistas.
 * Centraliza el ancho máximo, el espaciado vertical y un encabezado opcional,
 * de modo que todas las pantallas compartan la misma estructura y estética.
 */
interface PageContainerProps extends React.ComponentProps<"div"> {
  title?: string
  description?: string
  actions?: React.ReactNode
}

function PageContainer({
  title,
  description,
  actions,
  className,
  children,
  ...props
}: PageContainerProps) {
  return (
    <div
      data-slot="page-container"
      className={cn(
        "mx-auto w-full max-w-7xl space-y-4 sm:space-y-6",
        className
      )}
      {...props}
    >
      {(title || actions) && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {(title || description) && (
            <div className="space-y-1">
              {title && (
                <h2 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                  {title}
                </h2>
              )}
              {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
              )}
            </div>
          )}
          {actions && (
            <div className="flex items-center gap-2">{actions}</div>
          )}
        </div>
      )}
      {children}
    </div>
  )
}

export { PageContainer }
