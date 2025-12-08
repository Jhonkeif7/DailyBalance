import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

interface AppLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle?: string;
}

function AppLayout({ children, title, subtitle }: AppLayoutProps) {
    return (
        <div className="min-h-screen bg-background">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="pl-64">
                {/* Top Navbar */}
                <Navbar title={title} subtitle={subtitle} />

                {/* Page Content */}
                <main className="p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}

export default AppLayout;
