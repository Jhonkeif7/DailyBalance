import { supabase } from "@/lib/supabase"

/**
 * Servicio de Finanzas.
 *
 * Tablas: finance_accounts, finance_categories, finance_subcategories,
 *         finance_transactions, finance_budgets.
 * Vista:  v_budget_usage  (el "spent" de presupuestos NO se guarda; se lee aquí).
 *
 * ESQUEMA (columnas reales relevantes):
 *  finance_accounts:      id, user_id, name, type, current_balance, initial_balance,
 *                         currency, icon, color, position, is_active, created_at, updated_at
 *  finance_categories:    id, user_id, name, icon, color, type ('income'|'expense'|'both'), created_at
 *  finance_subcategories: id, user_id, category_id, name, created_at
 *  finance_transactions:  id, user_id, type ('income'|'expense'|'transfer'), amount,
 *                         category_id, subcategory_id, payment_method ('card'|'cash'|'transfer'),
 *                         date (date), description, status ('confirmed'|'pending'|'cancelled'),
 *                         account_id, transfer_account_id, created_at
 *  finance_budgets:       id, user_id, category_id, name, amount, period, created_at
 *  v_budget_usage:        budget_id, spent   (gasto agregado por presupuesto)
 *
 * RLS: filtra por auth.uid() = user_id. El user_id se envía explícitamente en los
 * inserts (las tablas no tienen default auth.uid()).
 */

// Devuelve el id del usuario autenticado o lanza si no hay sesión.
async function requireUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser()
  if (error) throw error
  const userId = data.user?.id
  if (!userId) throw new Error("Usuario no autenticado")
  return userId
}

export type TransactionType = "income" | "expense" | "transfer"
export type PaymentMethod = "card" | "cash" | "transfer"
export type TransactionStatus = "confirmed" | "pending" | "cancelled"
export type CategoryType = "income" | "expense" | "both"

export interface Transaction {
  id: string
  type: TransactionType
  amount: number
  categoryId: string | null
  subcategoryId?: string | null
  paymentMethod: PaymentMethod
  date: string
  description: string
  status: TransactionStatus
  accountId: string
  transferAccountId?: string | null
}

export interface Subcategory {
  id: string
  categoryId: string
  name: string
}

export interface Category {
  id: string
  name: string
  icon: string
  color: string
  type: CategoryType
  subcategories: Subcategory[]
}

export interface Account {
  id: string
  name: string
  type: string
  balance: number
  initialBalance?: number
  currency: string
  icon: string
  color: string
}

export interface Budget {
  id: string
  name: string
  categoryId: string | null
  amount: number
  period: string // mes en formato "YYYY-MM" (la BD lo guarda en la columna month)
  spent: number
  alertPercentage?: number
  isActive?: boolean
}

// ----- Cuentas -----

// Alias balance:current_balance para que la UI siga usando "balance".
const ACCOUNT_SELECT =
  "id, name, type, balance:current_balance, initial_balance, currency, icon, color"

const mapAccount = (r: any): Account => ({
  id: r.id,
  name: r.name,
  type: r.type ?? "bank",
  balance: Number(r.balance ?? 0),
  initialBalance: Number(r.initial_balance ?? 0),
  currency: r.currency ?? "USD",
  icon: r.icon ?? "bank",
  color: r.color ?? "bg-primary",
})

export async function getAccounts(): Promise<Account[]> {
  const { data, error } = await supabase
    .from("finance_accounts")
    .select(ACCOUNT_SELECT)
    .order("position", { ascending: true })
    .order("created_at", { ascending: true })
  if (error) throw error
  return (data ?? []).map(mapAccount)
}

