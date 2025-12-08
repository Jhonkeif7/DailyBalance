interface AppLayoutProps {
    children: React.ReactNode;
}

function AppLayout({ children }: AppLayoutProps) {
    return (
        <div className="app-layout">
            {children}
        </div>
    );
}

export default AppLayout;

