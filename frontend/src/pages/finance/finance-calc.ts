import { convertCurrency } from "@/services/exchange-rate.service"
import type { Account, Budget, Transaction } from "@/services/finance.service"
import { currentMonth } from "./finance-utils"

export type ExchangeRatesMap = Record<string, number>

export interface CurrencyBreakdown {
  currency: string
  balance: number
  income: number
  expenses: number
  savings: number
}

export interface FinanceTotals {
  baseCurrency: string
  totalBalance: number
  monthlyIncome: number
  monthlyExpenses: number
  monthlySavings: number
  byCurrency: CurrencyBreakdown[]
  hasMultipleCurrencies: boolean
  ratesReady: boolean
}

/** Preferencia de moneda base cuando hay varias. */
export function pickBaseCurrency(accounts: Account[]): string {
  if (accounts.length === 0) return "USD"
  const counts = new Map<string, number>()
  for (const a of accounts) {
    const c = (a.currency || "USD").toUpperCase()
    counts.set(c, (counts.get(c) ?? 0) + 1)
  }
  if (counts.has("DOP")) return "DOP"
  if (counts.has("USD")) return "USD"
  let best = "USD"
  let bestN = 0
  for (const [code, n] of counts) {
    if (n > bestN) {
      best = code
      bestN = n
    }
  }
  return best
}

export function accountCurrency(
  accounts: Account[],
  accountId: string | null | undefined
): string {
  if (!accountId) return "USD"
  return (accounts.find((a) => a.id === accountId)?.currency || "USD").toUpperCase()
}

/**
 * Monto a acreditar en la cuenta destino de una transferencia.
 * El `amount` del movimiento siempre está en la moneda de la cuenta origen.
 */
export function transferDestinationAmount(
  tx: Transaction,
  accounts: Account[],
  rates: ExchangeRatesMap | null
): number {
  const from = accountCurrency(accounts, tx.accountId)
  const to = accountCurrency(accounts, tx.transferAccountId)
  if (from === to) return tx.amount
  if (!rates) return tx.amount
  const converted = convertCurrency(tx.amount, from, to, rates)
  return Number.isFinite(converted) ? converted : tx.amount
}

/** Convierte un monto a la moneda base. Si no hay tasas y difiere, no suma (evita mezclar). */
export function toBaseAmount(
  amount: number,
  fromCurrency: string,
  baseCurrency: string,
  rates: ExchangeRatesMap | null
): number | null {
  const from = (fromCurrency || "USD").toUpperCase()
  const base = (baseCurrency || "USD").toUpperCase()
  if (from === base) return amount
  if (!rates) return null
  const converted = convertCurrency(amount, from, base, rates)
  return Number.isFinite(converted) ? converted : null
}

export function isConfirmed(tx: Transaction): boolean {
  return tx.status === "confirmed"
}

export function inPeriod(tx: Transaction, periodYYYYMM: string): boolean {
  return (tx.date ?? "").slice(0, 7) === periodYYYYMM
}

/** Saldos derivados: initial_balance + movimientos confirmados (transferencias no son gasto). */
export function deriveAccountBalances(
  accounts: Account[],
  transactions: Transaction[],
  rates: ExchangeRatesMap | null = null
): Account[] {
  const net = new Map<string, number>()
  const add = (id: string | null | undefined, delta: number) => {
    if (!id) return
    net.set(id, (net.get(id) ?? 0) + delta)
  }

  for (const t of transactions) {
    if (!isConfirmed(t)) continue
    if (t.type === "income") add(t.accountId, t.amount)
    else if (t.type === "expense") add(t.accountId, -t.amount)
    else if (t.type === "transfer") {
      add(t.accountId, -t.amount)
      if (t.transferAccountId) {
        add(t.transferAccountId, transferDestinationAmount(t, accounts, rates))
      }
    }
  }

  return accounts.map((a) => {
    const base = a.initialBalance ?? a.balance
    return { ...a, balance: base + (net.get(a.id) ?? 0) }
  })
}

