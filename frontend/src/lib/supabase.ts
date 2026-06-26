import { createClient } from "@supabase/supabase-js"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  // Falla rápido y claro en desarrollo si faltan las variables de entorno.
  console.error(
    "[supabase] Faltan VITE_SUPABASE_URL y/o VITE_SUPABASE_ANON_KEY. " +
      "Crea un archivo .env.local en /frontend a partir de .env.example."
  )
}

// Cliente único para todo el frontend. Usa SOLO la clave anon/public.
// La seguridad de los datos depende de las políticas RLS configuradas en Supabase.
export const supabase = createClient(supabaseUrl ?? "", supabaseAnonKey ?? "", {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})