export async function upsertAccount(account: Partial<Account> & { id?: string }): Promise<Account> {
  let data: any
  if (account.id) {
    // Update: solo enviamos los campos provistos; balance -> current_balance.
    const patch: Record<string, unknown> = {}
    if (account.name !== undefined) patch.name = account.name
    if (account.type !== undefined) patch.type = account.type
    if (account.currency !== undefined) patch.currency = account.currency
    if (account.balance !== undefined) patch.current_balance = account.balance
    if (account.initialBalance !== undefined) patch.initial_balance = account.initialBalance
    if (account.icon !== undefined) patch.icon = account.icon || null
    if (account.color !== undefined) patch.color = account.color || null
    const res = await supabase
      .from("finance_accounts")
      .update(patch)
      .eq("id", account.id)
      .select(ACCOUNT_SELECT)
      .single()
    if (res.error) throw res.error
    data = res.data
  } else {
    const userId = await requireUserId()
    const res = await supabase
      .from("finance_accounts")
      .insert({
        user_id: userId,
        name: account.name,
        type: account.type,
        currency: account.currency || "USD",
        initial_balance: account.initialBalance ?? account.balance ?? 0,
        current_balance: account.balance ?? 0,
        icon: account.icon || null,
        color: account.color || null,
        position: 0,
        is_active: true,
      })
      .select(ACCOUNT_SELECT)
      .single()
    if (res.error) throw res.error
    data = res.data
  }
  return mapAccount(data)
}

export async function deleteAccount(id: string): Promise<void> {
  const { error } = await supabase.from("finance_accounts").delete().eq("id", id)
  if (error) throw error
}

// ----- Categorías + Subcategorías -----

export async function getCategories(): Promise<Category[]> {
  const [{ data: cats, error: e1 }, { data: subs, error: e2 }] = await Promise.all([
    supabase
      .from("finance_categories")
      .select("id, name, icon, color, type")
      .order("created_at", { ascending: true }),
    supabase
      .from("finance_subcategories")
      .select("id, category_id, name")
      .order("created_at", { ascending: true }),
  ])
  if (e1) throw e1
  if (e2) throw e2
  const subsByCat = new Map<string, Subcategory[]>()
  for (const s of subs ?? []) {
    const sub: Subcategory = { id: (s as any).id, categoryId: (s as any).category_id, name: (s as any).name }
    const list = subsByCat.get(sub.categoryId) ?? []
    list.push(sub)
    subsByCat.set(sub.categoryId, list)
  }
  return (cats ?? []).map((c: any) => ({
    id: c.id,
    name: c.name,
    icon: c.icon ?? "Tag",
    color: c.color ?? "#2563EB",
    type: (c.type ?? "expense") as CategoryType,
    subcategories: subsByCat.get(c.id) ?? [],
  }))
}

export async function upsertCategory(
  category: Partial<Omit<Category, "subcategories">> & { id?: string }
): Promise<Category> {
  const payload = {
    name: category.name,
    icon: category.icon,
    color: category.color,
    type: category.type,
  }
  const query = category.id
    ? supabase.from("finance_categories").update(payload).eq("id", category.id)
    : supabase.from("finance_categories").insert({ ...payload, user_id: await requireUserId() })
  const { data, error } = await query.select("id, name, icon, color, type").single()
  if (error) throw error
  const c: any = data
  return {
    id: c.id,
    name: c.name,
    icon: c.icon ?? "Tag",
    color: c.color ?? "#2563EB",
    type: (c.type ?? "expense") as CategoryType,
    subcategories: [],
  }
}

export async function deleteCategory(id: string): Promise<void> {
  const { error } = await supabase.from("finance_categories").delete().eq("id", id)
  if (error) throw error
}

export async function addSubcategory(categoryId: string, name: string): Promise<Subcategory> {
  const userId = await requireUserId()
  const { data, error } = await supabase
    .from("finance_subcategories")
    .insert({ user_id: userId, category_id: categoryId, name })
    .select("id, category_id, name")
    .single()
  if (error) throw error
  const s: any = data
  return { id: s.id, categoryId: s.category_id, name: s.name }
}

export async function deleteSubcategory(id: string): Promise<void> {
  const { error } = await supabase.from("finance_subcategories").delete().eq("id", id)
  if (error) throw error
}

// ----- Movimientos -----

// Alias date:transaction_date para que la UI siga usando "date".
const TX_SELECT =
  "id, type, amount, category_id, subcategory_id, payment_method, date:transaction_date, description, status, account_id, transfer_account_id"

