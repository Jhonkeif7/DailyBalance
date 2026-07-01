import { useCallback, useEffect, useMemo, useState } from "react"
import {
  Save,
  X,
  Loader2,
  AlertCircle,
  Copy,
  Check,
  Globe,
  DollarSign,
  Clock,
} from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth"
import { PageContainer } from "@/components/ui/PageContainer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import * as profilesService from "@/services/profiles.service"
import type { Profile } from "@/services/profiles.service"

const CURRENCY_OPTIONS = ["USD", "DOP", "EUR"] as const

const TIMEZONE_OPTIONS = [
  "America/Santo_Domingo",
  "America/New_York",
  "Europe/Madrid",
  "UTC",
] as const

interface ProfileForm {
  full_name: string
  avatar_url: string
  default_currency: string
  timezone: string
}

const emptyForm: ProfileForm = {
  full_name: "",
  avatar_url: "",
  default_currency: "USD",
  timezone: "America/Santo_Domingo",
}

function abbreviateId(id: string): string {
  if (id.length <= 12) return id
  return `${id.slice(0, 4)}...${id.slice(-4)}`
}

function getInitials(name: string | null, email?: string | null): string {
  if (name?.trim()) {
    const parts = name.trim().split(/\s+/).filter(Boolean)
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  if (email) return email.charAt(0).toUpperCase()
  return "?"
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function profileToForm(profile: Profile): ProfileForm {
  return {
    full_name: profile.full_name ?? "",
    avatar_url: profile.avatar_url ?? "",
    default_currency: profile.default_currency,
    timezone: profile.timezone,
  }
}

function isLikelyImageUrl(url: string): boolean {
  const trimmed = url.trim()
  if (!trimmed) return false
  try {
    const parsed = new URL(trimmed)
    return parsed.protocol === "http:" || parsed.protocol === "https:"
  } catch {
    return false
  }
}

function ProfileAvatar({
  name,
  email,
  avatarUrl,
  size = "lg",
  className,
}: {
  name: string | null
  email?: string | null
  avatarUrl?: string | null
  size?: "md" | "lg" | "xl"
  className?: string
}) {
  const [imgError, setImgError] = useState(false)
  const sizeClass = {
    md: "h-12 w-12 text-base",
    lg: "h-20 w-20 text-2xl",
    xl: "h-28 w-28 text-3xl",
  }[size]

  const showImage = isLikelyImageUrl(avatarUrl ?? "") && !imgError

  useEffect(() => {
    setImgError(false)
  }, [avatarUrl])

  if (showImage) {
    return (
      <img
        src={avatarUrl!.trim()}
        alt=""
        onError={() => setImgError(true)}
        className={cn("shrink-0 rounded-full object-cover", sizeClass, className)}
      />
    )
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground",
        sizeClass,
        className
      )}
      aria-hidden="true"
    >
      {getInitials(name, email)}
    </div>
  )
}

