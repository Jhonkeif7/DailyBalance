import { useState } from "react"
import { Card, CardContent } from "@/components/ui/Card"
import {
    DollarSign,
    TrendingUp,
    TrendingDown,
    PiggyBank,
    Wallet,
    CreditCard,
    Smartphone,
    ShoppingCart,
    Car,
    Utensils,
    Home,
    Heart,
    Gamepad2,
    Zap,
    ArrowUpRight,
    ArrowDownRight,
} from "lucide-react"
import CurrencyTab from "./currency-tab"
import type {
    Transaction,
    Category,
    Account,
    Budget,
    RecurringExpense,
    NewTransactionForm,
} from "./currency-tab"

// Mock Data
const initialCategories: Category[] = [
    { id: "1", name: "Alimentación", icon: Utensils, color: "bg-orange-500", subcategories: ["Supermercado", "Restaurantes", "Delivery"] },
    { id: "2", name: "Transporte", icon: Car, color: "bg-blue-500", subcategories: ["Gasolina", "Uber", "Transporte público"] },
    { id: "3", name: "Hogar", icon: Home, color: "bg-purple-500", subcategories: ["Alquiler", "Servicios", "Mantenimiento"] },
    { id: "4", name: "Salud", icon: Heart, color: "bg-red-500", subcategories: ["Médico", "Farmacia", "Gym"] },
    { id: "5", name: "Ocio", icon: Gamepad2, color: "bg-pink-500", subcategories: ["Netflix", "Spotify", "Juegos"] },
    { id: "6", name: "Servicios", icon: Zap, color: "bg-yellow-500", subcategories: ["Luz", "Agua", "Internet"] },
    { id: "7", name: "Compras", icon: ShoppingCart, color: "bg-emerald-500", subcategories: ["Ropa", "Electrónica", "Otros"] },
]

const initialAccounts: Account[] = [
    { id: "1", name: "Banco Principal", type: "bank", balance: 8450.00, currency: "USD", icon: CreditCard },
    { id: "2", name: "Efectivo", type: "cash", balance: 350.00, currency: "USD", icon: Wallet },
    { id: "3", name: "Tarjeta Crédito", type: "credit", balance: -1250.00, currency: "USD", icon: CreditCard },
    { id: "4", name: "PayPal", type: "digital", balance: 520.00, currency: "USD", icon: Smartphone },
]

const initialTransactions: Transaction[] = [
    { id: "1", type: "income", amount: 3500, category: "Trabajo", paymentMethod: "transfer", date: "2026-01-24", description: "Salario mensual", status: "confirmed", account: "1" },
    { id: "2", type: "expense", amount: 125.50, category: "Alimentación", paymentMethod: "card", date: "2026-01-24", description: "Supermercado semanal", status: "confirmed", account: "3" },
    { id: "3", type: "expense", amount: 15.99, category: "Ocio", paymentMethod: "card", date: "2026-01-23", description: "Netflix mensual", status: "confirmed", account: "1" },
    { id: "4", type: "expense", amount: 45.00, category: "Transporte", paymentMethod: "cash", date: "2026-01-22", description: "Gasolina", status: "confirmed", account: "2" },
    { id: "5", type: "income", amount: 800, category: "Trabajo", paymentMethod: "transfer", date: "2026-01-21", description: "Freelance proyecto web", status: "confirmed", account: "1" },
    { id: "6", type: "expense", amount: 65.00, category: "Alimentación", paymentMethod: "card", date: "2026-01-20", description: "Cena restaurante", status: "pending", account: "3" },
    { id: "7", type: "expense", amount: 85.00, category: "Servicios", paymentMethod: "transfer", date: "2026-01-19", description: "Factura de luz", status: "confirmed", account: "1" },
    { id: "8", type: "expense", amount: 40.00, category: "Salud", paymentMethod: "card", date: "2026-01-18", description: "Gym mensualidad", status: "confirmed", account: "1" },
]

const initialBudgets: Budget[] = [
    { id: "1", category: "Alimentación", limit: 500, spent: 320, month: "2026-01" },
    { id: "2", category: "Transporte", limit: 200, spent: 145, month: "2026-01" },
    { id: "3", category: "Ocio", limit: 150, spent: 89, month: "2026-01" },
    { id: "4", category: "Servicios", limit: 300, spent: 285, month: "2026-01" },
    { id: "5", category: "Salud", limit: 100, spent: 40, month: "2026-01" },
]

