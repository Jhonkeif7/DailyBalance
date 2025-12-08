import { useNavigate } from "react-router-dom";
import { Home, ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";

function NotFoundPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
            <div className="text-center max-w-md">
                {/* 404 Number */}
                <div className="relative mb-8">
                    <h1 className="text-[150px] font-black text-emerald-500/20 leading-none select-none">
                        404
                    </h1>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Search className="w-20 h-20 text-emerald-500 animate-pulse" />
                    </div>
                </div>

                {/* Message */}
                <h2 className="text-3xl font-bold text-foreground mb-4">
                    Ruta no encontrada
                </h2>
                <p className="text-muted-foreground mb-8 text-lg">
                    Lo sentimos, la página que buscas no existe o ha sido movida a otra ubicación.
                </p>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                        onClick={() => navigate(-1)}
                        variant="outline"
                        className="gap-2 cursor-pointer"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Volver atrás
                    </Button>
                    <Button
                        onClick={() => navigate("/dashboard")}
                        className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                    >
                        <Home className="w-4 h-4" />
                        Ir al inicio
                    </Button>
                </div>

                {/* Decorative elements */}
                <div className="mt-12 flex justify-center gap-2">
                    {[...Array(5)].map((_, i) => (
                        <div
                            key={i}
                            className="w-2 h-2 rounded-full bg-emerald-500/30"
                            style={{
                                animation: `pulse 1.5s ease-in-out ${i * 0.2}s infinite`,
                            }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default NotFoundPage;

