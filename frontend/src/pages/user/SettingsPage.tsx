import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  Users,
  Coins,
  Globe,
  Clock,
  Search,
  RefreshCw,
  Eye,
  Pencil,
  Trash2,
  Save,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  RefreshCcw,
} from "lucide-react"
import { toast } from "sonner"
import { PageContainer } from "@/components/ui/PageContainer"
import { StatCard } from "@/components/ui/StatCard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import * as profilesService from "@/services/profiles.service"
import type { Profile } from "@/services/profiles.service"

const PAGE_SIZE = 5

const CURRENCY_OPTIONS = ["USD", "DOP", "EUR", "CAD", "MXN", "GBP"] as const

const TIMEZONE_OPTIONS = [
  "America/Santo_Domingo",
  "America/New_York",
  "America/Mexico_City",
  "America/Los_Angeles",
  "America/Bogota",
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

function getInitials(name: string | null): string {
  if (!name?.trim()) return "?"
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const diffMin = Math.floor(diffMs / 60_000)
  if (diffMin < 1) return "Hace un momento"
  if (diffMin < 60) return `Hace ${diffMin} min`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `Hace ${diffH} h`
  const diffD = Math.floor(diffH / 24)
  if (diffD === 1) return "Ayer"
  return `Hace ${diffD} días`
}

function profileToForm(profile: Profile): ProfileForm {
  return {
    full_name: profile.full_name ?? "",
    avatar_url: profile.avatar_url ?? "",
    default_currency: profile.default_currency,
    timezone: profile.timezone,
  }
}

function ProfileAvatar({
  profile,
  size = "md",
  className,
}: {
  profile: Pick<Profile, "full_name" | "avatar_url">
  size?: "sm" | "md" | "lg"
  className?: string
}) {
  const sizeClass = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-16 w-16 text-xl",
  }[size]

  if (profile.avatar_url) {
    return (
      <img
        src={profile.avatar_url}
        alt=""
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
      {getInitials(profile.full_name)}
    </div>
  )
}

function StatCardSkeleton({ compact = false }: { compact?: boolean }) {
  return (
    <Card className={cn("border-border/60 py-0", compact && "rounded-lg")}>
      <CardContent className={cn(compact ? "p-3" : "p-4 sm:p-6")}>
        <div className="flex animate-pulse items-center justify-between gap-2">
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className={cn("rounded bg-muted", compact ? "h-2.5 w-16" : "h-3 w-24")} />
            <div className={cn("rounded bg-muted", compact ? "h-5 w-10" : "h-7 w-16")} />
            <div className={cn("rounded bg-muted", compact ? "h-2 w-20" : "h-2 w-32")} />
          </div>
          <div className={cn("shrink-0 rounded-lg bg-muted", compact ? "h-8 w-8" : "h-10 w-10")} />
        </div>
      </CardContent>
    </Card>
  )
}

function TableRowSkeleton() {
  return (
    <tr className="animate-pulse border-b border-border/60">
      {Array.from({ length: 7 }).map((_, i) => (
        <td key={i} className="px-3 py-3">
          <div className="h-4 rounded bg-muted" />
        </td>
      ))}
    </tr>
  )
}

function ProfilesTablePagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}: {
  page: number
  totalPages: number
  totalItems: number
  pageSize: number
  onPageChange: (page: number) => void
}) {
  const rangeStart = totalItems === 0 ? 0 : (page - 1) * pageSize + 1
  const rangeEnd = Math.min(page * pageSize, totalItems)

  return (
    <div className="flex flex-col gap-3 border-t border-border/60 pt-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-muted-foreground">
        Mostrando {rangeStart} a {rangeEnd} de {totalItems} perfiles
        <span className="hidden sm:inline"> · {pageSize} por página</span>
      </p>
      <div className="flex flex-wrap items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
          aria-label="Página anterior"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Anterior</span>
        </Button>
        <span className="px-2 text-xs text-muted-foreground sm:hidden">
          {page} / {totalPages}
        </span>
        <div className="hidden items-center gap-1 sm:flex">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Button
              key={p}
              variant={p === page ? "default" : "outline"}
              size="icon-sm"
              onClick={() => onPageChange(p)}
              aria-label={`Ir a la página ${p}`}
              aria-current={p === page ? "page" : undefined}
            >
              {p}
            </Button>
          ))}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          aria-label="Página siguiente"
        >
          <span className="hidden sm:inline">Siguiente</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