export function computeFinanceTotals(
  accountsView: Account[],
  transactions: Transaction[],
  rates: ExchangeRatesMap | null,
  periodYYYYMM: string = currentMonth()
): FinanceTotals {
  const baseCurrency = pickBaseCurrency(accountsView)
  const currencies = new Set(accountsView.map((a) => (a.currency || "USD").toUpperCase()))
  const hasMultipleCurrencies = currencies.size > 1
  const ratesReady = !hasMultipleCurrencies || !!rates

  const byCurrencyMap = new Map<string, CurrencyBreakdown>()
  const ensure = (code: string): CurrencyBreakdown => {
    let row = byCurrencyMap.get(code)
    if (!row) {
      row = { currency: code, balance: 0, income: 0, expenses: 0, savings: 0 }
      byCurrencyMap.set(code, row)
    }
    return row
  }

  for (const a of accountsView) {
    const code = (a.currency || "USD").toUpperCase()
    ensure(code).balance += a.balance
  }

  for (const t of transactions) {
    if (!isConfirmed(t)) continue
    if (!inPeriod(t, periodYYYYMM)) continue
    if (t.type === "transfer") continue

    const code = accountCurrency(accountsView, t.accountId)
    const row = ensure(code)
    if (t.type === "income") row.income += t.amount
    else if (t.type === "expense") row.expenses += t.amount
  }

  for (const row of byCurrencyMap.values()) {
    row.savings = row.income - row.expenses
  }

  const byCurrency = Array.from(byCurrencyMap.values()).sort((a, b) =>
    a.currency.localeCompare(b.currency)
  )

  let totalBalance = 0
  let monthlyIncome = 0
  let monthlyExpenses = 0

  for (const row of byCurrency) {
    const bal = toBaseAmount(row.balance, row.currency, baseCurrency, rates)
    const inc = toBaseAmount(row.income, row.currency, baseCurrency, rates)
    const exp = toBaseAmount(row.expenses, row.currency, baseCurrency, rates)
    if (bal != null) totalBalance += bal
    if (inc != null) monthlyIncome += inc
    if (exp != null) monthlyExpenses += exp
  }

  return {
    baseCurrency,
    totalBalance,
    monthlyIncome,
    monthlyExpenses,
    monthlySavings: monthlyIncome - monthlyExpenses,
    byCurrency,
    hasMultipleCurrencies,
    ratesReady,
  }
}

/** Gasto de presupuesto: solo expenses confirmados de la categoría en el periodo. */
export function computeBudgetSpent(
  budget: Budget,
  transactions: Transaction[],
  accounts: Account[],
  rates: ExchangeRatesMap | null,
  budgetCurrency: string
): number {
  if (!budget.categoryId) return 0
  let spent = 0
  for (const t of transactions) {
    if (!isConfirmed(t)) continue
    if (t.type !== "expense") continue
    if (t.categoryId !== budget.categoryId) continue
    if (!inPeriod(t, budget.period)) continue
    const from = accountCurrency(accounts, t.accountId)
    const converted = toBaseAmount(t.amount, from, budgetCurrency, rates)
    if (converted != null) spent += converted
  }
  return spent
}

export interface MonthlySummaryRow {
  month: string
  income: number
  expenses: number
  balance: number
}

export function buildMonthlyFinanceSummary(
  transactions: Transaction[],
  accounts: Account[],
  rates: ExchangeRatesMap | null,
  baseCurrency: string
): MonthlySummaryRow[] {
  const map = new Map<string, { income: number; expenses: number }>()

  for (const t of transactions) {
    if (!isConfirmed(t)) continue
    if (t.type === "transfer") continue
    const month = (t.date ?? "").slice(0, 7)
    if (!/^\d{4}-\d{2}$/.test(month)) continue
    const row = map.get(month) ?? { income: 0, expenses: 0 }
    const from = accountCurrency(accounts, t.accountId)
    const amt = toBaseAmount(t.amount, from, baseCurrency, rates)
    if (amt == null) continue
    if (t.type === "income") row.income += amt
    else if (t.type === "expense") row.expenses += amt
    map.set(month, row)
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, row]) => ({
      month,
      income: row.income,
      expenses: row.expenses,
      balance: row.income - row.expenses,
    }))
}

export interface ExpenseCategoryRow {
  categoryId: string | null
  categoryName: string
  color: string
  total: number
}

export function buildExpensesByCategory(
  transactions: Transaction[],
  accounts: Account[],
  categoryMeta: Map<string, { name: string; color: string }>,
  rates: ExchangeRatesMap | null,
  baseCurrency: string,
  periodYYYYMM?: string
): ExpenseCategoryRow[] {
  const map = new Map<string, number>()

  for (const t of transactions) {
    if (!isConfirmed(t)) continue
    if (t.type !== "expense") continue
    if (periodYYYYMM && !inPeriod(t, periodYYYYMM)) continue
    const from = accountCurrency(accounts, t.accountId)
    const amt = toBaseAmount(t.amount, from, baseCurrency, rates)
    if (amt == null) continue
    const key = t.categoryId ?? "__none__"
    map.set(key, (map.get(key) ?? 0) + amt)
  }

  return Array.from(map.entries())
    .map(([key, total]) => {
      const id = key === "__none__" ? null : key
      const meta = id ? categoryMeta.get(id) : undefined
      return {
        categoryId: id,
        categoryName: meta?.name ?? "Sin categoría",
        color: meta?.color ?? "#2563EB",
        total,
      }
    })
    .sort((a, b) => b.total - a.total)
}
