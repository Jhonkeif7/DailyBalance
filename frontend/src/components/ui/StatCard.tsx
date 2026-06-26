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
  className,
}: StatCardProps) {
  return (
    <Card
      className={cn(
        "bg-card/60 backdrop-blur border-border/60 transition-shadow hover:shadow-md",
        compact && "gap-0 py-0 rounded-lg",
        className
      )}
    >
      <CardContent className={cn(compact ? "p-3 sm:p-3.5" : "p-4 sm:p-6")}>
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p
              className={cn(
                "truncate font-medium text-muted-foreground",
                compact ? "text-[11px]" : "text-xs sm:text-sm"
              )}
            >
              {title}
            </p>
            <p
              className={cn(
                "truncate font-bold text-foreground",
                compact ? "text-lg" : "mt-1 text-xl sm:text-2xl"
              )}
            >
              {value}
            </p>
            {(description || (trend && trendValue)) && (
              <p
                className={cn(
                  "flex items-center gap-1 text-muted-foreground",
                  compact ? "mt-0.5 text-[10px]" : "mt-1 text-[10px] sm:text-xs"
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
              compact ? "p-2" : "p-2 sm:rounded-xl sm:p-3",
              toneClasses[tone]
            )}
          >
            <div className={cn(compact ? "h-4 w-4" : "h-4 w-4 sm:h-5 sm:w-5")}>
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