function UserProfilePage() {
  const { user, loading: authLoading } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [form, setForm] = useState<ProfileForm>(emptyForm)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)

  const email = user?.email ?? ""
  const displayNameFromMeta =
    (user?.user_metadata?.full_name as string | undefined)?.trim() || null
  const defaultName =
    displayNameFromMeta || email.split("@")[0] || "Usuario"

  const loadProfile = useCallback(async () => {
    if (!user?.id) return
    setLoading(true)
    setError(null)
    try {
      let data = await profilesService.getProfileById(user.id)
      if (!data) {
        data = await profilesService.createProfile({
          id: user.id,
          full_name: defaultName,
          default_currency: "USD",
          timezone: "America/Santo_Domingo",
        })
        toast.success("Perfil creado correctamente")
      }
      setProfile(data)
      setForm(profileToForm(data))
    } catch (err) {
      console.error(err)
      setError("No se pudo cargar tu perfil. Intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }, [user?.id, defaultName])

  useEffect(() => {
    if (!authLoading && user?.id) {
      void loadProfile()
    } else if (!authLoading && !user) {
      setLoading(false)
    }
  }, [authLoading, user?.id, loadProfile])

  const isDirty = useMemo(() => {
    if (!profile) return false
    return (
      form.full_name !== (profile.full_name ?? "") ||
      form.avatar_url !== (profile.avatar_url ?? "") ||
      form.default_currency !== profile.default_currency ||
      form.timezone !== profile.timezone
    )
  }, [profile, form])

  const handleCancel = () => {
    if (profile) setForm(profileToForm(profile))
  }

  const handleSave = async () => {
    if (!profile) return
    setSaving(true)
    try {
      const updated = await profilesService.updateProfile(profile.id, {
        full_name: form.full_name.trim() || null,
        avatar_url: form.avatar_url.trim() || null,
        default_currency: form.default_currency,
        timezone: form.timezone,
      })
      setProfile(updated)
      setForm(profileToForm(updated))
      toast.success("Perfil actualizado correctamente")
    } catch (err) {
      console.error(err)
      toast.error("No se pudo guardar el perfil")
    } finally {
      setSaving(false)
    }
  }

  const handleCopyId = async () => {
    if (!profile?.id) return
    try {
      await navigator.clipboard.writeText(profile.id)
      setCopied(true)
      toast.success("ID copiado al portapapeles")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("No se pudo copiar el ID")
    }
  }

  if (authLoading || loading) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
          <p className="mt-4 text-sm text-muted-foreground">Cargando perfil...</p>
        </div>
      </PageContainer>
    )
  }

  if (error || !profile) {
    return (
      <PageContainer>
        <Card className="border-border/60">
          <CardContent className="flex flex-col items-center py-16 text-center">
            <AlertCircle className="mb-4 h-10 w-10 text-destructive" />
            <p className="text-sm text-muted-foreground">
              {error ?? "No se encontró el perfil"}
            </p>
            <Button variant="outline" className="mt-4" onClick={() => void loadProfile()}>
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </PageContainer>
    )
  }

  const displayName = form.full_name || profile.full_name || defaultName

  return (
    <PageContainer>
      <div className="grid gap-4 lg:grid-cols-[1fr_280px] lg:items-start">
        {/* Card principal */}
        <Card className="gap-0 border-border/60 py-0 shadow-sm">
          <CardHeader className="border-b border-border/60 px-4 py-5 sm:px-6">
            <div className="flex items-center gap-4">
              <div className="shrink-0">
                <ProfileAvatar
                  name={displayName}
                  email={email}
                  avatarUrl={form.avatar_url || profile.avatar_url}
                  size="xl"
                />
              </div>
              <div className="min-w-0 flex-1 space-y-1 text-left">
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle className="text-xl">{displayName}</CardTitle>
                  <Badge variant="secondary" className="text-[10px] font-normal">
                    Perfil personal
                  </Badge>
                </div>
                <p className="truncate text-sm text-muted-foreground">{email}</p>
                <button
                  type="button"
                  onClick={() => void handleCopyId()}
                  className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
                  title="Copiar ID completo"
                >
                  ID: {abbreviateId(profile.id)}
                  {copied ? (
                    <Check className="h-3 w-3 text-success" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 px-4 py-5 sm:space-y-6 sm:px-6">
            <div>
              <h3 className="mb-3 text-sm font-semibold text-foreground sm:mb-4">Datos personales</h3>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="min-w-0 space-y-2">
                  <Label htmlFor="full-name" className="text-xs sm:text-sm">Nombre completo</Label>
                  <Input
                    id="full-name"
                    value={form.full_name}
                    onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                    placeholder="Tu nombre completo"
                  />
                </div>

                <div className="min-w-0 space-y-2">
                  <Label htmlFor="avatar-url" className="text-xs sm:text-sm">Avatar URL</Label>
                  <Input
                    id="avatar-url"
                    value={form.avatar_url}
                    onChange={(e) => setForm({ ...form, avatar_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>

                <div className="min-w-0 space-y-2">
                  <Label htmlFor="currency" className="text-xs sm:text-sm">Moneda predeterminada</Label>
                  <Select
                    value={form.default_currency}
                    onValueChange={(v) => setForm({ ...form, default_currency: v })}
                  >
                    <SelectTrigger id="currency" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCY_OPTIONS.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="min-w-0 space-y-2">
                  <Label htmlFor="timezone" className="text-xs sm:text-sm">Zona horaria</Label>
                  <Select
                    value={form.timezone}
                    onValueChange={(v) => setForm({ ...form, timezone: v })}
                  >
                    <SelectTrigger id="timezone" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIMEZONE_OPTIONS.map((tz) => (
                        <SelectItem key={tz} value={tz}>
                          {tz}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="min-w-0 space-y-2">
                  <Label htmlFor="created-at" className="text-xs sm:text-sm">Creado el</Label>
                  <Input
                    id="created-at"
                    value={formatDateTime(profile.created_at)}
                    readOnly
                    className="bg-muted/40 text-xs text-muted-foreground sm:text-sm"
                  />
                </div>

                <div className="min-w-0 space-y-2">
                  <Label htmlFor="updated-at" className="text-xs sm:text-sm">Actualizado el</Label>
                  <Input
                    id="updated-at"
                    value={formatDateTime(profile.updated_at)}
                    readOnly
                    className="bg-muted/40 text-xs text-muted-foreground sm:text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 border-t border-border/60 pt-4">
              <Button
                className="w-full"
                onClick={() => void handleSave()}
                disabled={saving || !isDirty}
              >
                {saving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                <span className="truncate">Guardar</span>
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleCancel}
                disabled={saving || !isDirty}
              >
                <X className="mr-2 h-4 w-4 shrink-0" />
                <span className="truncate">Cancelar</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Columna lateral */}
        <div className="space-y-4">
          <Card className="gap-0 border-border/60 py-0 shadow-sm">
            <CardHeader className="px-4 py-4 sm:px-5">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Información de la cuenta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 px-4 pb-5 sm:px-5">
              <div className="flex items-center justify-between gap-2 text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <DollarSign className="h-4 w-4 shrink-0" />
                  Moneda actual
                </span>
                <span className="font-medium">{form.default_currency}</span>
              </div>
              <div className="flex items-center justify-between gap-2 text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Globe className="h-4 w-4 shrink-0" />
                  Zona horaria
                </span>
                <span className="max-w-[140px] truncate text-right font-medium">
                  {form.timezone}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2 text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4 shrink-0" />
                  Última actualización
                </span>
                <span className="text-right text-xs font-medium">
                  {formatDateTime(profile.updated_at)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  )
}

export default UserProfilePage
