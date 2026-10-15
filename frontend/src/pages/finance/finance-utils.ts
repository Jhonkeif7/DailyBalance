import type { LucideIcon } from "lucide-react"
import {
  Tag,
  Utensils,
  Car,
  Home,
  Heart,
  Gamepad2,
  Zap,
  ShoppingCart,
  Briefcase,
  Plane,
  GraduationCap,
  Gift,
  Landmark,
  Wallet,
  CreditCard,
  Smartphone,
} from "lucide-react"

// Iconos de categoría: se guardan en la BD como string (clave) y se resuelven aquí.
export const categoryIconOptions: { key: string; icon: LucideIcon }[] = [
  { key: "tag", icon: Tag },
  { key: "utensils", icon: Utensils },
  { key: "car", icon: Car },
  { key: "home", icon: Home },
  { key: "heart", icon: Heart },
  { key: "gamepad", icon: Gamepad2 },
  { key: "zap", icon: Zap },
  { key: "cart", icon: ShoppingCart },
  { key: "briefcase", icon: Briefcase },
  { key: "plane", icon: Plane },
  { key: "education", icon: GraduationCap },
  { key: "gift", icon: Gift },
]

export const resolveCategoryIcon = (key?: string | null): LucideIcon =>
  categoryIconOptions.find((o) => o.key === key)?.icon ?? Tag

// Iconos de cuenta: se resuelven por el "type" de la cuenta.
const accountTypeIcons: Record<string, LucideIcon> = {
  bank: Landmark,
  cash: Wallet,
  credit: CreditCard,
  digital: Smartphone,
}

export const resolveAccountIcon = (type?: string | null): LucideIcon =>
  accountTypeIcons[type ?? ""] ?? Landmark

export const formatCurrency = (amount: number, currency = "USD") => {
  const code = (currency || "USD").toUpperCase()
  try {
    return new Intl.NumberFormat("es-DO", {
      style: "currency",
      currency: code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  } catch {
    return `${formatNumber(amount)} ${code}`
  }
}

export const formatNumber = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)

/** Parsea YYYY-MM-DD como fecha local (evita el desfase UTC). */
export const parseLocalDate = (date: string) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(date)
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  return new Date(date)
}

export const formatDate = (date: string) =>
  new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(parseLocalDate(date))

/** Fecha de hoy en zona local, formato YYYY-MM-DD. */
export const todayInput = () => {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** Mes actual en zona local, formato YYYY-MM. */
export const currentMonth = () => todayInput().slice(0, 7)

export const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Date.now().toString()
