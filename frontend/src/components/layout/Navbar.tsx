import { Bell, Github, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useTheme } from "@/hooks/useTheme";

interface NavbarProps {
    title: string;
    subtitle?: string;
}

function Navbar({ title, subtitle }: NavbarProps) {
    const { theme, toggleTheme } = useTheme();

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
            {/* Left Section - Page Title */}
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
                    <div>
                        <h1 className="text-xl font-bold text-foreground">{title}</h1>
                        {subtitle && (
                            <p className="text-sm text-muted-foreground">{subtitle}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Right Section - Actions */}
            <div className="flex items-center gap-2">
                {/* Notifications */}
                <Button variant="ghost" size="icon" className="relative cursor-pointer">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                </Button>

                {/* Theme Toggle */}
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="cursor-pointer"
                    onClick={toggleTheme}
                >
                    {theme === "dark" ? (
                        <Sun className="h-5 w-5 transition-all" />
                    ) : (
                        <Moon className="h-5 w-5 transition-all" />
                    )}
                    <span className="sr-only">Toggle theme</span>
                </Button>

                {/* GitHub Link */}
                <Button variant="ghost" size="icon" asChild className="cursor-pointer">
                    <a
                        href="https://github.com"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <Github className="h-5 w-5" />
                    </a>
                </Button>
            </div>
        </header>
    );
}

export default Navbar;
