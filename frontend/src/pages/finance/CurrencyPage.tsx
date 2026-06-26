import { useMemo, useState } from "react"
import { PageContainer } from "@/components/ui/PageContainer"
import {
    CreditCard,
    Smartphone,
    ShoppingCart,
    Car,
    Utensils,
    Home,
    Heart,
    Gamepad2,
    Zap,
    Wallet,
} from "lucide-react"
import CurrencyTab from "./currency-tab"
import type { Transaction, Category, Account, Budget } from "./currency-tab"

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

function CurrencyPage() {
    const [accounts, setAccounts] = useState<Account[]>(initialAccounts)
    const [categories, setCategories] = useState<Category[]>(initialCategories)
    const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions)
    const [budgets, setBudgets] = useState<Budget[]>(initialBudgets)

    // ===== Transactions CRUD =====
    const upsertTransaction = (tx: Transaction) =>
        setTransactions((prev) =>
            prev.some((t) => t.id === tx.id)
                ? prev.map((t) => (t.id === tx.id ? tx : t))
                : [tx, ...prev]
        )
    const deleteTransaction = (id: string) =>
        setTransactions((prev) => prev.filter((t) => t.id !== id))

    // ===== Accounts CRUD =====
    const upsertAccount = (account: Account) =>
        setAccounts((prev) =>
            prev.some((a) => a.id === account.id)
                ? prev.map((a) => (a.id === account.id ? account : a))
                : [...prev, account]
        )
    const deleteAccount = (id: string) =>
        setAccounts((prev) => prev.filter((a) => a.id !== id))

    // ===== Budgets CRUD =====
    const upsertBudget = (budget: Budget) =>
        setBudgets((prev) =>
            prev.some((b) => b.id === budget.id)
                ? prev.map((b) => (b.id === budget.id ? budget : b))
                : [...prev, budget]
        )
    const deleteBudget = (id: string) =>
        setBudgets((prev) => prev.filter((b) => b.id !== id))

    // ===== Categories CRUD =====
    const upsertCategory = (category: Category) =>
        setCategories((prev) =>
            prev.some((c) => c.id === category.id)
                ? prev.map((c) => (c.id === category.id ? category : c))
                : [...prev, category]
        )
    const deleteCategory = (id: string) =>
        setCategories((prev) => prev.filter((c) => c.id !== id))

    // ===== Totals =====
    const totals = useMemo(() => {
        const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0)
        const monthlyIncome = transactions
            .filter((t) => t.type === "income")
            .reduce((sum, t) => sum + t.amount, 0)
        const monthlyExpenses = transactions
            .filter((t) => t.type === "expense")
            .reduce((sum, t) => sum + t.amount, 0)
        return {
            totalBalance,
            monthlyIncome,
            monthlyExpenses,
            monthlySavings: monthlyIncome - monthlyExpenses,
        }
    }, [accounts, transactions])

    // ===== Budget helpers =====
    const getBudgetPercentage = (budget: Budget) =>
        Math.min((budget.spent / budget.limit) * 100, 100)

    const getBudgetStatus = (budget: Budget): "exceeded" | "warning" | "safe" => {
        const percentage = (budget.spent / budget.limit) * 100
        if (percentage >= 100) return "exceeded"
        if (percentage >= 80) return "warning"
        return "safe"
    }

    return (
        <PageContainer>
            <CurrencyTab
                accounts={accounts}
                categories={categories}
                transactions={transactions}
                budgets={budgets}
                totals={totals}
                upsertTransaction={upsertTransaction}
                deleteTransaction={deleteTransaction}
                upsertAccount={upsertAccount}
                deleteAccount={deleteAccount}
                upsertBudget={upsertBudget}
                deleteBudget={deleteBudget}
                upsertCategory={upsertCategory}
                deleteCategory={deleteCategory}
                getBudgetPercentage={getBudgetPercentage}
                getBudgetStatus={getBudgetStatus}
            />
        </PageContainer>
    )
}

export default CurrencyPage
