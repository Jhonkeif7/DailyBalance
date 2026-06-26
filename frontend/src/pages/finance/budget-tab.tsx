import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DollarSign, Bell, Check, Plus, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"
import type { Category, Budget } from "./currency-tab"
import { formatNumber, newId } from "./finance-utils"

interface BudgetTabProps {
  categories: Category[]
  budgets: Budget[]
  upsertBudget: (budget: Budget) => void
  deleteBudget: (id: string) => void
  getBudgetPercentage: (budget: Budget) => number
  getBudgetStatus: (budget: Budget) => "exceeded" | "warning" | "safe"
}

interface BudgetForm {
  category: string
  limit: string
  spent: string
  month: string
}

const currentMonth = () => new Date().toISOString().slice(0, 7)

const emptyForm: BudgetForm = { category: "", limit: "", spent: "0", month: currentMonth() }

function BudgetTab({
  categories,
  budgets,
  upsertBudget,
  deleteBudget,
  getBudgetPercentage,
  getBudgetStatus,
}: BudgetTabProps) {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Budget | null>(null)
  const [form, setForm] = useState<BudgetForm>(emptyForm)

  const openCreate = () => {
    setEditing(null)
    setForm({ ...emptyForm, month: currentMonth() })
    setOpen(true)
  }

  const openEdit = (budget: Budget) => {
    setEditing(budget)
    setForm({
      category: budget.category,
      limit: String(budget.limit),
      spent: String(budget.spent),
      month: budget.month,
    })
    setOpen(true)
  }

  const handleSave = () => {
    if (!form.category || !form.limit) {
      toast.error("Selecciona una categoría y un límite")
      return
    }
    const budget: Budget = {
      id: editing?.id ?? newId(),
      category: form.category,
      limit: parseFloat(form.limit),
      spent: parseFloat(form.spent || "0"),
      month: form.month,
    }
    upsertBudget(budget)
    toast.success(editing ? "Presupuesto actualizado" : "Presupuesto creado")
    setOpen(false)
  }

  const handleDelete = (budget: Budget) => {
    deleteBudget(budget.id)
    toast.success("Presupuesto eliminado")
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{budgets.length} presupuestos</p>
        <Button onClick={openCreate} size="sm">
          <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
          Nuevo Presupuesto
        </Button>
      </div>

      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle>Presupuestos Mensuales</CardTitle>
          <CardDescription>Control de gastos por categoría</CardDescription>
        </CardHeader>
        <CardContent>
          {budgets.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              No hay presupuestos. Crea tu primer presupuesto.
            </p>
          ) : (
            <div className="space-y-5">
              {budgets.map((budget) => {
                const percentage = getBudgetPercentage(budget)
                const status = getBudgetStatus(budget)
                const category = categories.find((c) => c.name === budget.category)
                const Icon = category?.icon || DollarSign

                return (
                  <div key={budget.id} className="group space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className={`shrink-0 rounded-full p-2 ${category?.color || "bg-muted"}`}>
                          <Icon className="h-4 w-4 text-white" aria-hidden="true" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{budget.category}</p>
                          <p className="text-xs text-muted-foreground" style={{ fontVariantNumeric: "tabular-nums" }}>
                            ${formatNumber(budget.spent)} de ${formatNumber(budget.limit)}
                          </p>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        {status === "exceeded" && (
                          <Badge variant="destructive" className="gap-1">
                            <Bell className="h-3 w-3" aria-hidden="true" />
                            Excedido
                          </Badge>
                        )}
                        {status === "warning" && (
                          <Badge variant="outline" className="gap-1 border-amber-500 text-amber-500">
                            <Bell className="h-3 w-3" aria-hidden="true" />
                            {Math.round(percentage)}%
                          </Badge>
                        )}
                        {status === "safe" && (
                          <Badge variant="outline" className="gap-1 border-success text-success">
                            <Check className="h-3 w-3" aria-hidden="true" />
                            {Math.round(percentage)}%
                          </Badge>
                        )}
                        <div className="flex items-center opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                          <Button variant="ghost" size="icon-sm" onClick={() => openEdit(budget)} aria-label={`Editar presupuesto ${budget.category}`}>
                            <Pencil className="h-4 w-4" aria-hidden="true" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleDelete(budget)}
                            className="text-muted-foreground hover:text-destructive"
                            aria-label={`Eliminar presupuesto ${budget.category}`}
                          >
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <Progress
                      value={percentage}
                      className={`h-2 ${
                        status === "exceeded"
                          ? "[&>div]:bg-destructive"
                          : status === "warning"
                            ? "[&>div]:bg-amber-500"
                            : "[&>div]:bg-success"
                      }`}
                      aria-label={`Presupuesto ${budget.category}: ${Math.round(percentage)}% utilizado`}
                    />
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Diálogo crear / editar */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Presupuesto" : "Nuevo Presupuesto"}</DialogTitle>
            <DialogDescription>Define un límite de gasto por categoría.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="budget-category">Categoría</Label>
              <Select value={form.category} onValueChange={(value) => setForm({ ...form, category: value })}>
                <SelectTrigger id="budget-category" className="w-full">
                  <SelectValue placeholder="Seleccionar…" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.name}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="budget-limit">Límite</Label>
                <Input
                  id="budget-limit"
                  type="number"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={form.limit}
                  onChange={(e) => setForm({ ...form, limit: e.target.value })}
                  autoComplete="off"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="budget-spent">Gastado</Label>
                <Input
                  id="budget-spent"
                  type="number"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={form.spent}
                  onChange={(e) => setForm({ ...form, spent: e.target.value })}
                  autoComplete="off"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget-month">Mes</Label>
              <Input
                id="budget-month"
                type="month"
                value={form.month}
                onChange={(e) => setForm({ ...form, month: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>{editing ? "Guardar cambios" : "Crear Presupuesto"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default BudgetTab
