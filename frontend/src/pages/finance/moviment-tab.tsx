import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Plus, DollarSign } from "lucide-react"
import type { Transaction, Category, Account, NewTransactionForm } from "./currency-tab"

interface MovimentTabProps {
  accounts: Account[]
  categories: Category[]
  transactions: Transaction[]
  newTransaction: NewTransactionForm
  setNewTransaction: (transaction: NewTransactionForm) => void
  addTransaction: () => void
}

function MovimentTab({
  accounts,
  categories,
  transactions,
  newTransaction,
  setNewTransaction,
  addTransaction,
}: MovimentTabProps) {
  return (
    <div className="space-y-6">
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Nuevo Movimiento</CardTitle>
          <CardDescription>Registra ingresos, gastos o transferencias</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <Select
                value={newTransaction.type}
                onValueChange={(value) => setNewTransaction({ ...newTransaction, type: value })}
              >
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
                placeholder="0.00"
                value={newTransaction.amount}
                onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Fecha</Label>
              <Input
                id="date"
                type="date"
                value={newTransaction.date}
                onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoría</Label>
              <Select
                value={newTransaction.category}
                onValueChange={(value) => setNewTransaction({ ...newTransaction, category: value })}
              >
                <SelectTrigger id="category" className="w-full">
                  <SelectValue placeholder="Seleccionar..." />
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

            <div className="space-y-2">
              <Label htmlFor="account">Cuenta</Label>
              <Select
                value={newTransaction.account}
                onValueChange={(value) => setNewTransaction({ ...newTransaction, account: value })}
              >
                <SelectTrigger id="account" className="w-full">
                  <SelectValue placeholder="Seleccionar..." />
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
              <Label htmlFor="status">Estado</Label>
              <Select
                value={newTransaction.status}
                onValueChange={(value) => setNewTransaction({ ...newTransaction, status: value })}
              >
                <SelectTrigger id="status" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="confirmed">Confirmado</SelectItem>
                  <SelectItem value="pending">Pendiente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción / Notas</Label>
            <Textarea
              id="description"
              placeholder="Agregar detalles..."
              value={newTransaction.description}
              onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
            />
          </div>

          <Button onClick={addTransaction} className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Agregar Movimiento
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Movimientos Recientes</CardTitle>
          <CardDescription>Historial de transacciones</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions.map((transaction) => {
              const account = accounts.find((a) => a.id === transaction.account)
              const category = categories.find((c) => c.name === transaction.category)
              const Icon = category?.icon || DollarSign

              return (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-card/30"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full ${category?.color || "bg-muted"}`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{transaction.category}</p>
                        {transaction.status === "pending" && (
                          <Badge variant="outline" className="text-xs">
                            Pendiente
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {transaction.description || "Sin descripción"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(transaction.date).toLocaleDateString("es-ES")} • {account?.name}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-lg font-bold ${transaction.type === "income" ? "text-emerald-500" : "text-red-500"}`}
                    >
                      {transaction.type === "income" ? "+" : "-"}$
                      {transaction.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {transaction.type === "income" ? "Ingreso" : "Gasto"}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default MovimentTab