function SettingsPage() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [currencyFilter, setCurrencyFilter] = useState("all")
  const [timezoneFilter, setTimezoneFilter] = useState("all")
  const [page, setPage] = useState(1)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [form, setForm] = useState<ProfileForm>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Profile | null>(null)
  const [deleting, setDeleting] = useState(false)
  const detailRef = useRef<HTMLDivElement>(null)

  const loadProfiles = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)
    setError(null)
    try {
      const data = await profilesService.getProfiles()
      setProfiles(data)
      if (data.length > 0 && !selectedId) {
        setSelectedId(data[0].id)
        setForm(profileToForm(data[0]))
      }
    } catch (err) {
      console.error(err)
      setError("No se pudieron cargar los perfiles. Verifica tu conexión y permisos.")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [selectedId])

  useEffect(() => {
    void loadProfiles()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const selectedProfile = useMemo(
    () => profiles.find((p) => p.id === selectedId) ?? null,
    [profiles, selectedId]
  )

  const filteredProfiles = useMemo(() => {
    const q = search.trim().toLowerCase()
    return profiles.filter((p) => {
      if (currencyFilter !== "all" && p.default_currency !== currencyFilter) return false
      if (timezoneFilter !== "all" && p.timezone !== timezoneFilter) return false
      if (!q) return true
      return (
        (p.full_name?.toLowerCase().includes(q) ?? false) ||
        p.id.toLowerCase().includes(q) ||
        abbreviateId(p.id).toLowerCase().includes(q)
      )
    })
  }, [profiles, search, currencyFilter, timezoneFilter])

  const totalPages = Math.max(1, Math.ceil(filteredProfiles.length / PAGE_SIZE))

  const paginatedProfiles = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return filteredProfiles.slice(start, start + PAGE_SIZE)
  }, [filteredProfiles, page])

  useEffect(() => {
    setPage(1)
  }, [search, currencyFilter, timezoneFilter])

  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  const currencyOptions = useMemo(() => {
    const fromData = [...new Set(profiles.map((p) => p.default_currency))]
    return [...new Set([...CURRENCY_OPTIONS, ...fromData])].sort()
  }, [profiles])

  const timezoneOptions = useMemo(() => {
    const fromData = [...new Set(profiles.map((p) => p.timezone))]
    return [...new Set([...TIMEZONE_OPTIONS, ...fromData])].sort()
  }, [profiles])

  const metrics = useMemo(() => {
    const currencies = new Set(profiles.map((p) => p.default_currency))
    const timezones = new Set(profiles.map((p) => p.timezone))
    const latest = profiles.reduce<string | null>((max, p) => {
      if (!max || p.updated_at > max) return p.updated_at
      return max
    }, null)
    return {
      total: profiles.length,
      currencies: currencies.size,
      timezones: timezones.size,
      lastUpdate: latest,
    }
  }, [profiles])

  const selectProfile = (profile: Profile, scrollToDetail = false) => {
    setSelectedId(profile.id)
    setForm(profileToForm(profile))
    if (scrollToDetail) {
      setTimeout(() => detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50)
    }
  }

  const handleCancel = () => {
    if (selectedProfile) setForm(profileToForm(selectedProfile))
  }

  const handleSave = async () => {
    if (!selectedProfile) return
    setSaving(true)
    try {
      const updated = await profilesService.updateProfile(selectedProfile.id, {
        full_name: form.full_name.trim() || null,
        avatar_url: form.avatar_url.trim() || null,
        default_currency: form.default_currency,
        timezone: form.timezone,
      })
      setProfiles((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
      setForm(profileToForm(updated))
      toast.success("Perfil actualizado correctamente")
    } catch (err) {
      console.error(err)
      toast.error("No se pudo guardar el perfil")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await profilesService.deleteProfile(deleteTarget.id)
      setProfiles((prev) => prev.filter((p) => p.id !== deleteTarget.id))
      if (selectedId === deleteTarget.id) {
        const remaining = profiles.filter((p) => p.id !== deleteTarget.id)
        const next = remaining[0] ?? null
        setSelectedId(next?.id ?? null)
        setForm(next ? profileToForm(next) : emptyForm)
      }
      setDeleteTarget(null)
      toast.success("Perfil eliminado")
    } catch (err: unknown) {
      console.error(err)
      const message =
        err instanceof Error
          ? err.message
          : "No se pudo eliminar el perfil. Puede estar restringido por políticas de Supabase."
      toast.error(message)
    } finally {
      setDeleting(false)
    }
  }

  const isDirty =
    selectedProfile &&
    (form.full_name !== (selectedProfile.full_name ?? "") ||
      form.avatar_url !== (selectedProfile.avatar_url ?? "") ||
      form.default_currency !== selectedProfile.default_currency ||
      form.timezone !== selectedProfile.timezone)

  return (
    <PageContainer className="max-w-[1400px]">
      {/* Métricas: 2×2 en móvil, 4 en una fila en escritorio */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 xl:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <StatCardSkeleton key={i} compact />
          ))
        ) : (
          <>
            <StatCard
              compactOnMobile
              title="Perfiles totales"
              value={String(metrics.total)}
              description="Usuarios registrados"
              icon={<Users className="h-full w-full" />}
              tone="primary"
            />
            <StatCard
              compactOnMobile
              title="Monedas activas"
              value={String(metrics.currencies)}
              description="Monedas configuradas"
              icon={<Coins className="h-full w-full" />}
              tone="success"
            />
            <StatCard
              compactOnMobile
              title="Zonas horarias"
              value={String(metrics.timezones)}
              description="Zonas disponibles"
              icon={<Globe className="h-full w-full" />}
              tone="muted"
            />
            <StatCard
              compactOnMobile
              title="Última actualización"
              value={metrics.lastUpdate ? formatRelativeTime(metrics.lastUpdate) : "—"}
              description="Sincronizado ahora"
              icon={<Clock className="h-full w-full" />}
              tone="primary"
            />
          </>
        )}
      </div>

      {/* Contenido principal */}
      <div className="grid gap-4 xl:grid-cols-[1fr_340px] xl:items-start">
        {/* Tabla de perfiles */}
        <Card className="min-w-0 gap-0 border-border/60 py-0">
          <CardHeader className="border-b border-border/60 px-4 py-4 sm:px-6">
            <CardTitle className="text-base">Perfiles existentes</CardTitle>
            <CardDescription>Gestiona la información base de cada usuario</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 px-4 py-4 sm:px-6">
            {/* Filtros */}
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <div className="relative min-w-0 flex-1 sm:min-w-[200px]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre o ID"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex w-full items-center gap-2 sm:w-auto">
                <Select value={currencyFilter} onValueChange={setCurrencyFilter}>
                  <SelectTrigger size="sm" className="min-w-0 flex-1 sm:w-[140px] sm:flex-none">
                    <SelectValue placeholder="Moneda" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Moneda</SelectItem>
                    {currencyOptions.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={timezoneFilter} onValueChange={setTimezoneFilter}>
                  <SelectTrigger size="sm" className="min-w-0 flex-1 sm:w-[180px] sm:flex-none">
                    <SelectValue placeholder="Zona horaria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Zona horaria</SelectItem>
                    {timezoneOptions.map((tz) => (
                      <SelectItem key={tz} value={tz}>
                        {tz}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="icon-sm"
                  onClick={() => void loadProfiles(true)}
                  disabled={refreshing}
                  aria-label="Actualizar perfiles"
                  className="shrink-0"
                >
                  <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
                </Button>
              </div>
            </div>

            {/* Estados */}
            {error && !loading && (
              <div className="flex flex-col items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 py-10 text-center">
                <AlertCircle className="h-10 w-10 text-destructive" />
                <p className="max-w-sm text-sm text-muted-foreground">{error}</p>
                <Button variant="outline" onClick={() => void loadProfiles()}>
                  Reintentar
                </Button>
              </div>
            )}

            {!error && loading && (
              <div className="overflow-x-auto rounded-lg border border-border/60">
                <table className="w-full min-w-[720px] text-sm">
                  <thead>
                    <tr className="border-b border-border/60 bg-muted/30 text-left text-xs text-muted-foreground">
                      <th className="px-3 py-2.5 font-medium">Perfil</th>
                      <th className="px-3 py-2.5 font-medium">ID</th>
                      <th className="px-3 py-2.5 font-medium">Moneda</th>
                      <th className="px-3 py-2.5 font-medium">Zona horaria</th>
                      <th className="px-3 py-2.5 font-medium">Creado</th>
                      <th className="px-3 py-2.5 font-medium">Actualizado</th>
                      <th className="px-3 py-2.5 font-medium">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                      <TableRowSkeleton key={i} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {!error && !loading && filteredProfiles.length === 0 && (
              <div className="flex flex-col items-center py-16 text-center">
                <Users className="mb-3 h-10 w-10 text-muted-foreground/50" />
                <p className="text-sm font-medium text-foreground">
                  {profiles.length === 0 ? "No hay perfiles registrados" : "Sin resultados"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {profiles.length === 0
                    ? "Los perfiles aparecerán aquí cuando los usuarios se registren."
                    : "Prueba con otros filtros o términos de búsqueda."}
                </p>
              </div>
            )}

            {!error && !loading && filteredProfiles.length > 0 && (
              <>
                <div className="overflow-x-auto rounded-lg border border-border/60">
                  <table className="w-full min-w-[720px] text-sm">
                    <thead>
                      <tr className="border-b border-border/60 bg-muted/30 text-left text-xs text-muted-foreground">
                        <th className="px-3 py-2.5 font-medium">Perfil</th>
                        <th className="px-3 py-2.5 font-medium">ID</th>
                        <th className="px-3 py-2.5 font-medium">Moneda</th>
                        <th className="px-3 py-2.5 font-medium">Zona horaria</th>
                        <th className="px-3 py-2.5 font-medium">Creado</th>
                        <th className="px-3 py-2.5 font-medium">Actualizado</th>
                        <th className="px-3 py-2.5 font-medium">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedProfiles.map((profile) => (
                        <tr
                          key={profile.id}
                          onClick={() => selectProfile(profile)}
                          className={cn(
                            "group cursor-pointer border-b border-border/40 transition-colors last:border-0 hover:bg-muted/40",
                            selectedId === profile.id && "bg-primary/5"
                          )}
                        >
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-2.5">
                              <ProfileAvatar profile={profile} size="sm" />
                              <span className="font-medium text-foreground">
                                {profile.full_name || "Sin nombre"}
                              </span>
                            </div>
                          </td>
                          <td className="px-3 py-3 font-mono text-xs text-muted-foreground">
                            {abbreviateId(profile.id)}
                          </td>
                          <td className="px-3 py-3">{profile.default_currency}</td>
                          <td className="max-w-[140px] truncate px-3 py-3 text-muted-foreground">
                            {profile.timezone}
                          </td>
                          <td className="whitespace-nowrap px-3 py-3 text-xs text-muted-foreground">
                            {formatDateTime(profile.created_at)}
                          </td>
                          <td className="whitespace-nowrap px-3 py-3 text-xs text-muted-foreground">
                            {formatDateTime(profile.updated_at)}
                          </td>
                          <td className="px-3 py-3">
                            <div className="group-hover-actions flex items-center gap-0.5">
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  selectProfile(profile, true)
                                }}
                                aria-label={`Ver ${profile.full_name ?? "perfil"}`}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  selectProfile(profile, true)
                                }}
                                aria-label={`Editar ${profile.full_name ?? "perfil"}`}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                className="text-muted-foreground hover:text-destructive"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setDeleteTarget(profile)
                                }}
                                aria-label={`Eliminar ${profile.full_name ?? "perfil"}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <ProfilesTablePagination
                  page={page}
                  totalPages={totalPages}
                  totalItems={filteredProfiles.length}
                  pageSize={PAGE_SIZE}
                  onPageChange={setPage}
                />
              </>
            )}
          </CardContent>
        </Card>

        {/* Panel de detalle */}
        <div ref={detailRef} className="space-y-4">
          <Card className="gap-0 border-border/60 py-0">
            <CardHeader className="border-b border-border/60 px-4 py-4 sm:px-6">
              <CardTitle className="text-base">Detalle del perfil</CardTitle>
              <CardDescription>Editar información del perfil seleccionado</CardDescription>
            </CardHeader>

            <CardContent className="space-y-5 px-4 py-4 sm:px-6">
              {!selectedProfile ? (
                <div className="flex flex-col items-center py-10 text-center">
                  <Users className="mb-3 h-8 w-8 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">
                    Selecciona un perfil de la tabla para ver o editar sus datos.
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-4">
                    <ProfileAvatar
                      profile={{
                        full_name: form.full_name || selectedProfile.full_name,
                        avatar_url: form.avatar_url || selectedProfile.avatar_url,
                      }}
                      size="lg"
                    />
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-foreground">
                        {form.full_name || selectedProfile.full_name || "Sin nombre"}
                      </p>
                      <p className="font-mono text-xs text-muted-foreground">
                        ID: {abbreviateId(selectedProfile.id)}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3 xl:grid-cols-1">
                      <div className="min-w-0 space-y-2">
                        <Label htmlFor="profile-name">Nombre completo</Label>
                        <Input
                          id="profile-name"
                          value={form.full_name}
                          onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                          placeholder="Nombre completo"
                        />
                      </div>

                      <div className="min-w-0 space-y-2">
                        <Label htmlFor="profile-avatar">Avatar URL</Label>
                        <Input
                          id="profile-avatar"
                          value={form.avatar_url}
                          onChange={(e) => setForm({ ...form, avatar_url: e.target.value })}
                          placeholder="https://..."
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 xl:grid-cols-1">
                      <div className="min-w-0 space-y-2">
                        <Label htmlFor="profile-currency">Moneda predeterminada</Label>
                        <Select
                          value={form.default_currency}
                          onValueChange={(v) => setForm({ ...form, default_currency: v })}
                        >
                          <SelectTrigger id="profile-currency" className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {currencyOptions.map((c) => (
                              <SelectItem key={c} value={c}>
                                {c}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="min-w-0 space-y-2">
                        <Label htmlFor="profile-timezone">Zona horaria</Label>
                        <Select
                          value={form.timezone}
                          onValueChange={(v) => setForm({ ...form, timezone: v })}
                        >
                          <SelectTrigger id="profile-timezone" className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {timezoneOptions.map((tz) => (
                              <SelectItem key={tz} value={tz}>
                                {tz}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground xl:grid-cols-1">
                      <div className="min-w-0">
                        <span className="font-medium text-foreground">Creado el</span>
                        <p className="truncate">{formatDateTime(selectedProfile.created_at)}</p>
                      </div>
                      <div className="min-w-0">
                        <span className="font-medium text-foreground">Actualizado el</span>
                        <p className="truncate">{formatDateTime(selectedProfile.updated_at)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button
                      className="flex-1"
                      onClick={() => void handleSave()}
                      disabled={saving || !isDirty}
                    >
                      {saving ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="mr-2 h-4 w-4" />
                      )}
                      Guardar cambios
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={handleCancel}
                      disabled={saving || !isDirty}
                    >
                      Cancelar
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="gap-0 border-border/60 py-0">
            <CardContent className="flex items-start gap-3 px-4 py-4 sm:px-6">
              <div className="rounded-lg bg-primary/10 p-2 text-primary">
                <RefreshCcw className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Sincronización</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Los perfiles se actualizan automáticamente con auth.users.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Confirmación de eliminación */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Eliminar perfil</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar el perfil de{" "}
              <strong>{deleteTarget?.full_name || "este usuario"}</strong>? Esta acción puede
              estar restringida si el perfil está vinculado a auth.users.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={() => void handleDelete()} disabled={deleting}>
              {deleting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  )
}

export default SettingsPage