const initialRecurringExpenses: RecurringExpense[] = [
    { id: "1", name: "Netflix", amount: 15.99, frequency: "monthly", nextDate: "2026-02-23", category: "Ocio", status: "active" },
    { id: "2", name: "Spotify", amount: 9.99, frequency: "monthly", nextDate: "2026-02-15", category: "Ocio", status: "active" },
    { id: "3", name: "Gym", amount: 40.00, frequency: "monthly", nextDate: "2026-02-18", category: "Salud", status: "active" },
    { id: "4", name: "Internet", amount: 55.00, frequency: "monthly", nextDate: "2026-02-01", category: "Servicios", status: "active" },
    { id: "5", name: "Seguro Auto", amount: 600.00, frequency: "annual", nextDate: "2026-06-15", category: "Transporte", status: "paused" },
]

const initialNewTransaction: NewTransactionForm = {
    type: "expense",
    amount: "",
    category: "",
    subcategory: "",
    paymentMethod: "card",
    date: new Date().toISOString().split("T")[0],
    description: "",
    status: "confirmed",
    account: "",
}

// Utility functions
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount)
}

// Stat Card Component
function StatCard({ title, value, trend, trendValue, icon, colorClass }: {
    title: string
    value: string
    trend?: "up" | "down"
    trendValue?: string
    icon: React.ReactNode
    colorClass: string
}) {
    return (
        <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">{title}</p>
                        <p className="text-xl sm:text-2xl font-bold mt-1 truncate">{value}</p>
                        {trend && trendValue && (
                            <div className={`flex items-center gap-1 mt-1 text-xs ${trend === "up" ? "text-emerald-500" : "text-red-500"}`}>
                                {trend === "up" ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                <span>{trendValue}</span>
                            </div>
                        )}
                    </div>
                    <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl ${colorClass} flex-shrink-0`}>
                        {icon}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

function CurrencyPage() {
    // State
    const [accounts] = useState<Account[]>(initialAccounts)
    const [categories] = useState<Category[]>(initialCategories)
    const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions)
    const [budgets] = useState<Budget[]>(initialBudgets)
    const [recurringExpenses, setRecurringExpenses] = useState<RecurringExpense[]>(initialRecurringExpenses)
    const [newTransaction, setNewTransaction] = useState<NewTransactionForm>(initialNewTransaction)

    // Calculate totals
    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0)
    const monthlyIncome = transactions.filter(t => t.type === "income").reduce((sum, t) => sum + t.amount, 0)
    const monthlyExpenses = transactions.filter(t => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)
    const monthlySavings = monthlyIncome - monthlyExpenses

    // Functions
    const addTransaction = () => {
        if (!newTransaction.amount || !newTransaction.category || !newTransaction.account) return

        const transaction: Transaction = {
            id: Date.now().toString(),
            type: newTransaction.type as "income" | "expense" | "transfer",
            amount: parseFloat(newTransaction.amount),
            category: newTransaction.category,
            subcategory: newTransaction.subcategory,
            paymentMethod: newTransaction.paymentMethod,
            date: newTransaction.date,
            description: newTransaction.description,
            status: newTransaction.status as "confirmed" | "pending",
            account: newTransaction.account,
        }

        setTransactions([transaction, ...transactions])
        setNewTransaction(initialNewTransaction)
    }

    const toggleRecurringStatus = (id: string) => {
        setRecurringExpenses(
            recurringExpenses.map((expense) =>
                expense.id === id
                    ? { ...expense, status: expense.status === "active" ? "paused" : "active" }
                    : expense
            )
        )
    }

    const getBudgetPercentage = (budget: Budget) => {
        return Math.min((budget.spent / budget.limit) * 100, 100)
    }

    const getBudgetStatus = (budget: Budget): "exceeded" | "warning" | "safe" => {
        const percentage = getBudgetPercentage(budget)
        if (percentage >= 100) return "exceeded"
        if (percentage >= 80) return "warning"
        return "safe"
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <StatCard
                    title="Balance Total"
                    value={formatCurrency(totalBalance)}
                    trend="up"
                    trendValue="+8.2%"
                    icon={<DollarSign className="w-5 h-5" />}
                    colorClass="bg-emerald-500/10 text-emerald-500"
                />
                <StatCard
                    title="Ingresos del Mes"
                    value={formatCurrency(monthlyIncome)}
                    trend="up"
                    trendValue="+12.5%"
                    icon={<TrendingUp className="w-5 h-5" />}
                    colorClass="bg-emerald-500/10 text-emerald-500"
                />
                <StatCard
                    title="Gastos del Mes"
                    value={formatCurrency(monthlyExpenses)}
                    trend="down"
                    trendValue="-5.3%"
                    icon={<TrendingDown className="w-5 h-5" />}
                    colorClass="bg-red-500/10 text-red-500"
                />
                <StatCard
                    title="Ahorro del Mes"
                    value={formatCurrency(monthlySavings)}
                    trend="up"
                    trendValue="+18.7%"
                    icon={<PiggyBank className="w-5 h-5" />}
                    colorClass="bg-blue-500/10 text-blue-500"
                />
            </div>

            {/* Currency Tabs */}
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
