import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StatCard } from "@/components/ui/StatCard"
import { ArrowLeftRight, Wallet, PiggyBank, Tag, DollarSign, TrendingUp, TrendingDown } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import MovimentTab from "./moviment-tab"
import AccountTab from "./account-tab"
import BudgetTab from "./budget-tab"
import CategoryTab from "./category-tab"
import { formatCurrency } from "./finance-utils"

// Types
export interface Transaction {
  id: string
  type: "income" | "expense" | "transfer"
  amount: number
  category: string
  subcategory?: string
  paymentMethod: string
  date: string
  description: string
  status: "confirmed" | "pending"
  account: string
}

export interface Category {
  id: string
  name: string
  icon: LucideIcon
  color: string
  subcategories: string[]
}

export interface Account {
  id: string
  name: string
  type: "cash" | "bank" | "credit" | "digital"
  balance: number
  currency: string
  icon: LucideIcon
}

export interface Budget {
  id: string
  category: string
  limit: number
  spent: number
  month: string
}

export interface FinanceTotals {
  totalBalance: number
  monthlyIncome: number
  monthlyExpenses: number
  monthlySavings: number
}

interface CurrencyTabProps {
  accounts: Account[]
  categories: Category[]
  transactions: Transaction[]
  budgets: Budget[]
  totals: FinanceTotals
  upsertTransaction: (transaction: Transaction) => void
  deleteTransaction: (id: string) => void
  upsertAccount: (account: Account) => void
  deleteAccount: (id: string) => void
  upsertBudget: (budget: Budget) => void
  deleteBudget: (id: string) => void
  upsertCategory: (category: Category) => void
  deleteCategory: (id: string) => void
  getBudgetPercentage: (budget: Budget) => number
  getBudgetStatus: (budget: Budget) => "exceeded" | "warning" | "safe"
}

const tabItems = [
  { value: "transactions", label: "Movimientos", icon: ArrowLeftRight },
  { value: "accounts", label: "Cuentas", icon: Wallet },
  { value: "budgets", label: "Presupuestos", icon: PiggyBank },
  { value: "categories", label: "Categorías", icon: Tag },
]

function CurrencyTab({
  accounts,
  categories,
  transactions,
  budgets,
  totals,
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
  return (
    <Tabs defaultValue="transactions" className="space-y-4">
      {/* Tabs en la parte superior */}
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

      {/* KPIs compactos persistentes */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
        <StatCard
          compact
          title="Balance Total"
          value={formatCurrency(totals.totalBalance)}
          tone="primary"
          icon={<DollarSign className="h-full w-full" />}
        />
        <StatCard
          compact
          title="Ingresos"
          value={formatCurrency(totals.monthlyIncome)}
          tone="success"
          icon={<TrendingUp className="h-full w-full" />}
        />
        <StatCard
          compact
          title="Gastos"
          value={formatCurrency(totals.monthlyExpenses)}
          tone="destructive"
          icon={<TrendingDown className="h-full w-full" />}
        />
        <StatCard
          compact
          title="Ahorro"
          value={formatCurrency(totals.monthlySavings)}
          tone={totals.monthlySavings >= 0 ? "success" : "destructive"}
          icon={<PiggyBank className="h-full w-full" />}
        />
      </div>

      {/* Movimientos */}
      <TabsContent value="transactions" className="space-y-4">
        <MovimentTab
          accounts={accounts}
          categories={categories}
          transactions={transactions}
          upsertTransaction={upsertTransaction}
          deleteTransaction={deleteTransaction}
        />
      </TabsContent>

      {/* Cuentas */}
      <TabsContent value="accounts" className="space-y-4">
        <AccountTab
          accounts={accounts}
          upsertAccount={upsertAccount}
          deleteAccount={deleteAccount}
        />
      </TabsContent>

      {/* Presupuestos */}
      <TabsContent value="budgets" className="space-y-4">
        <BudgetTab
          categories={categories}
          budgets={budgets}
          upsertBudget={upsertBudget}
          deleteBudget={deleteBudget}
          getBudgetPercentage={getBudgetPercentage}
          getBudgetStatus={getBudgetStatus}
        />
      </TabsContent>

      {/* Categorías */}
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