const mapTx = (r: any): Transaction => ({
  id: r.id,
  type: r.type,
  amount: Number(r.amount ?? 0),
  categoryId: r.category_id,
  subcategoryId: r.subcategory_id,
  paymentMethod: r.payment_method ?? "card",
  date: r.date,
  description: r.description ?? "",
  status: r.status ?? "confirmed",
  accountId: r.account_id,
  transferAccountId: r.transfer_account_id,
})

export async function getTransactions(): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from("finance_transactions")
    .select(TX_SELECT)
    .order("transaction_date", { ascending: false })
  if (error) throw error
  return (data ?? []).map(mapTx)
}

export async function upsertTransaction(
  tx: Partial<Transaction> & { id?: string }
): Promise<Transaction> {
  const payload = {
    type: tx.type,
    amount: tx.amount,
    category_id: tx.categoryId ?? null,
    subcategory_id: tx.subcategoryId ?? null,
    payment_method: tx.paymentMethod,
    transaction_date: tx.date,
    description: tx.description,
    status: tx.status,
    account_id: tx.accountId,
    transfer_account_id: tx.transferAccountId ?? null,
  }
  const query = tx.id
    ? supabase.from("finance_transactions").update(payload).eq("id", tx.id)
    : supabase.from("finance_transactions").insert({ ...payload, user_id: await requireUserId() })
  const { data, error } = await query.select(TX_SELECT).single()
  if (error) throw error
  return mapTx(data)
}

export async function deleteTransaction(id: string): Promise<void> {
  const { error } = await supabase.from("finance_transactions").delete().eq("id", id)
  if (error) throw error
}

// ----- Presupuestos (spent viene de v_budget_usage) -----

// Normaliza un valor "month" de la BD a "YYYY-MM" para el formulario.
const monthToPeriod = (month: unknown): string => String(month ?? "").slice(0, 7)

// Normaliza el "period" del formulario ("YYYY-MM") a un valor de columna month.
// Si la columna month fuese de tipo date, "YYYY-MM-01" es el primer día del mes.
const periodToMonth = (period?: string): string | null => {
  if (!period) return null
  return /^\d{4}-\d{2}$/.test(period) ? `${period}-01` : period
}

export async function getBudgets(): Promise<Budget[]> {
  const [{ data: budgets, error: e1 }, { data: usage, error: e2 }] = await Promise.all([
    supabase
      .from("finance_budgets")
      .select(
        "id, category_id, amount:amount_limit, month, alert_percentage, is_active, finance_categories ( id, name, color, icon )"
      )
      .order("created_at", { ascending: true }),
    supabase.from("v_budget_usage").select("budget_id, spent"),
  ])
  if (e1) throw e1
  if (e2) throw e2
  const spentByBudget = new Map<string, number>()
  for (const u of usage ?? []) {
    spentByBudget.set((u as any).budget_id, Number((u as any).spent ?? 0))
  }
  return (budgets ?? []).map((b: any) => {
    const cat = Array.isArray(b.finance_categories) ? b.finance_categories[0] : b.finance_categories
    return {
      id: b.id,
      name: cat?.name ?? "Sin categoría",
      categoryId: b.category_id,
      amount: Number(b.amount ?? 0),
      period: monthToPeriod(b.month),
      spent: spentByBudget.get(b.id) ?? 0,
      alertPercentage: b.alert_percentage != null ? Number(b.alert_percentage) : undefined,
      isActive: b.is_active ?? undefined,
    }
  })
}

export async function upsertBudget(
  budget: Partial<Omit<Budget, "spent">> & { id?: string }
): Promise<void> {
  // No se envían name/amount/period (no existen). spent lo calcula v_budget_usage.
  const payload = {
    category_id: budget.categoryId ?? null,
    month: periodToMonth(budget.period),
    amount_limit: budget.amount,
    alert_percentage: budget.alertPercentage ?? 80,
    is_active: budget.isActive ?? true,
  }
  const query = budget.id
    ? supabase.from("finance_budgets").update(payload).eq("id", budget.id)
    : supabase.from("finance_budgets").insert({ ...payload, user_id: await requireUserId() })
  const { error } = await query
  if (error) throw error
}

export async function deleteBudget(id: string): Promise<void> {
  const { error } = await supabase.from("finance_budgets").delete().eq("id", id)
  if (error) throw error
}
