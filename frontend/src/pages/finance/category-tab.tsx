import { useState } from "react"
import { Card, CardContent, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Plus,
  Pencil,
  Trash2,
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
  Tag,
  Check,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { ConfirmDeleteDialog } from "@/components/ui/ConfirmDeleteDialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Category } from "./currency-tab"

type CategoryType = "income" | "expense" | "both"

interface CategoryTabProps {
  categories: Category[]
  upsertCategory: (category: Category) => Promise<void>
  deleteCategory: (id: string) => Promise<void>
}

const iconOptions: { key: string; icon: LucideIcon }[] = [
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

const colorOptions = [
  "bg-blue-500",
  "bg-purple-500",
  "bg-emerald-500",
  "bg-orange-500",
  "bg-red-500",
  "bg-pink-500",
  "bg-yellow-500",
  "bg-cyan-500",
  "bg-indigo-500",
  "bg-green-500",
]

const resolveIcon = (key: string) =>
  iconOptions.find((o) => o.key === key)?.icon ?? Tag

interface CategoryForm {
  name: string
  iconKey: string
  color: string
  type: CategoryType
  subcategories: string
}

const emptyForm: CategoryForm = {
  name: "",
  iconKey: "tag",
  color: "bg-blue-500",
  type: "expense",
  subcategories: "",
}

function CategoryTab({ categories, upsertCategory, deleteCategory }: CategoryTabProps) {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [form, setForm] = useState<CategoryForm>(emptyForm)

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setOpen(true)
  }

  const openEdit = (category: Category) => {
    setEditing(category)
    setForm({
      name: category.name,
      iconKey: category.icon || "tag",
      color: category.color,
      type: category.type,
      subcategories: category.subcategories.map((s) => s.name).join(", "),
    })
    setOpen(true)
  }

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Ingresa un nombre para la categoría")
      return
    }
    const id = editing?.id ?? ""
    const category: Category = {
      id,
      name: form.name.trim(),
      icon: form.iconKey,
      color: form.color,
      type: form.type,
      subcategories: form.subcategories
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .map((name) => ({ id: "", categoryId: id, name })),
    }
    try {
      await upsertCategory(category)
      toast.success(editing ? "Categoría actualizada" : "Categoría creada")
      setOpen(false)
    } catch (err) {
      console.error(err)
      toast.error("No se pudo guardar la categoría")
    }
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteCategory(deleteTarget.id)
      toast.success("Categoría eliminada")
      setDeleteTarget(null)
    } catch (err) {
      console.error(err)
      toast.error("No se pudo eliminar la categoría")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{categories.length} categorías</p>
        <Button onClick={openCreate} size="sm">
          <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
          Nueva Categoría
        </Button>
      </div>

      {categories.length === 0 ? (
        <Card className="border-dashed border-border/60">
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No hay categorías. Crea tu primera categoría.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => {
            const Icon = resolveIcon(category.icon)
            return (
              <Card key={category.id} className="group gap-0 border-border/60 py-0">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`rounded-full p-2.5 ${category.color}`}>
                        <Icon className="h-5 w-5 text-white" aria-hidden="true" />
                      </div>
                      <CardTitle className="text-base">{category.name}</CardTitle>
                    </div>
                    <div className="group-hover-actions flex items-center">
                      <Button variant="ghost" size="icon-sm" onClick={() => openEdit(category)} aria-label={`Editar ${category.name}`}>
                        <Pencil className="h-4 w-4" aria-hidden="true" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setDeleteTarget(category)}
                        className="text-muted-foreground hover:text-destructive"
                        aria-label={`Eliminar ${category.name}`}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-3 space-y-1.5">
                    <p className="text-xs text-muted-foreground">Subcategorías</p>
                    <div className="flex flex-wrap gap-1.5">
                      {category.subcategories.length === 0 ? (
                        <p className="text-xs text-muted-foreground">Sin subcategorías</p>
                      ) : (
                        category.subcategories.map((sub, idx) => (
                          <Badge key={sub.id || idx} variant="secondary" className="text-[10px]">
                            {sub.name}
                          </Badge>
                        ))
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Diálogo crear / editar */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Categoría" : "Nueva Categoría"}</DialogTitle>
            <DialogDescription>Organiza y clasifica tus transacciones.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="category-name">Nombre</Label>
              <Input
                id="category-name"
                placeholder="Ej. Alimentación"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                autoComplete="off"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category-type">Tipo</Label>
              <Select value={form.type} onValueChange={(value) => setForm({ ...form, type: value as CategoryType })}>
                <SelectTrigger id="category-type" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">Gasto</SelectItem>
                  <SelectItem value="income">Ingreso</SelectItem>
                  <SelectItem value="both">Ambos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Icono</Label>
              <div className="flex flex-wrap gap-2">
                {iconOptions.map(({ key, icon: Icon }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setForm({ ...form, iconKey: key })}
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-lg border transition-colors",
                      form.iconKey === key
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:bg-muted"
                    )}
                    aria-label={`Icono ${key}`}
                    aria-pressed={form.iconKey === key}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setForm({ ...form, color })}
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full transition-transform hover:scale-110",
                      color,
                      form.color === color && "ring-2 ring-ring ring-offset-2 ring-offset-background"
                    )}
                    aria-label={`Color ${color}`}
                    aria-pressed={form.color === color}
                  >
                    {form.color === color && <Check className="h-4 w-4 text-white" aria-hidden="true" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category-subs">Subcategorías</Label>
              <Input
                id="category-subs"
                placeholder="Supermercado, Restaurantes, Delivery"
                value={form.subcategories}
                onChange={(e) => setForm({ ...form, subcategories: e.target.value })}
                autoComplete="off"
              />
              <p className="text-xs text-muted-foreground">Sepáralas con comas.</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>{editing ? "Guardar cambios" : "Crear Categoría"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Eliminar categoría"
        description={
          <>
            ¿Estás seguro de que deseas eliminar la categoría{" "}
            <strong>{deleteTarget?.name}</strong>? Esta acción no se puede deshacer.
          </>
        }
        onConfirm={handleConfirmDelete}
        loading={deleting}
      />
    </div>
  )
}

export default CategoryTab
