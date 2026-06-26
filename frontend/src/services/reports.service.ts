import { supabase } from "@/lib/supabase"

/**
 * Servicio de Reportes (solo lectura, sobre vistas de Supabase).
 *
 * Vistas: v_monthly_finance_summary, v_expenses_by_category, v_budget_usage,
 *         v_daily_productivity, v_weekly_productivity.
 *
 * SUPUESTOS DE COLUMNAS (ajusta según tu definición de vistas):
 *  v_monthly_finance_summary: month (text/date), income (num), expenses (num), balance (num)
 *  v_expenses_by_category:    category_id, category_name, color, total (num)
 *  v_budget_usage:            budget_id, name, amount (num), spent (num)
 *  v_daily_productivity:      day (date), completed (int), total (int)
 *  v_weekly_productivity:     week (text/date), completed (int), total (int)
 */

export interface MonthlyFinanceSummary {
  month: string
  income: number
  expenses: number
  balance: number
}

export interface ExpenseByCategory {
  categoryId: string | null
  categoryName: string
  color: string
  total: number
}

export interface BudgetUsage {
  budgetId: string
  name: string
  amount: number
  spent: number
}

export interface DailyProductivity {
  day: string
  completed: number
  total: number
  pending?: number
  percentage?: number
}

export interface WeeklyProductivity {
  week: string
  completed: number
  total: number
  percentage?: number
}

export async function getMonthlyFinanceSummary(): Promise<MonthlyFinanceSummary[]> {
  const { data, error } = await supabase
    .from("v_monthly_finance_summary")
    .select("month, income:total_income, expenses:total_expense, balance:net_balance")
    .order("month", { ascending: true })
  if (error) throw error
  return (data ?? []).map((r: any) => ({
    month: String(r.month),
    income: Number(r.income ?? 0),
    expenses: Number(r.expenses ?? 0),
    balance: Number(r.balance ?? 0),
  }))
}

export async function getExpensesByCategory(): Promise<ExpenseByCategory[]> {
  const { data, error } = await supabase
    .from("v_expenses_by_category")
    .select("category_id, category_name, color, total:total_amount")
  if (error) throw error
  return (data ?? []).map((r: any) => ({
    categoryId: r.category_id,
    categoryName: r.category_name ?? "Sin categoría",
    color: r.color ?? "#2563EB",
    total: Number(r.total ?? 0),
  }))
}

export async function getBudgetUsage(): Promise<BudgetUsage[]> {
  const { data, error } = await supabase
    .from("v_budget_usage")
    .select("budget_id, name, amount, spent")
  if (error) throw error
  return (data ?? []).map((r: any) => ({
    budgetId: r.budget_id,
    name: r.name ?? "",
    amount: Number(r.amount ?? 0),
    spent: Number(r.spent ?? 0),
  }))
}

export async function getDailyProductivity(): Promise<DailyProductivity[]> {
  const { data, error } = await supabase
    .from("v_daily_productivity")
    .select(
      "day, total:total_tasks, completed:completed_tasks, pending:pending_tasks, percentage:completion_percentage"
    )
    .order("day", { ascending: true })
  if (error) throw error
  return (data ?? []).map((r: any) => ({
    day: String(r.day),
    completed: Number(r.completed ?? 0),
    total: Number(r.total ?? 0),
    pending: Number(r.pending ?? 0),
    percentage: Number(r.percentage ?? 0),
  }))
}

export async function getWeeklyProductivity(): Promise<WeeklyProductivity[]> {
  const { data, error } = await supabase
    .from("v_weekly_productivity")
    .select("week:week_start, total:total_tasks, completed:completed_tasks, percentage:completion_percentage")
    .order("week_start", { ascending: true })
  if (error) throw error
  return (data ?? []).map((r: any) => ({
    week: String(r.week),
    completed: Number(r.completed ?? 0),
    total: Number(r.total ?? 0),
    percentage: Number(r.percentage ?? 0),
  }))
}
