import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StatCard } from "@/components/ui/StatCard"
import { ArrowLeftRight, Wallet, PiggyBank, Tag, DollarSign, TrendingUp, TrendingDown } from "lucide-react"
import MovimentTab from "./moviment-tab"
import AccountTab from "./account-tab"
import BudgetTab from "./budget-tab"
import CategoryTab from "./category-tab"
import { formatCurrency } from "./finance-utils"
import type { FinanceTotals, ExchangeRatesMap } from "./finance-calc"

export type {
  Transaction,
  Category,
  Subcategory,
  Account,
  Budget,
} from "@/services/finance.service"
export type { FinanceTotals } from "./finance-calc"
import type { Account, Category, Transaction, Budget } from "@/services/finance.service"

interface CurrencyTabProps {
  accounts: Account[]
  categories: Category[]
  transactions: Transaction[]
  budgets: Budget[]
  totals: FinanceTotals
  exchangeRates: ExchangeRatesMap | null
  upsertTransaction: (transaction: Transaction) => Promise<void>
  deleteTransaction: (id: string) => Promise<void>
  upsertAccount: (account: Account) => Promise<void>
  deleteAccount: (id: string) => Promise<void>
  upsertBudget: (budget: Budget) => Promise<void>
  deleteBudget: (id: string) => Promise<void>
  upsertCategory: (category: Category) => Promise<void>
  deleteCategory: (id: string) => Promise<void>
  getBudgetPercentage: (budget: Budget) => number
  getBudgetStatus: (budget: Budget) => "exceeded" | "warning" | "safe"
}

const tabItems = [
  { value: "transactions", label: "Movimientos", icon: ArrowLeftRight },
  { value: "accounts", label: "Cuentas", icon: Wallet },
  { value: "budgets", label: "Presupuestos", icon: PiggyBank },
  { value: "categories", label: "Categorías", icon: Tag },
]

function formatKpi(amount: number, totals: FinanceTotals) {
  const value = formatCurrency(amount, totals.baseCurrency)
  if (!totals.hasMultipleCurrencies) return value
  if (!totals.ratesReady) return `${value}*`
  return value
}

function CurrencyTab({
  accounts,
  categories,
  transactions,
  budgets,
  totals,
  exchangeRates,
  upsertTransaction,
  deleteTransaction,
  upsertAccount,
  deleteAccount,
  upsertBudget,
  deleteBudget,
  upsertCategory,
  deleteCategory,
  getBudgetPercentage,
  getBudgetStatus,
}: CurrencyTabProps) {
  const multiNote =
    totals.hasMultipleCurrencies && totals.ratesReady
      ? `Convertido a ${totals.baseCurrency}`
      : totals.hasMultipleCurrencies
        ? "Sin tasa: totales parciales"
        : "Mes actual · confirmados"

  return (
    <Tabs defaultValue="transactions" className="space-y-4">
      <TabsList className="h-auto w-full justify-start gap-1 overflow-x-auto rounded-xl bg-muted/60 p-1">
        {tabItems.map(({ value, label, icon: Icon }) => (
          <TabsTrigger
            key={value}
            value={value}
            className="gap-1.5 rounded-lg px-3 py-1.5 text-sm data-[state=active]:bg-card data-[state=active]:shadow-sm"
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            <span>{label}</span>
          </TabsTrigger>
        ))}
      </TabsList>

      <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
        <StatCard
          compact
          title="Balance Total"
          value={formatKpi(totals.totalBalance, totals)}
          description={multiNote}
          tone="primary"
          icon={<DollarSign className="h-full w-full" />}
        />
        <StatCard
          compact
          title="Ingresos del mes"
          value={formatKpi(totals.monthlyIncome, totals)}
          description={multiNote}
          tone="success"
          icon={<TrendingUp className="h-full w-full" />}
        />
        <StatCard
          compact
          title="Gastos del mes"
          value={formatKpi(totals.monthlyExpenses, totals)}
          description={multiNote}
          tone="destructive"
          icon={<TrendingDown className="h-full w-full" />}
        />
        <StatCard
          compact
          title="Ahorro del mes"
          value={formatKpi(totals.monthlySavings, totals)}
          description={multiNote}
          tone={totals.monthlySavings >= 0 ? "success" : "destructive"}
          icon={<PiggyBank className="h-full w-full" />}
        />
      </div>

      {totals.hasMultipleCurrencies && totals.byCurrency.length > 1 && (
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          {totals.byCurrency.map((row) => (
            <span
              key={row.currency}
              className="rounded-md border border-border/60 bg-muted/40 px-2 py-1"
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {row.currency}: {formatCurrency(row.balance, row.currency)}
              {" · "}
              +{formatCurrency(row.income, row.currency)}
              {" / −"}
              {formatCurrency(row.expenses, row.currency)}
            </span>
          ))}
        </div>
      )}

      <TabsContent value="transactions" className="space-y-4">
        <MovimentTab
          accounts={accounts}
          categories={categories}
          transactions={transactions}
          exchangeRates={exchangeRates}
          upsertTransaction={upsertTransaction}
          deleteTransaction={deleteTransaction}
        />
      </TabsContent>

      <TabsContent value="accounts" className="space-y-4">
        <AccountTab
          accounts={accounts}
          upsertAccount={upsertAccount}
          deleteAccount={deleteAccount}
        />
      </TabsContent>

      <TabsContent value="budgets" className="space-y-4">
        <BudgetTab
          categories={categories}
          budgets={budgets}
          baseCurrency={totals.baseCurrency}
          upsertBudget={upsertBudget}
          deleteBudget={deleteBudget}
          getBudgetPercentage={getBudgetPercentage}
          getBudgetStatus={getBudgetStatus}
        />
      </TabsContent>

      <TabsContent value="categories" className="space-y-4">
        <CategoryTab
          categories={categories}
          upsertCategory={upsertCategory}
          deleteCategory={deleteCategory}
        />
      </TabsContent>
    </Tabs>
  )
}

export default CurrencyTab
