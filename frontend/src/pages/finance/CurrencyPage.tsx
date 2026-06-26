import { useEffect, useMemo, useState } from "react"
import { PageContainer } from "@/components/ui/PageContainer"
import { toast } from "sonner"
import CurrencyTab from "./currency-tab"
import type { Transaction, Category, Account, Budget } from "./currency-tab"
import * as financeService from "@/services/finance.service"

function CurrencyPage() {
    const [accounts, setAccounts] = useState<Account[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [budgets, setBudgets] = useState<Budget[]>([])
    const [, setLoading] = useState(true)

    // Carga inicial desde Supabase.
    useEffect(() => {
        let active = true
        ;(async () => {
            try {
                const [acc, cats, txs, buds] = await Promise.all([
                    financeService.getAccounts(),
                    financeService.getCategories(),
                    financeService.getTransactions(),
                    financeService.getBudgets(),
                ])
                if (!active) return
                setAccounts(acc)
                setCategories(cats)
                setTransactions(txs)
                setBudgets(buds)
            } catch (err) {
                console.error(err)
                toast.error("No se pudieron cargar los datos de finanzas")
            } finally {
                if (active) setLoading(false)
            }
        })()
        return () => {
            active = false
        }
    }, [])

    const reloadBudgets = async () => {
        try {
            setBudgets(await financeService.getBudgets())
        } catch (err) {
            console.error(err)
        }
    }

    // ===== Transactions CRUD =====
    const upsertTransaction = async (tx: Transaction) => {
        const saved = await financeService.upsertTransaction({
            id: tx.id || undefined,
            type: tx.type,
            amount: tx.amount,
            categoryId: tx.categoryId,
            subcategoryId: tx.subcategoryId,
            paymentMethod: tx.paymentMethod,
            date: tx.date,
            description: tx.description,
            status: tx.status,
            accountId: tx.accountId,
            transferAccountId: tx.transferAccountId,
        })
        setTransactions((prev) =>
            prev.some((t) => t.id === saved.id)
                ? prev.map((t) => (t.id === saved.id ? saved : t))
                : [saved, ...prev]
        )
        // El gasto de presupuestos depende de los movimientos.
        void reloadBudgets()
    }
    const deleteTransaction = async (id: string) => {
        await financeService.deleteTransaction(id)
        setTransactions((prev) => prev.filter((t) => t.id !== id))
        void reloadBudgets()
    }

    // ===== Accounts CRUD =====
    // El saldo que el usuario edita es el "saldo inicial" (base). El balance
    // mostrado se deriva sumando los movimientos (ver accountsView).
    const upsertAccount = async (account: Account) => {
        const saved = await financeService.upsertAccount({
            id: account.id || undefined,
            name: account.name,
            type: account.type,
            balance: account.balance,
            initialBalance: account.balance,
            currency: account.currency,
            icon: account.icon,
            color: account.color,
        })
        setAccounts((prev) =>
            prev.some((a) => a.id === saved.id)
                ? prev.map((a) => (a.id === saved.id ? saved : a))
                : [...prev, saved]
        )
    }
    const deleteAccount = async (id: string) => {
        await financeService.deleteAccount(id)
        setAccounts((prev) => prev.filter((a) => a.id !== id))
    }

    // ===== Budgets CRUD ("spent" lo calcula la vista v_budget_usage) =====
    const upsertBudget = async (budget: Budget) => {
        await financeService.upsertBudget({
            id: budget.id || undefined,
            name: budget.name,
            categoryId: budget.categoryId,
            amount: budget.amount,
            period: budget.period,
        })
        await reloadBudgets()
    }
    const deleteBudget = async (id: string) => {
        await financeService.deleteBudget(id)
        setBudgets((prev) => prev.filter((b) => b.id !== id))
    }

    // ===== Categories CRUD (reconcilia subcategorías) =====
    const upsertCategory = async (category: Category) => {
        const saved = await financeService.upsertCategory({
            id: category.id || undefined,
            name: category.name,
            icon: category.icon,
            color: category.color,
            type: category.type,
        })
        const existing = categories.find((c) => c.id === saved.id)?.subcategories ?? []
        const desiredNames = category.subcategories.map((s) => s.name.trim()).filter(Boolean)
        const existingNames = existing.map((s) => s.name)
        const toAdd = desiredNames.filter((n) => !existingNames.includes(n))
        const toDelete = existing.filter((s) => !desiredNames.includes(s.name))
        await Promise.all([
            ...toAdd.map((n) => financeService.addSubcategory(saved.id, n)),
            ...toDelete.map((s) => financeService.deleteSubcategory(s.id)),
        ])
        setCategories(await financeService.getCategories())
    }
    const deleteCategory = async (id: string) => {
        await financeService.deleteCategory(id)
        setCategories((prev) => prev.filter((c) => c.id !== id))
    }

    // ===== Balance derivado por cuenta (saldo inicial + movimientos confirmados) =====
    const accountsView = useMemo<Account[]>(() => {
        const net = new Map<string, number>()
        const add = (id: string | null | undefined, delta: number) => {
            if (!id) return
            net.set(id, (net.get(id) ?? 0) + delta)
        }
        for (const t of transactions) {
            if (t.status !== "confirmed") continue
            if (t.type === "income") add(t.accountId, t.amount)
            else if (t.type === "expense") add(t.accountId, -t.amount)
            else if (t.type === "transfer") {
                add(t.accountId, -t.amount)
                add(t.transferAccountId, t.amount)
            }
        }
        return accounts.map((a) => {
            const base = a.initialBalance ?? a.balance
            return { ...a, balance: base + (net.get(a.id) ?? 0) }
        })
    }, [accounts, transactions])

    // ===== Totals =====
    const totals = useMemo(() => {
        const totalBalance = accountsView.reduce((sum, acc) => sum + acc.balance, 0)
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
    }, [accountsView, transactions])

    // ===== Budget helpers =====
    const getBudgetPercentage = (budget: Budget) =>
        budget.amount > 0 ? Math.min((budget.spent / budget.amount) * 100, 100) : 0

    const getBudgetStatus = (budget: Budget): "exceeded" | "warning" | "safe" => {
        const percentage = budget.amount > 0 ? (budget.spent / budget.amount) * 100 : 0
        if (percentage >= 100) return "exceeded"
        if (percentage >= 80) return "warning"
        return "safe"
    }

    return (
        <PageContainer>
            <CurrencyTab
                accounts={accountsView}
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
