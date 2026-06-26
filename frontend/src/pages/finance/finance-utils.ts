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

export const formatCurrency = (amount: number, currency = "USD") =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount)

export const formatNumber = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)

export const formatDate = (date: string) =>
  new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date))

export const todayInput = () => new Date().toISOString().split("T")[0]

export const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Date.now().toString()
