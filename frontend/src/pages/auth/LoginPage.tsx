import { useState } from "react";
import { Input } from "../../components/ui/Input";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "../../components/ui/Card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/Button";
import backgroundImage from "frontend/src/assets/background_dailybalance.jpg";
import logo from "frontend/src/assets/logo_dailybalance.jpg";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const oficial_email = "oficial@dailybalance.com";
    const oficial_password = "123456";

    const handleLogin = () => {
        if (email === oficial_email && password === oficial_password) {
            toast.success("Inicio de sesión exitoso");
            navigate("/dashboard");
        } else {
            toast.error("Correo o contraseña incorrectos");
        }
    }
    
    return (
        <div 
            className="flex justify-center items-center min-h-screen bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${backgroundImage})` }}
        >
            <Card className="w-full max-w-sm bg-white/20 backdrop-blur-sm border-none">
                <CardHeader className="flex flex-col items-center justify-center">
                    <img src={logo} alt="Logo" className="w-40 h-40 rounded-full" />
                    <CardTitle className="text-3xl font-bold text-white">Inicia sesión</CardTitle>
                    <CardDescription className="text-xl text-white font-semi-bold">
                    Bienvenido a DailyBalance
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form>
                        <div className="flex flex-col gap-6">
                            <div className="grid gap-2">
                            <Label htmlFor="email" className="text-white font-bold text-xl">Correo</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="m@example.com"
                                required
                                className="text-white bg-white/20 border-white/20 placeholder:text-white/50"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            </div>
                            <div className="grid gap-2">
                            <div className="flex items-center">
                                <Label htmlFor="password" className="text-white font-bold text-xl">Contraseña</Label>
                                <a
                                href="#"
                                className="ml-auto inline-block text-sm underline-offset-4 hover:underline text-white"
                                >
                                Olvidaste tu contraseña?
                                </a>
                            </div>
                            <Input id="password" type="password" required className="text-white bg-white/20 border-white/20" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} />
                            </div>
                        </div>
                    </form>
                </CardContent>
                <CardFooter className="flex-col gap-2">
                    <Button type="button" className="w-full text-white bg-[#597347] hover:bg-[#50702B] cursor-pointer" onClick={handleLogin}>
                    Iniciar sesión
                    </Button>
                    <Button variant="link" className="text-[#597347] cursor-pointer">
                    Crear una cuenta
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}

export default LoginPage;

