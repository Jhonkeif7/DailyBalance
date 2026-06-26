import { Github, Menu, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useTheme } from "@/hooks/useTheme";

interface NavbarProps {
    title: string;
    subtitle?: string;
    onMenuToggle?: () => void;
}

function Navbar({ title, subtitle, onMenuToggle }: NavbarProps) {
    const { theme, toggleTheme } = useTheme();

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 sm:px-6">
            {/* Left Section */}
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                {/* Hamburger button — hidden on large screens */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden cursor-pointer shrink-0"
                    onClick={onMenuToggle}
                    aria-label="Abrir menú"
                >
                    <Menu className="h-5 w-5" />
                </Button>

                {/* Page title */}
                <div className="flex items-center gap-2 min-w-0">
                    <div className="w-1.5 h-6 bg-primary rounded-full hidden sm:block shrink-0" />
                    <div className="min-w-0">
                        <h1 className="text-base sm:text-xl font-bold text-foreground truncate">
                            {title}
                        </h1>
                        {subtitle && (
                            <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block truncate">
                                {subtitle}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
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

                <Button variant="ghost" size="icon" asChild className="cursor-pointer hidden sm:flex">
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
