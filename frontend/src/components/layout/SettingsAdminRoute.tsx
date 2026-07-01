import { Link } from "react-router-dom"
import { Loader2, ShieldX } from "lucide-react"
import { useAuth } from "@/lib/auth"
import { isSettingsAdmin } from "@/lib/settings-admin"
import AppLayout from "@/components/layout/AppLayout"
import { PageContainer } from "@/components/ui/PageContainer"
import { Card, CardContent } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"

export function SettingsAdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
      </div>
    )
  }

  if (!isSettingsAdmin(user?.email)) {
    return (
      <AppLayout title="Configuración" subtitle="Preferencias de la aplicación">
        <PageContainer>
          <Card className="border-border/60">
            <CardContent className="flex flex-col items-center py-16 text-center">
              <div className="mb-4 rounded-full bg-destructive/10 p-4">
                <ShieldX className="h-10 w-10 text-destructive" aria-hidden="true" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">Acceso no autorizado</h2>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                No tienes permiso para acceder a esta sección. Solo el administrador puede
                gestionar la configuración de perfiles.
              </p>
              <Button asChild className="mt-6">
                <Link to="/dashboard">Volver al inicio</Link>
              </Button>
            </CardContent>
          </Card>
        </PageContainer>
      </AppLayout>
    )
  }

  return <>{children}</>
}
