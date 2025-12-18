import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  CreditCard,
  Banknote,
  Smartphone,
  Coffee,
  Car,
  Heart,
  GraduationCap,
  ShoppingBag,
  Home,
  Zap,
  Film,
  DollarSign,
} from "lucide-react"
import CurrencyTab from "./currency-tab"
import type { Transaction, Category, Account, Budget, RecurringExpense, NewTransactionForm } from "./currency-tab"

function CurrencyPage() {
  // Sample data
  const [accounts] = useState<Account[]>([
    { id: "1", name: "Efectivo", type: "cash", balance: 5420.5, currency: "USD", icon: Banknote },
    { id: "2", name: "Banco Principal", type: "bank", balance: 12350.75, currency: "USD", icon: Wallet },
    { id: "3", name: "Tarjeta Crédito", type: "credit", balance: -2500.0, currency: "USD", icon: CreditCard },
    { id: "4", name: "PayPal", type: "digital", balance: 850.25, currency: "USD", icon: Smartphone },
  ])

  const [categories] = useState<Category[]>([
    {
      id: "1",
      name: "Comida",
      icon: Coffee,
      color: "bg-emerald-500",
      subcategories: ["Restaurantes", "Supermercado", "Delivery"],
    },
    {
      id: "2",
      name: "Transporte",
      icon: Car,
      color: "bg-blue-500",
      subcategories: ["Uber", "Gasolina", "Mantenimiento"],
    },
    { id: "3", name: "Ocio", icon: Film, color: "bg-purple-500", subcategories: ["Cine", "Streaming", "Eventos"] },
    { id: "4", name: "Salud", icon: Heart, color: "bg-red-500", subcategories: ["Médico", "Farmacia", "Seguro"] },
    {
      id: "5",
      name: "Educación",
      icon: GraduationCap,
      color: "bg-amber-500",
      subcategories: ["Cursos", "Libros", "Material"],
    },
    {
      id: "6",
      name: "Compras",
      icon: ShoppingBag,
      color: "bg-pink-500",
      subcategories: ["Ropa", "Electrónica", "Hogar"],
    },
    {
      id: "7",
      name: "Hogar",
      icon: Home,
      color: "bg-cyan-500",
      subcategories: ["Alquiler", "Servicios", "Mantenimiento"],
    },
    {
      id: "8",
      name: "Servicios",
      icon: Zap,
      color: "bg-yellow-500",
      subcategories: ["Internet", "Teléfono", "Electricidad"],
    },
  ])

  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: "1",
      type: "expense",
      amount: 45.5,
      category: "Comida",
      subcategory: "Restaurantes",
      paymentMethod: "Tarjeta Crédito",
      date: "2025-12-15",
      description: "Almuerzo en café",
      status: "confirmed",
      account: "3",
    },
    {
      id: "2",
      type: "income",
      amount: 3500.0,
      category: "Salario",
      paymentMethod: "Banco Principal",
      date: "2025-12-10",
      description: "Pago mensual",
      status: "confirmed",
      account: "2",
    },
    {
      id: "3",
      type: "expense",
      amount: 15.0,
      category: "Transporte",
      subcategory: "Uber",
      paymentMethod: "Efectivo",
      date: "2025-12-14",
      description: "Viaje al trabajo",
      status: "pending",
      account: "1",
    },
  ])

  const [budgets] = useState<Budget[]>([
    { id: "1", category: "Comida", limit: 500, spent: 320, month: "2025-12" },
    { id: "2", category: "Transporte", limit: 200, spent: 180, month: "2025-12" },
    { id: "3", category: "Ocio", limit: 300, spent: 120, month: "2025-12" },
    { id: "4", category: "Hogar", limit: 1000, spent: 1050, month: "2025-12" },
  ])

  const [recurringExpenses, setRecurringExpenses] = useState<RecurringExpense[]>([
    {
      id: "1",
      name: "Alquiler",
      amount: 800,
      frequency: "monthly",
      nextDate: "2025-12-28",
      category: "Hogar",
      status: "active",
    },
    {
      id: "2",
      name: "Internet",
      amount: 50,
      frequency: "monthly",
      nextDate: "2025-12-20",
      category: "Servicios",
      status: "active",
    },
    {
      id: "3",
      name: "Gimnasio",
      amount: 45,
      frequency: "monthly",
      nextDate: "2025-12-25",
      category: "Salud",
      status: "active",
    },
    {
      id: "4",
      name: "Netflix",
      amount: 15,
      frequency: "monthly",
      nextDate: "2025-12-22",
      category: "Ocio",
      status: "paused",
    },
  ])

  // New transaction form state
  const [newTransaction, setNewTransaction] = useState<NewTransactionForm>({
    type: "expense",
    amount: "",
    category: "",
    subcategory: "",
    paymentMethod: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
    status: "confirmed",
    account: "",
  })

  const getTotalBalance = () => {
    return accounts.reduce((sum, acc) => sum + acc.balance, 0)
  }

  const getMonthlyIncome = () => {
    return transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)
  }

  const getMonthlyExpenses = () => {
    return transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)
  }

  const addTransaction = () => {
    if (newTransaction.amount && newTransaction.category && newTransaction.account) {
      const transaction: Transaction = {
        id: Date.now().toString(),
        type: newTransaction.type as Transaction["type"],
        amount: Number.parseFloat(newTransaction.amount),
        category: newTransaction.category,
        subcategory: newTransaction.subcategory,
        paymentMethod: newTransaction.paymentMethod,
        date: newTransaction.date,
        description: newTransaction.description,
        status: newTransaction.status as Transaction["status"],
        account: newTransaction.account,
      }
      setTransactions([transaction, ...transactions])
      setNewTransaction({
        type: "expense",
        amount: "",
        category: "",
        subcategory: "",
        paymentMethod: "",
        date: new Date().toISOString().split("T")[0],
        description: "",
        status: "confirmed",
        account: "",
      })
    }
  }

  const getBudgetPercentage = (budget: Budget) => {
    return Math.min((budget.spent / budget.limit) * 100, 100)
  }

  const getBudgetStatus = (budget: Budget): "exceeded" | "warning" | "safe" => {
    const percentage = (budget.spent / budget.limit) * 100
    if (percentage >= 100) return "exceeded"
    if (percentage >= 80) return "warning"
    return "safe"
  }

  const toggleRecurringStatus = (id: string) => {
    setRecurringExpenses(
      recurringExpenses.map((expense) =>
        expense.id === id ? { ...expense, status: expense.status === "active" ? "paused" : "active" } : expense,
      ),
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Gestión Financiera</h1>
        <p className="text-muted-foreground mt-1">Control total de tus finanzas personales</p>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Balance Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">
              ${getTotalBalance().toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Todas las cuentas</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos del Mes</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">
              ${getMonthlyIncome().toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Diciembre 2025</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gastos del Mes</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              ${getMonthlyExpenses().toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Diciembre 2025</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Balance Neto</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${(getMonthlyIncome() - getMonthlyExpenses()) >= 0 ? "text-emerald-500" : "text-red-500"}`}
            >
              ${(getMonthlyIncome() - getMonthlyExpenses()).toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Este mes</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <CurrencyTab
        accounts={accounts}
        categories={categories}
        transactions={transactions}
        budgets={budgets}
        recurringExpenses={recurringExpenses}
        newTransaction={newTransaction}
        setNewTransaction={setNewTransaction}
        addTransaction={addTransaction}
        toggleRecurringStatus={toggleRecurringStatus}
        getBudgetPercentage={getBudgetPercentage}
        getBudgetStatus={getBudgetStatus}
      />
    </div>
  )
}

export default CurrencyPage
