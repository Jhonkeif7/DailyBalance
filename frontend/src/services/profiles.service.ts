import { supabase } from "@/lib/supabase"

export interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  default_currency: string
  timezone: string
  created_at: string
  updated_at: string
}

const SELECT =
  "id, full_name, avatar_url, default_currency, timezone, created_at, updated_at"

const mapProfile = (r: Record<string, unknown>): Profile => ({
  id: r.id as string,
  full_name: (r.full_name as string | null) ?? null,
  avatar_url: (r.avatar_url as string | null) ?? null,
  default_currency: r.default_currency as string,
  timezone: r.timezone as string,
  created_at: r.created_at as string,
  updated_at: r.updated_at as string,
})

export async function getProfiles(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select(SELECT)
    .order("updated_at", { ascending: false })
  if (error) throw error
  return (data ?? []).map(mapProfile)
}

export async function getProfileById(id: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select(SELECT)
    .eq("id", id)
    .maybeSingle()
  if (error) throw error
  return data ? mapProfile(data) : null
}

export async function createProfile(input: {
  id: string
  full_name?: string | null
  avatar_url?: string | null
  default_currency?: string
  timezone?: string
}): Promise<Profile> {
  const { data, error } = await supabase
    .from("profiles")
    .insert({
      id: input.id,
      full_name: input.full_name ?? null,
      avatar_url: input.avatar_url ?? null,
      default_currency: input.default_currency ?? "USD",
      timezone: input.timezone ?? "America/Santo_Domingo",
    })
    .select(SELECT)
    .single()
  if (error) throw error
  return mapProfile(data)
}

export async function updateProfile(
  id: string,
  updates: Partial<
    Pick<Profile, "full_name" | "avatar_url" | "default_currency" | "timezone">
  >
): Promise<Profile> {
  const { data, error } = await supabase
    .from("profiles")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select(SELECT)
    .single()
  if (error) throw error
  return mapProfile(data)
}

export async function deleteProfile(id: string): Promise<void> {
  const { error } = await supabase.from("profiles").delete().eq("id", id)
  if (error) throw error
}
