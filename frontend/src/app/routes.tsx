import { Routes, Route } from "react-router-dom";

// Layout
import AppLayout from "@/components/layout/AppLayout";

// Pages
import LoginPage from "@/pages/auth/LoginPage";
import DashboardPage from "@/pages/dashboard/DashboardPage";
import DailyPage from "@/pages/time/DailyPage";
import CurrencyPage from "@/pages/finance/CurrencyPage";
import UserProfilePage from "@/pages/user/UserProfilePage";
import SettingsPage from "@/pages/user/SettingsPage";
import NotFoundPage from "@/pages/error/NotFoundPage";

export function AppRoutes() {
    return (
        <Routes>
            {/* Auth - No Layout */}
            <Route path="/" element={<LoginPage />} />
            <Route path="/login" element={<LoginPage />} />
            
            {/* Dashboard */}
            <Route 
                path="/dashboard" 
                element={
                    <AppLayout title="Dashboard" subtitle="Vista general de tu día">
                        <DashboardPage />
                    </AppLayout>
                } 
            />
            
            {/* Time */}
            <Route 
                path="/daily" 
                element={
                    <AppLayout title="Mi Día" subtitle="Gestiona tus actividades diarias">
                        <DailyPage />
                    </AppLayout>
                } 
            />
            
            {/* Finance */}
            <Route 
                path="/currency" 
                element={
                    <AppLayout title="Finanzas" subtitle="Control de gastos e ingresos">
                        <CurrencyPage />
                    </AppLayout>
                } 
            />
            
            {/* User */}
            <Route 
                path="/profile" 
                element={
                    <AppLayout title="Mi Perfil" subtitle="Información personal">
                        <UserProfilePage />
                    </AppLayout>
                } 
            />
            <Route 
                path="/settings" 
                element={
                    <AppLayout title="Configuración" subtitle="Preferencias de la aplicación">
                        <SettingsPage />
                    </AppLayout>
                } 
            />

            {/* 404 - Not Found */}
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
}
