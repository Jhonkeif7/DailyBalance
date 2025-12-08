import { Routes, Route } from "react-router-dom";

// Pages
import LoginPage from "@/pages/auth/LoginPage";
import DashboardPage from "@/pages/dashboard/DashboardPage";
import DailyPage from "@/pages/time/DailyPage";
import CurrencyPage from "@/pages/finance/CurrencyPage";
import UserProfilePage from "@/pages/user/UserProfilePage";
import SettingsPage from "@/pages/user/SettingsPage";

export function AppRoutes() {
    return (
        <Routes>
            {/* Auth */}
            <Route path="/" element={<LoginPage />} />
            <Route path="/login" element={<LoginPage />} />
            
            {/* Dashboard */}
            <Route path="/dashboard" element={<DashboardPage />} />
            
            {/* Time */}
            <Route path="/daily" element={<DailyPage />} />
            
            {/* Finance */}
            <Route path="/currency" element={<CurrencyPage />} />
            
            {/* User */}
            <Route path="/profile" element={<UserProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
        </Routes>
    );
}

