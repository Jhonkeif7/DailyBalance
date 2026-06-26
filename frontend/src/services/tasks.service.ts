import { supabase } from "@/lib/supabase"

/**
 * Servicio de Tareas (sección "Mi Día").
 *
 * Tablas usadas: task_categories, tasks, task_steps.
 *
 * ESQUEMA REAL:
 *  task_categories: id (uuid, pk), user_id (uuid), name (text), color (text),
 *                   created_at (timestamptz)
 *  tasks:           id (uuid, pk), user_id (uuid), category_id (uuid, fk null),
 *                   title (text), description (text), due_date (date | null),
 *                   importance ('normal' | 'medium' | 'high'),
 *                   completed (bool), reminder_type (text | null),
 *                   reminder_at (timestamptz | null), repeat_rule (text | null),
 *                   created_at, updated_at (timestamptz)
 *  task_steps:      id (uuid, pk), task_id (uuid, fk), text (text),
 *                   completed (bool), position (int), created_at
 *
 * Nota: en el frontend el recordatorio se maneja como reminder_type +
 * reminderDate (YYYY-MM-DD) + reminderTime (HH:MM). En la BD se persiste como
 * reminder_type + reminder_at (un único timestamp). Las funciones de abajo
 * convierten entre ambas representaciones.
 *
 * RLS: cada tabla debe filtrar por auth.uid() = user_id. El user_id NO se envía
 * desde el cliente; debe completarse con default auth.uid() o trigger en la BD.
 */

// Combina fecha (YYYY-MM-DD) + hora (HH:MM) locales en un timestamp ISO.
function toReminderAt(date?: string | null, time?: string | null): string | null {
  if (!date) return null
  const d = new Date(`${date}T${time && time.length >= 4 ? time : "00:00"}:00`)
  return isNaN(d.getTime()) ? null : d.toISOString()
}

// Separa un timestamp en fecha (YYYY-MM-DD) y hora (HH:MM) locales.
function fromReminderAt(reminderAt?: string | null): { date?: string; time?: string } {
  if (!reminderAt) return {}
  const d = new Date(reminderAt)
  if (isNaN(d.getTime())) return {}
  const pad = (n: number) => String(n).padStart(2, "0")
  return {
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  }
}

export type Importance = "normal" | "medium" | "high"

// Devuelve el id del usuario autenticado o lanza si no hay sesión.
async function requireUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser()
  if (error) throw error
  const userId = data.user?.id
  if (!userId) throw new Error("No hay sesión activa")
  return userId
}

export interface TaskCategory {
  id: string
  key: string
  name: string
  color: string
  isExpanded: boolean
  position: number
  isSystem: boolean
}

// Genera un slug "key" a partir del nombre de la categoría.
// "Mi Trabajo" -> "mi-trabajo", "Salud Personal" -> "salud-personal"
export const generateCategoryKey = (name: string) =>
  name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

export interface TaskStep {
  id: string
  text: string
  completed: boolean
}

export interface Task {
  id: string
  title: string
  description: string
  dueDate: string
  importance: Importance
  completed: boolean
  categoryId: string | null
  steps: TaskStep[]
  createdAt?: string
  reminder?: string
  reminderDate?: string
  reminderTime?: string
  repeat?: string
}

type CategoryRow = {
  id: string
  key: string | null
  name: string
  color: string | null
  is_expanded: boolean | null
  position: number | null
  is_system: boolean | null
}

type StepRow = {
  id: string
  task_id: string
  text: string
  completed: boolean
  position: number | null
}

type TaskRow = {
  id: string
  category_id: string | null
  title: string
  description: string | null
  due_date: string | null
  importance: Importance | null
  completed: boolean
  reminder_type: string | null
  reminder_at: string | null
  repeat_rule: string | null
  created_at: string | null
  task_steps?: StepRow[]
}

const mapCategory = (r: CategoryRow): TaskCategory => ({
  id: r.id,
  key: r.key ?? "",
  name: r.name,
  color: r.color ?? "bg-blue-500",
  isExpanded: r.is_expanded ?? true,
  position: r.position ?? 0,
  isSystem: r.is_system ?? false,
})

const mapStep = (r: StepRow): TaskStep => ({
  id: r.id,
  text: r.text,
  completed: r.completed,
})

const mapTask = (r: TaskRow): Task => {
  const { date, time } = fromReminderAt(r.reminder_at)
  return {
    id: r.id,
    title: r.title,
    description: r.description ?? "",
    dueDate: r.due_date ?? "",
    importance: r.importance ?? "normal",
    completed: r.completed,
    categoryId: r.category_id,
    steps: (r.task_steps ?? [])
      .slice()
      .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
      .map(mapStep),
    createdAt: r.created_at ?? undefined,
    reminder: r.reminder_type ?? undefined,
    reminderDate: date,
    reminderTime: time,
    repeat: r.repeat_rule ?? undefined,
  }
}

// ----- Categorías -----

const CATEGORY_SELECT = "id, key, name, color, is_expanded, position, is_system"

export async function getCategories(): Promise<TaskCategory[]> {
  const { data, error } = await supabase
    .from("task_categories")
    .select(CATEGORY_SELECT)
    .order("position", { ascending: true })
    .order("created_at", { ascending: true })
  if (error) throw error
  return (data as CategoryRow[]).map(mapCategory)
}

