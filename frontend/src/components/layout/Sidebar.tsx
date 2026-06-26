import { useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo_dailybalance.png";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { useAuth } from "@/lib/auth";
import {
    LayoutDashboard,
    Calendar,
    Wallet,
    User,
    Settings,
    Search,
    LogOut,
    FileText,
    FolderOpen,
    BarChart3,
    X,
} from "lucide-react";

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

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

function Sidebar({ isOpen, onClose }: SidebarProps) {
    const navigate = useNavigate();
    const location = useLocation();
    const { isSmallScreen } = useBreakpoint();
    const { user, signOut } = useAuth();

    // Auto-close sidebar on navigation (mobile/tablet)
    useEffect(() => {
        if (isSmallScreen) onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.pathname]);

    // Prevent body scroll when mobile drawer is open
    useEffect(() => {
        document.body.style.overflow = isOpen && isSmallScreen ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [isOpen, isSmallScreen]);

    const handleLogout = async () => {
        await signOut();
        navigate("/login", { replace: true });
    };

    const displayEmail = user?.email ?? "m@example.com";
    const displayName =
        (user?.user_metadata?.full_name as string | undefined) ??
        displayEmail.split("@")[0] ??
        "Usuario";
    const avatarLetter = displayName.charAt(0).toUpperCase() || "U";

    return (
        <>
            {/* Backdrop — visible on small screens when drawer is open */}
            <div
                className={cn(
                    "fixed inset-0 z-30 bg-black/50 lg:hidden",
                    "transition-opacity duration-300",
                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Sidebar panel */}
            <aside
                className={cn(
                    "fixed left-0 top-0 z-40 flex h-screen w-64 flex-col bg-sidebar border-r border-sidebar-border",
                    "transition-transform duration-300 ease-in-out",
                    // Large screens: always visible regardless of isOpen state
                    // Small screens: slide in/out based on isOpen
                    "lg:translate-x-0",
                    isOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                {/* Logo Section */}
                <div className="flex items-center gap-3 px-4 py-5 border-b border-sidebar-border">
                    <img
                        src={logo}
                        alt="DailyBalance"
                        className="w-10 h-10 rounded-full object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                        <h1 className="text-lg font-bold text-sidebar-foreground truncate">
                            DailyBalance
                        </h1>
                        <p className="text-xs text-sidebar-foreground/50">Tu balance diario</p>
                    </div>
                    {/* Close button — only on small screens */}
                    <button
                        className="lg:hidden p-1.5 rounded-md hover:bg-sidebar-accent text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors shrink-0"
                        onClick={onClose}
                        aria-label="Cerrar menú"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Search */}
                <div className="border-b border-sidebar-border p-3">
                    <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200">
                        <Search className="w-5 h-5 shrink-0" />
                        <span>Buscar</span>
                        <kbd className="ml-auto text-xs bg-sidebar-accent px-2 py-0.5 rounded hidden sm:inline">
                            ⌘K
                        </kbd>
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-6">
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

                {/* User Profile */}
                <div className="border-t border-sidebar-border p-3">
                    <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-sidebar-accent transition-colors cursor-pointer">
                        <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-sm shrink-0">
                            {avatarLetter}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-sidebar-foreground truncate">
                                {displayName}
                            </p>
                            <p className="text-xs text-sidebar-foreground/50 truncate">
                                {displayEmail}
                            </p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="p-1.5 rounded-md hover:bg-sidebar-accent text-sidebar-foreground/50 hover:text-destructive transition-colors shrink-0"
                            title="Cerrar sesión"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}

export default Sidebar;
