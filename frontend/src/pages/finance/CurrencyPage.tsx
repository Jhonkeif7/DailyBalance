import { useEffect, useMemo, useState } from "react"
import { PageContainer } from "@/components/ui/PageContainer"
import { toast } from "sonner"
import CurrencyTab from "./currency-tab"
import type { Transaction, Category, Account, Budget } from "./currency-tab"
import * as financeService from "@/services/finance.service"
import { getUsdExchangeRates } from "@/services/exchange-rate.service"
import {
  computeBudgetSpent,
  computeFinanceTotals,
  deriveAccountBalances,
  pickBaseCurrency,
  type ExchangeRatesMap,
  type FinanceTotals,
} from "./finance-calc"

function CurrencyPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [rates, setRates] = useState<ExchangeRatesMap | null>(null)
  const [, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const [acc, cats, txs, buds, rateData] = await Promise.all([
          financeService.getAccounts(),
          financeService.getCategories(),
          financeService.getTransactions(),
          financeService.getBudgets(),
          getUsdExchangeRates().catch(() => null),
        ])
        if (!active) return
        setAccounts(acc)
        setCategories(cats)
        setTransactions(txs)
        setBudgets(buds)
        if (rateData) setRates(rateData.rates)
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

  const syncAccountBalances = async (
    nextAccounts: Account[],
    nextTransactions: Transaction[]
  ) => {
    try {
      const derived = deriveAccountBalances(nextAccounts, nextTransactions, rates)
      await Promise.all(
        derived.map((a) =>
          financeService.upsertAccount({ id: a.id, balance: a.balance })
        )
      )
    } catch (err) {
      console.error("No se pudo sincronizar current_balance", err)
    }
  }

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
    const nextTxs = transactions.some((t) => t.id === saved.id)
      ? transactions.map((t) => (t.id === saved.id ? saved : t))
      : [saved, ...transactions]
    setTransactions(nextTxs)
    void reloadBudgets()
    void syncAccountBalances(accounts, nextTxs)
  }

  const deleteTransaction = async (id: string) => {
    await financeService.deleteTransaction(id)
    const nextTxs = transactions.filter((t) => t.id !== id)
    setTransactions(nextTxs)
    void reloadBudgets()
    void syncAccountBalances(accounts, nextTxs)
  }

  /**
   * El formulario edita el saldo inicial. No sobrescribimos current_balance
   * con ese valor en updates (evita desincronizar / doble conteo).
   * Tras guardar, sincronizamos current_balance con el saldo derivado.
   */
  const upsertAccount = async (account: Account) => {
    const isUpdate = Boolean(account.id)
    const saved = await financeService.upsertAccount({
      id: account.id || undefined,
      name: account.name,
      type: account.type,
      currency: account.currency,
      icon: account.icon,
      color: account.color,
      initialBalance: account.balance,
      // Solo al crear: current = initial. En update no tocar current_balance aquí.
      ...(isUpdate ? {} : { balance: account.balance }),
    })

    const nextAccounts = accounts.some((a) => a.id === saved.id)
      ? accounts.map((a) => (a.id === saved.id ? { ...saved, initialBalance: account.balance } : a))
      : [...accounts, { ...saved, initialBalance: account.balance }]

    setAccounts(nextAccounts)
    await syncAccountBalances(nextAccounts, transactions)
  }

  const deleteAccount = async (id: string) => {
    await financeService.deleteAccount(id)
    setAccounts((prev) => prev.filter((a) => a.id !== id))
  }

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

  const accountsView = useMemo(
    () => deriveAccountBalances(accounts, transactions, rates),
    [accounts, transactions, rates]
  )

  const totals: FinanceTotals = useMemo(
    () => computeFinanceTotals(accountsView, transactions, rates),
    [accountsView, transactions, rates]
  )

  const budgetCurrency = pickBaseCurrency(accountsView)

  const budgetsView = useMemo(
    () =>
      budgets.map((b) => ({
        ...b,
        spent: computeBudgetSpent(b, transactions, accountsView, rates, budgetCurrency),
      })),
    [budgets, transactions, accountsView, rates, budgetCurrency]
  )

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
        budgets={budgetsView}
        totals={totals}
        exchangeRates={rates}
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
