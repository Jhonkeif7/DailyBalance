import { useState, useCallback } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

interface AppLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle?: string;
}

function AppLayout({ children, title, subtitle }: AppLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const closeSidebar = useCallback(() => setSidebarOpen(false), []);
    const toggleSidebar = useCallback(() => setSidebarOpen((prev) => !prev), []);

    return (
        <div className="min-h-screen bg-background">
            <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

            {/* Main content — offset only on large screens where sidebar is always visible */}
            <div className="pl-0 lg:pl-64 transition-all duration-300">
                <Navbar
                    title={title}
                    subtitle={subtitle}
                    onMenuToggle={toggleSidebar}
                />
                <main className="p-4 sm:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}

export default AppLayout;
