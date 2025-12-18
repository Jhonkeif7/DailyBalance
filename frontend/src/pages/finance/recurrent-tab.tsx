import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/badge"
import { DollarSign, Pause, Play } from "lucide-react"
import type { Category, RecurringExpense } from "./currency-tab"

interface RecurrentTabProps {
  categories: Category[]
  recurringExpenses: RecurringExpense[]
  toggleRecurringStatus: (id: string) => void
}

function RecurrentTab({
  categories,
  recurringExpenses,
  toggleRecurringStatus,
}: RecurrentTabProps) {
  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle>Gastos Recurrentes</CardTitle>
        <CardDescription>Pagos automáticos y suscripciones</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recurringExpenses.map((expense) => {
            const category = categories.find((c) => c.name === expense.category)
            const Icon = category?.icon || DollarSign
            const monthlyImpact =
              expense.frequency === "monthly"
                ? expense.amount
                : expense.frequency === "weekly"
                  ? expense.amount * 4
                  : expense.amount / 12

            return (
              <div
                key={expense.id}
                className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-card/30"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full ${category?.color || "bg-muted"}`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{expense.name}</p>
                      {expense.status === "paused" && (
                        <Badge variant="outline" className="text-xs">
                          Pausado
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground capitalize">{expense.frequency}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Próximo pago: {new Date(expense.nextDate).toLocaleDateString("es-ES")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-lg font-bold">
                      ${expense.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-muted-foreground">~${monthlyImpact.toFixed(2)}/mes</p>
                  </div>
                  <Button variant="outline" size="icon" onClick={() => toggleRecurringStatus(expense.id)}>
                    {expense.status === "active" ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-6 p-4 rounded-lg bg-muted/50">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Impacto Mensual Total</p>
            <p className="text-xl font-bold">
              $
              {recurringExpenses
                .filter((e) => e.status === "active")
                .reduce((sum, e) => {
                  const monthly =
                    e.frequency === "monthly"
                      ? e.amount
                      : e.frequency === "weekly"
                        ? e.amount * 4
                        : e.amount / 12
                  return sum + monthly
                }, 0)
                .toFixed(2)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default RecurrentTab
