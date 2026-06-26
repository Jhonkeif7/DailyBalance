import { useState } from "react";
import { Input } from "../../components/ui/Input";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "../../components/ui/Card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/Button";
import logo from "@/assets/logo_dailybalance.png";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, Mail, Lock, Sparkles } from "lucide-react";

const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const navigate = useNavigate();
    const oficial_email = "oficial@dailybalance.com";
    const oficial_password = "123456";
    const [isRecoveringPassword, setIsRecoveringPassword] = useState(false);
    const [isOpenModal, setIsOpenModal] = useState(false);

    const isFormValid = email.trim() !== "" && password.trim() !== "";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!isFormValid) return;
        
        setIsLoading(true);
        
        // Simular delay de red
        await new Promise(resolve => setTimeout(resolve, 800));
        
        if (email === oficial_email && password === oficial_password) {
            toast.success("Inicio de sesión exitoso");
            navigate("/dashboard");
        } else {
            toast.error("Correo o contraseña incorrectos");
            setIsLoading(false);
        }
    };

    const handleRecoverPassword = () => {
        if (!isRecoveringPassword) {
            setIsRecoveringPassword(true);
            setIsOpenModal(true);
        } else {
            setIsRecoveringPassword(false);
            setIsOpenModal(false);
        }
    }
    
    return (
        <>
                <div className="relative flex justify-center items-center min-h-screen overflow-hidden">
            {/* Fondo con gradiente animado */}
            <div 
                className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-900 to-indigo-950"
                style={{
                    backgroundSize: "400% 400%",
                    animation: "gradientShift 15s ease infinite",
                }}
            />
            
            {/* Elementos decorativos flotantes */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div 
                    className="absolute w-72 h-72 bg-blue-500/20 rounded-full blur-3xl"
                    style={{
                        top: "10%",
                        left: "10%",
                        animation: "float 8s ease-in-out infinite",
                    }}
                />
                <div 
                    className="absolute w-96 h-96 bg-indigo-400/15 rounded-full blur-3xl"
                    style={{
                        bottom: "10%",
                        right: "5%",
                        animation: "float 10s ease-in-out infinite reverse",
                    }}
                />
                <div 
                    className="absolute w-64 h-64 bg-sky-400/10 rounded-full blur-3xl"
                    style={{
                        top: "50%",
                        left: "60%",
                        animation: "float 12s ease-in-out infinite",
                    }}
                />
            </div>

            {/* Partículas brillantes */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(6)].map((_, i) => (
                    <Sparkles
                        key={i}
                        className="absolute text-white/20"
                        style={{
                            width: `${20 + Math.random() * 20}px`,
                            height: `${20 + Math.random() * 20}px`,
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                            animation: `twinkle ${3 + Math.random() * 4}s ease-in-out infinite`,
                            animationDelay: `${Math.random() * 2}s`,
                        }}
                    />
                ))}
            </div>

            {/* Card principal con glassmorphism */}
            <Card 
                className="relative z-10 w-full max-w-sm mx-4 bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl"
                style={{
                    animation: "slideUp 0.6s ease-out",
                }}
            >
                <CardHeader className="flex flex-col items-center justify-center py-4 pb-2">
                    <div 
                        className="relative group cursor-pointer"
                        style={{ animation: "pulse-glow 3s ease-in-out infinite" }}
                    >
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full blur opacity-40 group-hover:opacity-75 transition duration-500" />
                        <img 
                            src={logo} 
                            alt="Logo DailyBalance" 
                            className="relative w-20 h-20 rounded-full shadow-xl ring-4 ring-white/20 group-hover:scale-105 transition-transform duration-300" 
                        />
                    </div>
                    <CardTitle className="mt-3 text-2xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                        Inicia sesión
                    </CardTitle>
                    <CardDescription className="text-base text-white/80">
                        Bienvenido a DailyBalance
                    </CardDescription>
                </CardHeader>

                <CardContent className="pt-2 pb-4">
                    <form onSubmit={handleSubmit}>
                        <div className="flex flex-col gap-4">
                            {/* Campo Email */}
                            <div className="grid gap-2">
                                <Label htmlFor="email" className="text-white/90 font-medium flex items-center gap-2">
                                    <Mail className="h-4 w-4" />
                                    Correo electrónico
                                </Label>
                                <div className={`relative transition-all duration-300 ${focusedField === 'email' ? 'scale-[1.02]' : ''}`}>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="tu@correo.com"
                                        required
                                        autoComplete="email"
                                        disabled={isLoading}
                                        className={`
                                            h-10 text-white bg-white/10 border-white/20 
                                            placeholder:text-white/40 
                                            focus:bg-white/15 focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/30
                                            transition-all duration-300
                                            ${focusedField === 'email' ? 'shadow-lg shadow-blue-500/20' : ''}
                                        `}
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        onFocus={() => setFocusedField('email')}
                                        onBlur={() => setFocusedField(null)}
                                    />
                                </div>
                            </div>

                            {/* Campo Contraseña */}
                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label htmlFor="password" className="text-white/90 font-medium flex items-center gap-2">
                                        <Lock className="h-4 w-4" />
                                        Contraseña
                                    </Label>
                                    <a
                                        href="#"
                                        className="ml-auto text-sm text-blue-300/80 hover:text-blue-300 underline-offset-4 hover:underline transition-colors"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleRecoverPassword();
                                        }}
                                    >
                                        ¿Olvidaste tu contraseña?
                                    </a>
                                </div>
                                <div className={`relative transition-all duration-300 ${focusedField === 'password' ? 'scale-[1.02]' : ''}`}>
                                    <Input 
                                        id="password" 
                                        type={showPassword ? "text" : "password"} 
                                        required 
                                        autoComplete="current-password"
                                        disabled={isLoading}
                                        className={`
                                            h-10 text-white bg-white/10 border-white/20 pr-12
                                            placeholder:text-white/40
                                            focus:bg-white/15 focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/30
                                            transition-all duration-300
                                            ${focusedField === 'password' ? 'shadow-lg shadow-blue-500/20' : ''}
                                        `}
                                        value={password} 
                                        onChange={(e) => setPassword(e.target.value)}
                                        onFocus={() => setFocusedField('password')}
                                        onBlur={() => setFocusedField(null)}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-white/10 text-white/60 hover:text-white rounded-lg transition-all"
                                        onClick={() => setShowPassword(!showPassword)}
                                        aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                                        disabled={isLoading}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-5 w-5" aria-hidden="true" />
                                        ) : (
                                            <Eye className="h-5 w-5" aria-hidden="true" />
                                        )}
                                    </Button>
                                </div>
                            </div>

                            {/* Botón de envío */}
                            <Button 
                                type="submit" 
                                className={`
                                    relative h-10 w-full mt-1 font-semibold text-white overflow-hidden
                                    bg-gradient-to-r from-blue-600 to-indigo-600 
                                    hover:from-blue-500 hover:to-indigo-500
                                    disabled:opacity-50 disabled:cursor-not-allowed 
                                    transition-all duration-300 
                                    shadow-lg hover:shadow-blue-500/30 hover:scale-[1.02]
                                    active:scale-[0.98]
                                `}
                                disabled={!isFormValid || isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />
                                        Iniciando sesión...
                                    </>
                                ) : (
                                    "Iniciar sesión"
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>

                <CardFooter className="flex-col gap-3 pt-0 pb-4">
                    <div className="flex items-center gap-3 w-full">
                        <div className="flex-1 h-px bg-white/20" />
                        <span className="text-white/50 text-xs">o</span>
                        <div className="flex-1 h-px bg-white/20" />
                    </div>
                    
                    {/* <Button 
                        variant="outline" 
                        className="w-full h-9 bg-white/5 border-white/20 text-white hover:bg-white/10 hover:text-white transition-all text-sm"
                    >
                        Crear una cuenta
                    </Button> */}

                    {/* Credenciales de prueba */}
                    <div className="w-full p-3 rounded-lg bg-white/5 border border-white/10">
                        <div className="flex items-center gap-2 mb-1">
                            <Sparkles className="h-3 w-3 text-blue-400" />
                            <span className="text-xs font-medium text-white/90">Credenciales de prueba</span>
                        </div>
                        <div className="space-y-0.5 text-xs text-white/70">
                            <p><span className="text-white/50">Correo:</span> {oficial_email}</p>
                            <p><span className="text-white/50">Contraseña:</span> {oficial_password}</p>
                        </div>
                    </div>
                </CardFooter>
            </Card>

            {/* Estilos CSS para animaciones */}
            <style>{`
                @keyframes gradientShift {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }
                
                @keyframes float {
                    0%, 100% { transform: translateY(0) rotate(0deg); }
                    50% { transform: translateY(-20px) rotate(5deg); }
                }
                
                @keyframes twinkle {
                    0%, 100% { opacity: 0.2; transform: scale(1); }
                    50% { opacity: 0.6; transform: scale(1.2); }
                }
                
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                @keyframes pulse-glow {
                    0%, 100% { filter: brightness(1); }
                    50% { filter: brightness(1.1); }
                }
            `}</style>
        </div>
        {/* Modal de recuperación de contraseña */}
        {isOpenModal && (
            <div 
                className="fixed inset-0 z-50 flex items-center justify-center"
                onClick={() => {
                    setIsOpenModal(false);
                    setIsRecoveringPassword(false);
                }}
            >
                {/* Overlay oscuro */}
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                
                {/* Card del modal */}
                <Card 
                    className="relative z-10 w-full max-w-sm mx-4 bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                    style={{ animation: "slideUp 0.3s ease-out" }}
                >
                    <CardHeader className="text-center">
                        <CardTitle className="text-xl text-white">Recuperar contraseña</CardTitle>
                        <CardDescription className="text-white/70">
                            Ingresa tu correo para recuperar tu contraseña
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 rounded-lg bg-amber-500/20 border border-amber-500/30">
                            <p className="text-amber-200 text-sm text-center">
                                🚧 Estamos trabajando en esta funcionalidad
                            </p>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button 
                            variant="outline"
                            className="w-full bg-white/5 border-white/20 text-white hover:bg-white/10"
                            onClick={() => {
                                setIsOpenModal(false);
                                setIsRecoveringPassword(false);
                            }}
                        >
                            Cerrar
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        )}
        </>
    )
}

export default LoginPage;

