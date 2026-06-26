import { supabase } from "@/lib/supabase"

/**
 * Servicio de Notas.
 *
 * Tablas: note_folders, notes.
 *
 * SUPUESTOS DE ESQUEMA (ajusta si difiere):
 *  note_folders: id (uuid), user_id, name (text), color (text), icon (text|null), created_at
 *  notes:        id (uuid), user_id, folder_id (uuid|null), title (text), content (text),
 *                is_pinned (bool), created_at (timestamptz), updated_at (timestamptz)
 *
 * RLS: filtra por auth.uid() = user_id. El user_id se envía explícitamente en
 * los inserts (las tablas no tienen default auth.uid()).
 */

// Devuelve el id del usuario autenticado o lanza si no hay sesión.
async function requireUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser()
  if (error) throw error
  const userId = data.user?.id
  if (!userId) throw new Error("Usuario no autenticado")
  return userId
}

export interface NoteFolder {
  id: string
  name: string
  color: string
  icon?: string
}

export interface Note {
  id: string
  title: string
  content: string
  folderId: string | null
  isPinned: boolean
  createdAt: string
  updatedAt: string
}

const mapFolder = (r: any): NoteFolder => ({
  id: r.id,
  name: r.name,
  color: r.color ?? "text-primary",
  icon: r.icon ?? undefined,
})

const mapNote = (r: any): Note => ({
  id: r.id,
  title: r.title ?? "",
  content: r.content ?? "",
  folderId: r.folder_id,
  isPinned: !!r.is_pinned,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
})

// ----- Carpetas -----

export async function getFolders(): Promise<NoteFolder[]> {
  const { data, error } = await supabase
    .from("note_folders")
    .select("id, name, color, icon")
    .order("created_at", { ascending: true })
  if (error) throw error
  return (data ?? []).map(mapFolder)
}

export async function createFolder(input: { name: string; color?: string }): Promise<NoteFolder> {
  const userId = await requireUserId()
  const { data, error } = await supabase
    .from("note_folders")
    .insert({ user_id: userId, name: input.name, color: input.color ?? "text-primary" })
    .select("id, name, color, icon")
    .single()
  if (error) throw error
  return mapFolder(data)
}

export async function deleteFolder(id: string): Promise<void> {
  const { error } = await supabase.from("note_folders").delete().eq("id", id)
  if (error) throw error
}

// ----- Notas -----

const NOTE_SELECT = "id, folder_id, title, content, is_pinned, created_at, updated_at"

export async function getNotes(): Promise<Note[]> {
  const { data, error } = await supabase
    .from("notes")
    .select(NOTE_SELECT)
    .order("updated_at", { ascending: false })
  if (error) throw error
  return (data ?? []).map(mapNote)
}

export async function searchNotes(query: string): Promise<Note[]> {
  const term = `%${query}%`
  const { data, error } = await supabase
    .from("notes")
    .select(NOTE_SELECT)
    .or(`title.ilike.${term},content.ilike.${term}`)
    .order("updated_at", { ascending: false })
  if (error) throw error
  return (data ?? []).map(mapNote)
}

export async function createNote(input: {
  title?: string
  content?: string
  folderId?: string | null
}): Promise<Note> {
  const userId = await requireUserId()
  const { data, error } = await supabase
    .from("notes")
    .insert({
      user_id: userId,
      folder_id: input.folderId ?? null,
      title: input.title ?? "",
      content: input.content ?? "",
      is_pinned: false,
      is_archived: false,
      is_deleted: false,
      position: 0,
    })
    .select(NOTE_SELECT)
    .single()
  if (error) throw error
  return mapNote(data)
}

export async function updateNote(
  id: string,
  input: Partial<{ title: string; content: string; folderId: string | null; isPinned: boolean }>
): Promise<Note> {
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (input.title !== undefined) patch.title = input.title
  if (input.content !== undefined) patch.content = input.content
  if (input.folderId !== undefined) patch.folder_id = input.folderId
  if (input.isPinned !== undefined) patch.is_pinned = input.isPinned
  const { data, error } = await supabase
    .from("notes")
    .update(patch)
    .eq("id", id)
    .select(NOTE_SELECT)
    .single()
  if (error) throw error
  return mapNote(data)
}

export async function deleteNote(id: string): Promise<void> {
  const { error } = await supabase.from("notes").delete().eq("id", id)
  if (error) throw error
}
