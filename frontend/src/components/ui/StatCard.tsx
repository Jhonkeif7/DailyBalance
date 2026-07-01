import * as React from "react"
import { ArrowDownRight, ArrowUpRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/Card"

type StatTone = "primary" | "success" | "destructive" | "muted"

const toneClasses: Record<StatTone, string> = {
  primary: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  destructive: "bg-destructive/10 text-destructive",
  muted: "bg-muted text-muted-foreground",
}

/**
 * Tarjeta de estadística reutilizable.
 * Usa los tokens semánticos del tema (primary / success / destructive),
 * por lo que se adapta automáticamente al modo diurno y nocturno.
 */
interface StatCardProps {
  title: string
  value: string
  description?: string
  icon: React.ReactNode
  tone?: StatTone
  trend?: "up" | "down"
  trendValue?: string
  /** Versión más densa, con menos padding y tipografía más pequeña. */
  compact?: boolean
  /** Compacto en móvil; tamaño normal desde el breakpoint `xl`. */
  compactOnMobile?: boolean
  className?: string
}

function StatCard({
  title,
  value,
  description,
  icon,
  tone = "primary",
  trend,
  trendValue,
  compact = false,
  compactOnMobile = false,
  className,
}: StatCardProps) {
  const dense = compact || compactOnMobile

  return (
    <Card
      className={cn(
        "bg-card/60 backdrop-blur border-border/60 transition-shadow hover:shadow-md",
        dense && "gap-0 rounded-lg py-0 xl:gap-6 xl:rounded-xl xl:py-6",
        compact && "gap-0 py-0 rounded-lg",
        className
      )}
    >
      <CardContent
        className={cn(
          compactOnMobile && "p-2.5 xl:p-6",
          compact && !compactOnMobile && "p-3 sm:p-3.5",
          !dense && "p-4 sm:p-6"
        )}
      >
        <div className="flex items-center justify-between gap-2 xl:gap-3">
          <div className="min-w-0 flex-1">
            <p
              className={cn(
                "truncate font-medium text-muted-foreground",
                compactOnMobile && "text-[10px] leading-tight xl:text-sm",
                compact && !compactOnMobile && "text-[11px]",
                !dense && "text-xs sm:text-sm"
              )}
            >
              {title}
            </p>
            <p
              className={cn(
                "truncate font-bold text-foreground",
                compactOnMobile && "text-base xl:mt-1 xl:text-2xl",
                compact && !compactOnMobile && "text-lg",
                !dense && "mt-1 text-xl sm:text-2xl"
              )}
            >
              {value}
            </p>
            {(description || (trend && trendValue)) && (
              <p
                className={cn(
                  "flex items-center gap-1 text-muted-foreground",
                  compactOnMobile && "mt-0.5 text-[9px] leading-tight xl:mt-1 xl:text-xs",
                  compact && !compactOnMobile && "mt-0.5 text-[10px]",
                  !dense && "mt-1 text-[10px] sm:text-xs"
                )}
              >
                {trend && trendValue && (
                  <span
                    className={cn(
                      "flex items-center gap-0.5 font-medium",
                      trend === "up" ? "text-success" : "text-destructive"
                    )}
                  >
                    {trend === "up" ? (
                      <ArrowUpRight className="h-3 w-3" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3" />
                    )}
                    {trendValue}
                  </span>
                )}
                {description && <span className="truncate">{description}</span>}
              </p>
            )}
          </div>
          <div
            className={cn(
              "flex-shrink-0 rounded-lg",
              compactOnMobile && "p-1.5 xl:rounded-xl xl:p-3",
              compact && !compactOnMobile && "p-2",
              !dense && "p-2 sm:rounded-xl sm:p-3",
              toneClasses[tone]
            )}
          >
            <div
              className={cn(
                compactOnMobile && "h-3.5 w-3.5 xl:h-5 xl:w-5",
                compact && !compactOnMobile && "h-4 w-4",
                !dense && "h-4 w-4 sm:h-5 sm:w-5"
              )}
            >
              {icon}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export { StatCard }
export type { StatTone }
