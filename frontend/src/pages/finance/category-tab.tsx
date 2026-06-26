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
import type { Category } from "./currency-tab"
import { newId } from "./finance-utils"

interface CategoryTabProps {
  categories: Category[]
  upsertCategory: (category: Category) => void
  deleteCategory: (id: string) => void
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

const findIconKey = (icon: LucideIcon) =>
  iconOptions.find((o) => o.icon === icon)?.key ?? "tag"

const resolveIcon = (key: string) =>
  iconOptions.find((o) => o.key === key)?.icon ?? Tag

interface CategoryForm {
  name: string
  iconKey: string
  color: string
  subcategories: string
}

const emptyForm: CategoryForm = {
  name: "",
  iconKey: "tag",
  color: "bg-blue-500",
  subcategories: "",
}

function CategoryTab({ categories, upsertCategory, deleteCategory }: CategoryTabProps) {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
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
      iconKey: findIconKey(category.icon),
      color: category.color,
      subcategories: category.subcategories.join(", "),
    })
    setOpen(true)
  }

  const handleSave = () => {
    if (!form.name.trim()) {
      toast.error("Ingresa un nombre para la categoría")
      return
    }
    const category: Category = {
      id: editing?.id ?? newId(),
      name: form.name.trim(),
      icon: resolveIcon(form.iconKey),
      color: form.color,
      subcategories: form.subcategories
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    }
    upsertCategory(category)
    toast.success(editing ? "Categoría actualizada" : "Categoría creada")
    setOpen(false)
  }

  const handleDelete = (category: Category) => {
    deleteCategory(category.id)
    toast.success("Categoría eliminada")
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
            const Icon = category.icon
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
                    <div className="flex items-center opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                      <Button variant="ghost" size="icon-sm" onClick={() => openEdit(category)} aria-label={`Editar ${category.name}`}>
                        <Pencil className="h-4 w-4" aria-hidden="true" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleDelete(category)}
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
                          <Badge key={idx} variant="secondary" className="text-[10px]">
                            {sub}
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
    </div>
  )
}

export default CategoryTab