export async function createCategory(input: {
  name: string
  color: string
  position?: number
}): Promise<TaskCategory> {
  const userId = await requireUserId()
  const { data, error } = await supabase
    .from("task_categories")
    .insert({
      user_id: userId,
      key: generateCategoryKey(input.name),
      name: input.name,
      color: input.color || "bg-blue-500",
      is_expanded: true,
      position: input.position ?? 0,
      is_system: false,
    })
    .select(CATEGORY_SELECT)
    .single()
  if (error) throw error
  return mapCategory(data as CategoryRow)
}

export async function updateCategory(
  id: string,
  input: { name?: string; color?: string; isExpanded?: boolean; position?: number }
): Promise<TaskCategory> {
  const patch: Record<string, unknown> = {}
  if (input.name !== undefined) {
    patch.name = input.name
    patch.key = generateCategoryKey(input.name)
  }
  if (input.color !== undefined) patch.color = input.color
  if (input.isExpanded !== undefined) patch.is_expanded = input.isExpanded
  if (input.position !== undefined) patch.position = input.position

  const { data, error } = await supabase
    .from("task_categories")
    .update(patch)
    .eq("id", id)
    .select(CATEGORY_SELECT)
    .single()
  if (error) throw error
  return mapCategory(data as CategoryRow)
}

export async function deleteCategory(id: string): Promise<void> {
  const { error } = await supabase.from("task_categories").delete().eq("id", id)
  if (error) throw error
}

// ----- Tareas -----

const TASK_SELECT =
  "id, category_id, title, description, due_date, importance, completed, reminder_type, reminder_at, repeat_rule, created_at, task_steps(id, task_id, text, completed, position)"

export async function getTasks(): Promise<Task[]> {
  const { data, error } = await supabase
    .from("tasks")
    .select(TASK_SELECT)
    .order("created_at", { ascending: false })
  if (error) throw error
  return (data as TaskRow[]).map(mapTask)
}

export async function createTask(input: {
  title: string
  description?: string
  categoryId?: string | null
  dueDate?: string
  importance?: Importance
  reminder?: string
  reminderDate?: string
  reminderTime?: string
  repeat?: string
}): Promise<Task> {
  const userId = await requireUserId()
  const { data, error } = await supabase
    .from("tasks")
    .insert({
      user_id: userId,
      title: input.title,
      description: input.description ?? "",
      category_id: input.categoryId ?? null,
      due_date: input.dueDate || null,
      importance: input.importance ?? "normal",
      completed: false,
      reminder_type: input.reminder || null,
      reminder_at: toReminderAt(input.reminderDate, input.reminderTime),
      repeat_rule: input.repeat || null,
    })
    .select(TASK_SELECT)
    .single()
  if (error) throw error
  return mapTask(data as TaskRow)
}

export async function updateTask(
  id: string,
  input: Partial<{
    title: string
    description: string
    categoryId: string | null
    dueDate: string
    importance: Importance
    completed: boolean
    reminder: string
    reminderDate: string
    reminderTime: string
    repeat: string
  }>
): Promise<Task> {
  const patch: Record<string, unknown> = {}
  if (input.title !== undefined) patch.title = input.title
  if (input.description !== undefined) patch.description = input.description
  if (input.categoryId !== undefined) patch.category_id = input.categoryId
  if (input.dueDate !== undefined) patch.due_date = input.dueDate || null
  if (input.importance !== undefined) patch.importance = input.importance
  if (input.completed !== undefined) patch.completed = input.completed
  if (input.reminder !== undefined) patch.reminder_type = input.reminder || null
  if (input.reminderDate !== undefined || input.reminderTime !== undefined) {
    patch.reminder_at = toReminderAt(input.reminderDate, input.reminderTime)
  }
  if (input.repeat !== undefined) patch.repeat_rule = input.repeat || null

  const { data, error } = await supabase
    .from("tasks")
    .update(patch)
    .eq("id", id)
    .select(TASK_SELECT)
    .single()
  if (error) throw error
  return mapTask(data as TaskRow)
}

export async function deleteTask(id: string): Promise<void> {
  const { error } = await supabase.from("tasks").delete().eq("id", id)
  if (error) throw error
}

// ----- Pasos (subtareas) -----

export async function addStep(taskId: string, text: string, position = 0): Promise<TaskStep> {
  const userId = await requireUserId()
  const { data, error } = await supabase
    .from("task_steps")
    .insert({ user_id: userId, task_id: taskId, text, completed: false, position })
    .select("id, task_id, text, completed, position")
    .single()
  if (error) throw error
  return mapStep(data as StepRow)
}

export async function updateStep(
  id: string,
  input: { text?: string; completed?: boolean }
): Promise<void> {
  const patch: Record<string, unknown> = {}
  if (input.text !== undefined) patch.text = input.text
  if (input.completed !== undefined) patch.completed = input.completed
  const { error } = await supabase.from("task_steps").update(patch).eq("id", id)
  if (error) throw error
}

export async function deleteStep(id: string): Promise<void> {
  const { error } = await supabase.from("task_steps").delete().eq("id", id)
  if (error) throw error
}
