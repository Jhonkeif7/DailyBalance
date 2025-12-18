import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { DollarSign, Bell, Check } from "lucide-react"
import type { Category, Budget } from "./currency-tab"

interface BudgetTabProps {
  categories: Category[]
  budgets: Budget[]
  getBudgetPercentage: (budget: Budget) => number
  getBudgetStatus: (budget: Budget) => "exceeded" | "warning" | "safe"
}

function BudgetTab({
  categories,
  budgets,
  getBudgetPercentage,
  getBudgetStatus,
}: BudgetTabProps) {
  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle>Presupuestos Mensuales</CardTitle>
        <CardDescription>Control de gastos por categoría</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {budgets.map((budget) => {
            const percentage = getBudgetPercentage(budget)
            const status = getBudgetStatus(budget)
            const category = categories.find((c) => c.name === budget.category)
            const Icon = category?.icon || DollarSign

            return (
              <div key={budget.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${category?.color || "bg-muted"}`}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">{budget.category}</p>
                      <p className="text-sm text-muted-foreground">
                        ${budget.spent.toLocaleString("en-US", { minimumFractionDigits: 2 })} de $
                        {budget.limit.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {status === "exceeded" && (
                      <Badge variant="destructive" className="gap-1">
                        <Bell className="h-3 w-3" />
                        Excedido
                      </Badge>
                    )}
                    {status === "warning" && (
                      <Badge variant="outline" className="gap-1 border-amber-500 text-amber-500">
                        <Bell className="h-3 w-3" />
                        {Math.round(percentage)}%
                      </Badge>
                    )}
                    {status === "safe" && (
                      <Badge variant="outline" className="gap-1 border-emerald-500 text-emerald-500">
                        <Check className="h-3 w-3" />
                        {Math.round(percentage)}%
                      </Badge>
                    )}
                  </div>
                </div>
                <Progress
                  value={percentage}
                  className={`h-2 ${
                    status === "exceeded"
                      ? "[&>div]:bg-destructive"
                      : status === "warning"
                        ? "[&>div]:bg-amber-500"
                        : "[&>div]:bg-emerald-500"
                  }`}
                />
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

export default BudgetTab
