import { supabase } from "@/lib/supabase"

/**
 * Servicio de Archivos (Supabase Storage + metadata).
 *
 * Bucket de Storage: "user-files"
 * Tablas: file_folders, user_files
 *
 * ESQUEMA (columnas reales relevantes):
 *  file_folders: id (uuid), user_id, name (text), created_at
 *  user_files:   id (uuid), user_id, folder_id (uuid|null), name (text), file_type (text),
 *                size_bytes (int8), storage_bucket (text), storage_path (text),
 *                status (text), progress (int), created_at, uploaded_at
 *
 * RLS + Storage policies: el bucket y la tabla deben permitir solo al dueño
 * (auth.uid()). El user_id se envía explícitamente en los inserts. Las rutas se
 * prefijan con el id de usuario.
 */

const BUCKET = "user-files"

// Devuelve el id del usuario autenticado o lanza si no hay sesión.
async function requireUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser()
  if (error) throw error
  const userId = data.user?.id
  if (!userId) throw new Error("Usuario no autenticado")
  return userId
}

// Genera un slug "key" a partir del nombre de la carpeta.
// "Mis Documentos" -> "mis-documentos", "Facturas 2026" -> "facturas-2026"
const generateFolderKey = (name: string) =>
  name
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

export interface FileFolder {
  id: string
  name: string
}

export interface UserFile {
  id: string
  name: string
  type: string
  size: number
  folderId: string | null
  storagePath: string
  createdAt: string
}

// Alias type:file_type, size:size_bytes para mantener la API del frontend.
const FILE_SELECT =
  "id, name, type:file_type, size:size_bytes, folder_id, storage_path, status, progress, created_at, uploaded_at"

const mapFile = (r: any): UserFile => ({
  id: r.id,
  name: r.name,
  type: r.type ?? "other",
  size: Number(r.size ?? 0),
  folderId: r.folder_id,
  storagePath: r.storage_path,
  createdAt: r.created_at,
})

function detectType(fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? ""
  if (["pdf"].includes(ext)) return "pdf"
  if (["xlsx", "xls", "csv"].includes(ext)) return "spreadsheet"
  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext)) return "image"
  if (["doc", "docx", "txt", "rtf"].includes(ext)) return "document"
  if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) return "archive"
  if (["js", "ts", "py", "java", "cpp", "html", "css", "json"].includes(ext)) return "code"
  if (["mp4", "avi", "mov", "mkv", "webm"].includes(ext)) return "video"
  if (["mp3", "wav", "ogg", "flac"].includes(ext)) return "audio"
  if (["ppt", "pptx"].includes(ext)) return "presentation"
  return "other"
}

// ----- Carpetas -----

const FOLDER_SELECT =
  "id, key, name, color, icon, parent_id, is_system, position, created_at, updated_at"

export async function getFolders(): Promise<FileFolder[]> {
  const { data, error } = await supabase
    .from("file_folders")
    .select(FOLDER_SELECT)
    .order("position", { ascending: true })
    .order("created_at", { ascending: true })
  if (error) throw error
  return (data ?? []).map((r: any) => ({ id: r.id, name: r.name }))
}

export async function createFolder(name: string): Promise<FileFolder> {
  const userId = await requireUserId()
  const key = generateFolderKey(name)

  // file_folders tiene unique(user_id, key): validamos antes de insertar.
  const { data: existing, error: existingError } = await supabase
    .from("file_folders")
    .select("id")
    .eq("user_id", userId)
    .eq("key", key)
    .maybeSingle()
  if (existingError) throw existingError
  if (existing) throw new Error("Ya existe una carpeta con ese nombre.")

  const { data, error } = await supabase
    .from("file_folders")
    .insert({
      user_id: userId,
      key,
      name,
      color: "text-blue-500",
      icon: "folder",
      is_system: false,
      position: 0,
    })
    .select(FOLDER_SELECT)
    .single()
  if (error) {
    // Respaldo por carrera: si la restricción única dispara igual (23505).
    if ((error as any).code === "23505") {
      throw new Error("Ya existe una carpeta con ese nombre.")
    }
    throw error
  }
  return { id: (data as any).id, name: (data as any).name }
}

export async function deleteFolder(id: string): Promise<void> {
  const { error } = await supabase.from("file_folders").delete().eq("id", id)
  if (error) throw error
}

// ----- Archivos -----

export async function getFiles(): Promise<UserFile[]> {
  const { data, error } = await supabase
    .from("user_files")
    .select(FILE_SELECT)
    .order("created_at", { ascending: false })
  if (error) throw error
  return (data ?? []).map(mapFile)
}

/** Sube el archivo real a Storage y guarda la metadata en user_files. */
export async function uploadFile(
  file: File,
  options?: { folderId?: string | null; onProgress?: (pct: number) => void }
): Promise<UserFile> {
  const userId = await requireUserId()

  const safeName = file.name.replace(/[^\w.\-]+/g, "_")
  const storagePath = `${userId}/${crypto.randomUUID()}-${safeName}`

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, file, { cacheControl: "3600", upsert: false })
  if (uploadError) throw uploadError

  options?.onProgress?.(100)

  const { data, error } = await supabase
    .from("user_files")
    .insert({
      user_id: userId,
      name: file.name,
      file_type: detectType(file.name),
      size_bytes: file.size,
      folder_id: options?.folderId ?? null,
      storage_bucket: BUCKET,
      storage_path: storagePath,
      status: "completed",
      progress: 100,
    })
    .select(FILE_SELECT)
    .single()
  if (error) {
    // Si falla la metadata, intenta limpiar el objeto subido para no dejar huérfanos.
    await supabase.storage.from(BUCKET).remove([storagePath])
    throw error
  }
  return mapFile(data)
}

/** URL temporal firmada para descargar/previsualizar. */
export async function getSignedUrl(storagePath: string, expiresInSeconds = 60 * 60): Promise<string> {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(storagePath, expiresInSeconds)
  if (error) throw error
  return data.signedUrl
}

export async function deleteFile(file: Pick<UserFile, "id" | "storagePath">): Promise<void> {
  const { error: storageError } = await supabase.storage.from(BUCKET).remove([file.storagePath])
  if (storageError) throw storageError
  const { error } = await supabase.from("user_files").delete().eq("id", file.id)
  if (error) throw error
}
