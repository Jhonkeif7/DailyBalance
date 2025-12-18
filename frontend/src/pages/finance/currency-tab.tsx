import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { LucideIcon } from "lucide-react"
import MovimentTab from "./moviment-tab"
import AccountTab from "./account-tab"
import BudgetTab from "./budget-tab"
import RecurrentTab from "./recurrent-tab"
import CategoryTab from "./category-tab"

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

export interface RecurringExpense {
  id: string
  name: string
  amount: number
  frequency: "weekly" | "monthly" | "annual"
  nextDate: string
  category: string
  status: "active" | "paused"
}

export interface NewTransactionForm {
  type: string
  amount: string
  category: string
  subcategory: string
  paymentMethod: string
  date: string
  description: string
  status: string
  account: string
}

interface CurrencyTabProps {
  accounts: Account[]
  categories: Category[]
  transactions: Transaction[]
  budgets: Budget[]
  recurringExpenses: RecurringExpense[]
  newTransaction: NewTransactionForm
  setNewTransaction: (transaction: NewTransactionForm) => void
  addTransaction: () => void
  toggleRecurringStatus: (id: string) => void
  getBudgetPercentage: (budget: Budget) => number
  getBudgetStatus: (budget: Budget) => "exceeded" | "warning" | "safe"
}

function CurrencyTab({
  accounts,
  categories,
  transactions,
  budgets,
  recurringExpenses,
  newTransaction,
  setNewTransaction,
  addTransaction,
  toggleRecurringStatus,
  getBudgetPercentage,
  getBudgetStatus,
}: CurrencyTabProps) {
  return (
    <Tabs defaultValue="transactions" className="space-y-6">
      <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 h-auto">
        <TabsTrigger value="transactions">Movimientos</TabsTrigger>
        <TabsTrigger value="accounts">Cuentas</TabsTrigger>
        <TabsTrigger value="budgets">Presupuestos</TabsTrigger>
        <TabsTrigger value="recurring">Recurrentes</TabsTrigger>
        <TabsTrigger value="categories">Categorías</TabsTrigger>
      </TabsList>

      {/* Transactions Tab */}
      <TabsContent value="transactions" className="space-y-6">
        <MovimentTab
          accounts={accounts}
          categories={categories}
          transactions={transactions}
          newTransaction={newTransaction}
          setNewTransaction={setNewTransaction}
          addTransaction={addTransaction}
        />
      </TabsContent>

      {/* Accounts Tab */}
      <TabsContent value="accounts" className="space-y-6">
        <AccountTab accounts={accounts} />
      </TabsContent>

      {/* Budgets Tab */}
      <TabsContent value="budgets" className="space-y-6">
        <BudgetTab
          categories={categories}
          budgets={budgets}
          getBudgetPercentage={getBudgetPercentage}
          getBudgetStatus={getBudgetStatus}
        />
      </TabsContent>

      {/* Recurring Expenses Tab */}
      <TabsContent value="recurring" className="space-y-6">
        <RecurrentTab
          categories={categories}
          recurringExpenses={recurringExpenses}
          toggleRecurringStatus={toggleRecurringStatus}
        />
      </TabsContent>

      {/* Categories Tab */}
      <TabsContent value="categories" className="space-y-6">
        <CategoryTab categories={categories} />
      </TabsContent>
    </Tabs>
  )
}

export default CurrencyTab
