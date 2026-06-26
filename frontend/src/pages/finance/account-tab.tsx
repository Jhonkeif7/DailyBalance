import { useState } from "react"
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Pencil, Trash2, Plus, Landmark, Wallet, CreditCard, Smartphone } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { toast } from "sonner"
import type { Account } from "./currency-tab"
import { newId } from "./finance-utils"

interface AccountTabProps {
  accounts: Account[]
  upsertAccount: (account: Account) => void
  deleteAccount: (id: string) => void
}

type AccountType = Account["type"]

const accountIcons: Record<AccountType, LucideIcon> = {
  bank: Landmark,
  cash: Wallet,
  credit: CreditCard,
  digital: Smartphone,
}

const typeLabels: Record<AccountType, string> = {
  bank: "Banco",
  cash: "Efectivo",
  credit: "Crédito",
  digital: "Digital",
}

interface AccountForm {
  name: string
  type: AccountType
  balance: string
  currency: string
}

const emptyForm: AccountForm = { name: "", type: "bank", balance: "", currency: "USD" }

function AccountTab({ accounts, upsertAccount, deleteAccount }: AccountTabProps) {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Account | null>(null)
  const [form, setForm] = useState<AccountForm>(emptyForm)

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setOpen(true)
  }

  const openEdit = (account: Account) => {
    setEditing(account)
    setForm({
      name: account.name,
      type: account.type,
      balance: String(account.balance),
      currency: account.currency,
    })
    setOpen(true)
  }

  const handleSave = () => {
    if (!form.name.trim() || form.balance === "") {
      toast.error("Completa el nombre y el balance")
      return
    }
    const account: Account = {
      id: editing?.id ?? newId(),
      name: form.name.trim(),
      type: form.type,
      balance: parseFloat(form.balance),
      currency: form.currency.trim() || "USD",
      icon: accountIcons[form.type],
    }
    upsertAccount(account)
    toast.success(editing ? "Cuenta actualizada" : "Cuenta creada")
    setOpen(false)
  }

  const handleDelete = (account: Account) => {
    deleteAccount(account.id)
    toast.success("Cuenta eliminada")
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{accounts.length} cuentas</p>
        <Button onClick={openCreate} size="sm">
          <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
          Nueva Cuenta
        </Button>
      </div>

      {accounts.length === 0 ? (
        <Card className="border-dashed border-border/60">
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No hay cuentas. Crea tu primera cuenta.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => {
            const Icon = account.icon
            return (
              <Card key={account.id} className="group gap-0 border-border/60 py-0">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-primary/10 p-2.5">
                        <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{account.name}</CardTitle>
                        <CardDescription>{typeLabels[account.type]}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                      <Button variant="ghost" size="icon-sm" onClick={() => openEdit(account)} aria-label={`Editar ${account.name}`}>
                        <Pencil className="h-4 w-4" aria-hidden="true" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleDelete(account)}
                        className="text-muted-foreground hover:text-destructive"
                        aria-label={`Eliminar ${account.name}`}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="text-xs text-muted-foreground">Balance actual</p>
                    <p
                      className={`text-2xl font-bold ${account.balance >= 0 ? "text-success" : "text-destructive"}`}
                      style={{ fontVariantNumeric: "tabular-nums" }}
                    >
                      ${Math.abs(account.balance).toLocaleString("en-US", { minimumFractionDigits: 2 })} {account.currency}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Diálogo crear / editar */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Cuenta" : "Nueva Cuenta"}</DialogTitle>
            <DialogDescription>Administra tus cuentas y saldos.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="account-name">Nombre</Label>
              <Input
                id="account-name"
                placeholder="Ej. Banco Principal"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                autoComplete="off"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="account-type">Tipo</Label>
                <Select value={form.type} onValueChange={(value) => setForm({ ...form, type: value as AccountType })}>
                  <SelectTrigger id="account-type" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank">Banco</SelectItem>
                    <SelectItem value="cash">Efectivo</SelectItem>
                    <SelectItem value="credit">Crédito</SelectItem>
                    <SelectItem value="digital">Digital</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="account-currency">Moneda</Label>
                <Input
                  id="account-currency"
                  placeholder="USD"
                  value={form.currency}
                  onChange={(e) => setForm({ ...form, currency: e.target.value.toUpperCase() })}
                  autoComplete="off"
                  maxLength={4}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="account-balance">Balance</Label>
              <Input
                id="account-balance"
                type="number"
                inputMode="decimal"
                placeholder="0.00"
                value={form.balance}
                onChange={(e) => setForm({ ...form, balance: e.target.value })}
                autoComplete="off"
              />
              <p className="text-xs text-muted-foreground">Usa valores negativos para deudas (ej. tarjetas de crédito).</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>{editing ? "Guardar cambios" : "Crear Cuenta"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AccountTab
