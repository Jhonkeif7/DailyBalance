import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Plus, DollarSign, Pencil, Trash2, Search, X, Filter, ChevronLeft, ChevronRight } from "lucide-react"
import { toast } from "sonner"
import type { Transaction, Category, Account } from "./currency-tab"
import { formatNumber, formatDate, todayInput, resolveCategoryIcon } from "./finance-utils"

interface MovimentTabProps {
  accounts: Account[]
  categories: Category[]
  transactions: Transaction[]
  upsertTransaction: (transaction: Transaction) => Promise<void>
  deleteTransaction: (id: string) => Promise<void>
}

interface TransactionForm {
  type: "income" | "expense" | "transfer"
  amount: string
  categoryId: string
  accountId: string
  paymentMethod: "card" | "cash" | "transfer"
  date: string
  description: string
  status: "confirmed" | "pending"
}

const emptyForm: TransactionForm = {
  type: "expense",
  amount: "",
  categoryId: "",
  accountId: "",
  paymentMethod: "card",
  date: todayInput(),
  description: "",
  status: "confirmed",
}

function MovimentTab({
  accounts,
  categories,
  transactions,
  upsertTransaction,
  deleteTransaction,
}: MovimentTabProps) {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Transaction | null>(null)
  const [form, setForm] = useState<TransactionForm>(emptyForm)

  // Filtros
  const [search, setSearch] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterCategory, setFilterCategory] = useState("all")
  const [filterAccount, setFilterAccount] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")

  const hasActiveFilters =
    search.trim() !== "" ||
    filterType !== "all" ||
    filterCategory !== "all" ||
    filterAccount !== "all" ||
    filterStatus !== "all"

  const clearFilters = () => {
    setSearch("")
    setFilterType("all")
    setFilterCategory("all")
    setFilterAccount("all")
    setFilterStatus("all")
  }

  const filteredTransactions = useMemo(() => {
    const q = search.trim().toLowerCase()
    return transactions.filter((t) => {
      if (filterType !== "all" && t.type !== filterType) return false
      if (filterCategory !== "all" && t.categoryId !== filterCategory) return false
      if (filterAccount !== "all" && t.accountId !== filterAccount) return false
      if (filterStatus !== "all" && t.status !== filterStatus) return false
      if (q) {
        const accountName = accounts.find((a) => a.id === t.accountId)?.name ?? ""
        const categoryName = categories.find((c) => c.id === t.categoryId)?.name ?? ""
        return (
          t.description.toLowerCase().includes(q) ||
          categoryName.toLowerCase().includes(q) ||
          accountName.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [transactions, filterType, filterCategory, filterAccount, filterStatus, search, accounts, categories])

  // Paginación (10 por página)
  const PAGE_SIZE = 10
  const [page, setPage] = useState(1)
  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / PAGE_SIZE))

  // Reiniciar a la primera página cuando cambian filtros/datos
  useEffect(() => {
    setPage(1)
  }, [filterType, filterCategory, filterAccount, filterStatus, search])

  // Si el total de páginas se reduce (ej. tras eliminar), no quedar fuera de rango
  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  const paginatedTransactions = useMemo(
    () => filteredTransactions.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filteredTransactions, page]
  )

  const openCreate = () => {
    setEditing(null)
    setForm({ ...emptyForm, date: todayInput() })
    setOpen(true)
  }

  const openEdit = (transaction: Transaction) => {
    setEditing(transaction)
    setForm({
      type: transaction.type,
      amount: String(transaction.amount),
      categoryId: transaction.categoryId ?? "",
      accountId: transaction.accountId,
      paymentMethod: transaction.paymentMethod,
      date: transaction.date,
      description: transaction.description,
      status: transaction.status === "cancelled" ? "pending" : transaction.status,
    })
    setOpen(true)
  }

  const handleSave = async () => {
    if (!form.amount || !form.categoryId || !form.accountId) {
      toast.error("Completa monto, categoría y cuenta")
      return
    }
    const transaction: Transaction = {
      id: editing?.id ?? "",
      type: form.type,
      amount: parseFloat(form.amount),
      categoryId: form.categoryId,
      accountId: form.accountId,
      paymentMethod: form.paymentMethod,
      date: form.date,
      description: form.description,
      status: form.status,
    }
    try {
      await upsertTransaction(transaction)
      toast.success(editing ? "Movimiento actualizado" : "Movimiento agregado")
      setOpen(false)
    } catch (err) {
      console.error(err)
      toast.error("No se pudo guardar el movimiento")
    }
  }

  const handleDelete = async (transaction: Transaction) => {
    try {
      await deleteTransaction(transaction.id)
      toast.success("Movimiento eliminado")
    } catch (err) {
      console.error(err)
      toast.error("No se pudo eliminar el movimiento")
    }
  }

  return (
    <div className="space-y-4">
      {/* Toolbar: buscar + filtros + nuevo */}
      <Card className="border-border/60">
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <Input
                  placeholder="Buscar por descripción, categoría o cuenta…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                  autoComplete="off"
                />
              </div>
              <Button onClick={openCreate} className="shrink-0">
                <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
                Nuevo Movimiento
              </Button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2 sm:hidden">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Filter className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="text-xs font-medium">Filtros</span>
                </div>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 gap-1 text-muted-foreground">
                    <X className="h-4 w-4" aria-hidden="true" />
                    Limpiar
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
                <Filter className="hidden h-4 w-4 shrink-0 text-muted-foreground sm:block" aria-hidden="true" />

                <Select value={filterAccount} onValueChange={setFilterAccount}>
                  <SelectTrigger className="h-8 w-full min-w-0 sm:w-[140px]">
                    <SelectValue placeholder="Cuenta" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Cuentas</SelectItem>
                    {accounts.map((acc) => (
                      <SelectItem key={acc.id} value={acc.id}>
                        {acc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="h-8 w-full min-w-0 sm:w-[150px]">
                    <SelectValue placeholder="Categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Categorías</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="h-8 w-full min-w-0 sm:w-[130px]">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Movimientos</SelectItem>
                    <SelectItem value="income">Ingresos</SelectItem>
                    <SelectItem value="expense">Gastos</SelectItem>
                    <SelectItem value="transfer">Transferencias</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="h-8 w-full min-w-0 sm:w-[130px]">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Estados</SelectItem>
                    <SelectItem value="confirmed">Confirmado</SelectItem>
                    <SelectItem value="pending">Pendiente</SelectItem>
                  </SelectContent>
                </Select>

                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="hidden h-8 gap-1 text-muted-foreground sm:inline-flex"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                    Limpiar
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de movimientos */}
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Movimientos Recientes</CardTitle>
              <CardDescription>Historial de transacciones</CardDescription>
            </div>
            <Badge variant="secondary" className="shrink-0">
              {filteredTransactions.length} de {transactions.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2.5">
            {transactions.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                No hay movimientos registrados. ¡Agrega tu primer movimiento!
              </p>
            ) : filteredTransactions.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                Ningún movimiento coincide con los filtros.
              </p>
            ) : (
              paginatedTransactions.map((transaction) => {
                const account = accounts.find((a) => a.id === transaction.accountId)
                const category = categories.find((c) => c.id === transaction.categoryId)
                const Icon = category ? resolveCategoryIcon(category.icon) : DollarSign
                const categoryName = category?.name ?? "Sin categoría"

                return (
                  <div
                    key={transaction.id}
                    className="group flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-card/30 p-3 transition-colors hover:bg-muted/40"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <div className={`shrink-0 rounded-full p-2.5 ${category?.color || "bg-muted"}`}>
                        <Icon className="h-4 w-4 text-white" aria-hidden="true" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-medium">{categoryName}</p>
                          {transaction.status === "pending" && (
                            <Badge variant="outline" className="shrink-0 text-[10px]">
                              Pendiente
                            </Badge>
                          )}
                        </div>
                        <p className="truncate text-xs text-muted-foreground" title={transaction.description || "Sin descripción"}>
                          {transaction.description || "Sin descripción"}
                        </p>
                        <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                          {formatDate(transaction.date)} • {account?.name ?? "Sin cuenta"}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <div className="text-right">
                        <p
                          className={`text-base font-bold ${transaction.type === "income" ? "text-success" : "text-destructive"}`}
                          style={{ fontVariantNumeric: "tabular-nums" }}
                        >
                          {transaction.type === "income" ? "+" : "-"}${formatNumber(transaction.amount)}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {transaction.type === "income"
                            ? "Ingreso"
                            : transaction.type === "transfer"
                              ? "Transferencia"
                              : "Gasto"}
                        </p>
                      </div>
                      <div className="group-hover-actions flex items-center">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => openEdit(transaction)}
                          aria-label={`Editar ${categoryName}`}
                        >
                          <Pencil className="h-4 w-4" aria-hidden="true" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleDelete(transaction)}
                          className="text-muted-foreground hover:text-destructive"
                          aria-label={`Eliminar ${categoryName}`}
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Paginación: 10 por página */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3">
              <p className="text-xs text-muted-foreground">
                Página {page} de {totalPages}
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  aria-label="Página anterior"
                >
                  <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                  Anterior
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <Button
                    key={p}
                    variant={p === page ? "default" : "outline"}
                    size="icon-sm"
                    onClick={() => setPage(p)}
                    aria-label={`Ir a la página ${p}`}
                    aria-current={p === page ? "page" : undefined}
                  >
                    {p}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  aria-label="Página siguiente"
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Diálogo crear / editar */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Movimiento" : "Nuevo Movimiento"}</DialogTitle>
            <DialogDescription>Registra ingresos, gastos o transferencias.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <Select value={form.type} onValueChange={(value) => setForm({ ...form, type: value as TransactionForm["type"] })}>
                <SelectTrigger id="type" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Ingreso</SelectItem>
                  <SelectItem value="expense">Gasto</SelectItem>
                  <SelectItem value="transfer">Transferencia</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Monto</Label>
              <Input
                id="amount"
                type="number"
                inputMode="decimal"
                placeholder="0.00"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                autoComplete="off"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Fecha</Label>
              <Input
                id="date"
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <Select value={form.status} onValueChange={(value) => setForm({ ...form, status: value as TransactionForm["status"] })}>
                <SelectTrigger id="status" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="confirmed">Confirmado</SelectItem>
                  <SelectItem value="pending">Pendiente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoría</Label>
              <Select value={form.categoryId} onValueChange={(value) => setForm({ ...form, categoryId: value })}>
                <SelectTrigger id="category" className="w-full">
                  <SelectValue placeholder="Seleccionar…" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="account">Cuenta</Label>
              <Select value={form.accountId} onValueChange={(value) => setForm({ ...form, accountId: value })}>
                <SelectTrigger id="account" className="w-full">
                  <SelectValue placeholder="Seleccionar…" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((acc) => (
                    <SelectItem key={acc.id} value={acc.id}>
                      {acc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Método de pago</Label>
              <Select value={form.paymentMethod} onValueChange={(value) => setForm({ ...form, paymentMethod: value as TransactionForm["paymentMethod"] })}>
                <SelectTrigger id="paymentMethod" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="card">Tarjeta</SelectItem>
                  <SelectItem value="cash">Efectivo</SelectItem>
                  <SelectItem value="transfer">Transferencia</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="description">Descripción / Notas</Label>
              <Textarea
                id="description"
                placeholder="Agregar detalles…"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                autoComplete="off"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              {editing ? "Guardar cambios" : "Agregar Movimiento"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default MovimentTab
