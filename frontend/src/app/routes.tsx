import { Routes, Route } from "react-router-dom";

// Layout
import AppLayout from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { SettingsAdminRoute } from "@/components/layout/SettingsAdminRoute";

// Pages
import LoginPage from "@/pages/auth/LoginPage";
import DashboardPage from "@/pages/dashboard/DashboardPage";
import DailyPage from "@/pages/to-do/DailyPage";
import CurrencyPage from "@/pages/finance/CurrencyPage";
import ReportPage from "@/pages/reports/report-page";
import UserProfilePage from "@/pages/user/UserProfilePage";
import SettingsPage from "@/pages/user/SettingsPage";
import NotFoundPage from "@/pages/error/NotFoundPage";
import ArchivesPage from "@/pages/files/archivos-page";
import NotePage from "@/pages/notes/notes-page";

export function AppRoutes() {
    return (
        <Routes>
            {/* Auth - No Layout */}
            <Route path="/" element={<LoginPage />} />
            <Route path="/login" element={<LoginPage />} />

            {/* Protected Archives */}
            <Route 
                path="/files"
                element={
                    <ProtectedRoute>
                        <AppLayout title="Archivos" subtitle="Documentos y archivos">
                            <ArchivesPage />
                        </AppLayout>
                    </ProtectedRoute>
                }
            />
            
            {/* Dashboard */}
            <Route 
                path="/dashboard" 
                element={
                    <ProtectedRoute>
                        <AppLayout title="Dashboard" subtitle="Vista general de tu día">
                            <DashboardPage />
                        </AppLayout>
                    </ProtectedRoute>
                } 
            />
            
            {/* Time */}
            <Route 
                path="/daily" 
                element={
                    <ProtectedRoute>
                        <AppLayout title="Mi Día" subtitle="Gestiona tus actividades diarias">
                            <DailyPage />
                        </AppLayout>
                    </ProtectedRoute>
                } 
            />
            
            {/* Finance */}
            <Route 
                path="/currency" 
                element={
                    <ProtectedRoute>
                        <AppLayout title="Finanzas" subtitle="Control de gastos e ingresos">
                            <CurrencyPage />
                        </AppLayout>
                    </ProtectedRoute>
                } 
            />

            {/* Reports */}
            <Route 
                path="/reports" 
                element={
                    <ProtectedRoute>
                        <AppLayout title="Reportes" subtitle="Análisis y estadísticas">
                            <ReportPage />
                        </AppLayout>
                    </ProtectedRoute>
                } 
            />
            
            {/* Notes */}
            <Route 
                path="/notes" 
                element={
                    <ProtectedRoute>
                        <AppLayout title="Notas" subtitle="Notas y pendientes">
                            <NotePage />
                        </AppLayout>
                    </ProtectedRoute>
                } 
            />
            {/* User */}
            <Route 
                path="/profile" 
                element={
                    <ProtectedRoute>
                        <AppLayout title="Mi Perfil" subtitle="Información personal">
                            <UserProfilePage />
                        </AppLayout>
                    </ProtectedRoute>
                } 
            />
            <Route 
                path="/settings" 
                element={
                    <ProtectedRoute>
                        <SettingsAdminRoute>
                            <AppLayout title="Configuración" subtitle="Preferencias de la aplicación">
                                <SettingsPage />
                            </AppLayout>
                        </SettingsAdminRoute>
                    </ProtectedRoute>
                } 
            />

            {/* 404 - Not Found */}
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
}
