import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { Badge } from "@/components/ui/badge"
import type { Category } from "./currency-tab"

interface CategoryTabProps {
  categories: Category[]
}

function CategoryTab({ categories }: CategoryTabProps) {
  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle>Categorías Inteligentes</CardTitle>
        <CardDescription>Organiza y clasifica tus transacciones</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => {
            const Icon = category.icon
            return (
              <Card key={category.id} className="border-border/50 bg-card/30">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-full ${category.color}`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <CardTitle className="text-base">{category.name}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Subcategorías:</p>
                    <div className="flex flex-wrap gap-2">
                      {category.subcategories.map((sub, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {sub}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <Card className="mt-6 border-border/50 bg-muted/30">
          <CardHeader>
            <CardTitle className="text-base">Reglas Automáticas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between text-sm p-3 rounded-lg bg-card/50">
              <p>
                Si contiene "Uber" → <span className="font-medium">Transporte</span>
              </p>
              <Badge variant="outline">Activa</Badge>
            </div>
            <div className="flex items-center justify-between text-sm p-3 rounded-lg bg-card/50">
              <p>
                Si contiene "Netflix" → <span className="font-medium">Ocio</span>
              </p>
              <Badge variant="outline">Activa</Badge>
            </div>
            <div className="flex items-center justify-between text-sm p-3 rounded-lg bg-card/50">
              <p>
                Si contiene "Farmacia" → <span className="font-medium">Salud</span>
              </p>
              <Badge variant="outline">Activa</Badge>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  )
}

export default CategoryTab
