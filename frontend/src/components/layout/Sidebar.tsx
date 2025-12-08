import { NavLink, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import logo from "@/assets/Logo_DailyBalance.jpg";
import {
    LayoutDashboard,
    Calendar,
    Wallet,
    User,
    Settings,
    HelpCircle,
    Search,
    LogOut,
    FileText,
    FolderOpen,
    BarChart3,
    Plus,
} from "lucide-react";

interface NavItemProps {
    to: string;
    icon: React.ReactNode;
    label: string;
}

function NavItem({ to, icon, label }: NavItemProps) {
    return (
        <NavLink
            to={to}
            className={({ isActive }) =>
                cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                    "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground/70"
                )
            }
        >
            {icon}
            <span>{label}</span>
        </NavLink>
    );
}

interface NavSectionProps {
    title: string;
    children: React.ReactNode;
}

function NavSection({ title, children }: NavSectionProps) {
    return (
        <div className="space-y-1">
            <h3 className="px-3 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider">
                {title}
            </h3>
            <div className="space-y-0.5">{children}</div>
        </div>
    );
}

function Sidebar() {
    const navigate = useNavigate();

    const handleLogout = () => {
        navigate("/login");
    };

    return (
        <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col bg-sidebar border-r border-sidebar-border">
            {/* Logo Section */}
            <div className="flex items-center gap-3 px-4 py-5 border-b border-sidebar-border">
                <img
                    src={logo}
                    alt="DailyBalance"
                    className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                    <h1 className="text-lg font-bold text-sidebar-foreground">
                        DailyBalance
                    </h1>
                    <p className="text-xs text-sidebar-foreground/50">Tu balance diario</p>
                </div>
            </div>

            {/* Quick Create Button */}
            <div className="px-3 py-3">
                <button className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors">
                    <Plus className="w-4 h-4" />
                    <span>Crear Nuevo</span>
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-6">
                {/* Main Navigation */}
                <div className="space-y-0.5">
                    <NavItem
                        to="/dashboard"
                        icon={<LayoutDashboard className="w-5 h-5" />}
                        label="Dashboard"
                    />
                    <NavItem
                        to="/daily"
                        icon={<Calendar className="w-5 h-5" />}
                        label="Mi Día"
                    />
                    <NavItem
                        to="/currency"
                        icon={<Wallet className="w-5 h-5" />}
                        label="Finanzas"
                    />
                </div>

                {/* Documents Section */}
                <NavSection title="Documentos">
                    <NavItem
                        to="/reports"
                        icon={<BarChart3 className="w-5 h-5" />}
                        label="Reportes"
                    />
                    <NavItem
                        to="/files"
                        icon={<FolderOpen className="w-5 h-5" />}
                        label="Archivos"
                    />
                    <NavItem
                        to="/notes"
                        icon={<FileText className="w-5 h-5" />}
                        label="Notas"
                    />
                </NavSection>

                {/* User Section */}
                <NavSection title="Cuenta">
                    <NavItem
                        to="/profile"
                        icon={<User className="w-5 h-5" />}
                        label="Mi Perfil"
                    />
                    <NavItem
                        to="/settings"
                        icon={<Settings className="w-5 h-5" />}
                        label="Configuración"
                    />
                </NavSection>
            </nav>

            {/* Bottom Section */}
            <div className="border-t border-sidebar-border p-3 space-y-1">
                <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200">
                    <Search className="w-5 h-5" />
                    <span>Buscar</span>
                    <kbd className="ml-auto text-xs bg-sidebar-accent px-2 py-0.5 rounded">⌘K</kbd>
                </button>
                <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200">
                    <HelpCircle className="w-5 h-5" />
                    <span>Ayuda</span>
                </button>
            </div>

            {/* User Profile */}
            <div className="border-t border-sidebar-border p-3">
                <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-sidebar-accent transition-colors cursor-pointer">
                    <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center text-white font-semibold text-sm">
                        U
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-sidebar-foreground truncate">
                            Usuario
                        </p>
                        <p className="text-xs text-sidebar-foreground/50 truncate">
                            m@example.com
                        </p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="p-1.5 rounded-md hover:bg-sidebar-accent text-sidebar-foreground/50 hover:text-red-500 transition-colors"
                        title="Cerrar sesión"
                    >
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </aside>
    );
}

export default Sidebar;
