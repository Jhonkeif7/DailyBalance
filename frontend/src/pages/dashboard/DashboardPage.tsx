import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/Card";
import { TrendingUp, TrendingDown, Activity, DollarSign, Target, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface StatCardProps {
    title: string;
    value: string;
    description: string;
    trend?: "up" | "down";
    trendValue?: string;
    icon: React.ReactNode;
}

function StatCard({ title, value, description, trend, trendValue, icon }: StatCardProps) {
    return (
        <Card className="bg-card/50 backdrop-blur border-border/50">
            {/* Responsive padding: más compacto en móvil */}
            <CardHeader className="flex flex-row items-center justify-between p-4 sm:p-6 pb-2 sm:pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">{title}</CardTitle>
                <div className="flex items-center gap-2">
                    {trend && trendValue && (
                        <span className={`flex items-center text-xs font-medium ${trend === "up" ? "text-emerald-500" : "text-red-500"}`}>
                            {trend === "up" ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                            {trendValue}
                        </span>
                    )}
                </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                        {/* Responsive typography: texto más pequeño en móvil */}
                        <div className="text-xl sm:text-2xl font-bold text-foreground truncate">{value}</div>
                        <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            {trend === "up" ? (
                                <TrendingUp className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                            ) : trend === "down" ? (
                                <TrendingDown className="w-3 h-3 text-red-500 flex-shrink-0" />
                            ) : null}
                            <span className="truncate">{description}</span>
                        </p>
                    </div>
                    {/* Icono responsive: más pequeño en móvil */}
                    <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-emerald-500/10 text-emerald-500 flex-shrink-0">
                        <div className="w-4 h-4 sm:w-5 sm:h-5">
                            {icon}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function DashboardPage() {
    return (
        // Responsive spacing: menor en móvil, mayor en desktop
        <div className="space-y-4 sm:space-y-6">
            {/* Stats Grid - Mobile: 2 cols, Tablet: 2 cols, Desktop: 4 cols */}
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <StatCard
                    title="Balance Total"
                    value="$12,450.00"
                    description="Aumentó este mes"
                    trend="up"
                    trendValue="+12.5%"
                    icon={<DollarSign className="w-full h-full" />}
                />
                <StatCard
                    title="Gastos del Mes"
                    value="$2,340.00"
                    description="Reducción vs mes anterior"
                    trend="down"
                    trendValue="-8.2%"
                    icon={<TrendingDown className="w-full h-full" />}
                />
                <StatCard
                    title="Tareas Completadas"
                    value="24"
                    description="De 30 tareas planeadas"
                    trend="up"
                    trendValue="+15%"
                    icon={<Target className="w-full h-full" />}
                />
                <StatCard
                    title="Productividad"
                    value="87%"
                    description="Rendimiento semanal"
                    trend="up"
                    trendValue="+5.4%"
                    icon={<Activity className="w-full h-full" />}
                />
            </div>

            {/* Charts Section - Stack en móvil, side-by-side en desktop */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
                {/* Main Chart - Full width en móvil, 2/3 en desktop */}
                <Card className="lg:col-span-2 bg-card/50 backdrop-blur border-border/50">
                    <CardHeader className="p-4 sm:p-6">
                        {/* Responsive header: stack en móvil, row en tablet+ */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div>
                                <CardTitle className="text-base sm:text-lg">Actividad Semanal</CardTitle>
                                <CardDescription className="text-xs sm:text-sm">Resumen de los últimos 7 días</CardDescription>
                            </div>
                            {/* Botones touch-friendly con min-height 44px */}
                            <div className="flex gap-1.5 sm:gap-2">
                                <button className="min-h-[36px] sm:min-h-[40px] px-2.5 sm:px-3 py-1.5 text-xs font-medium rounded-md bg-emerald-500/10 text-emerald-500 transition-colors">
                                    Semana
                                </button>
                                <button className="min-h-[36px] sm:min-h-[40px] px-2.5 sm:px-3 py-1.5 text-xs font-medium rounded-md text-muted-foreground hover:bg-muted transition-colors">
                                    Mes
                                </button>
                                <button className="min-h-[36px] sm:min-h-[40px] px-2.5 sm:px-3 py-1.5 text-xs font-medium rounded-md text-muted-foreground hover:bg-muted transition-colors">
                                    Año
                                </button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                        {/* Chart - Altura responsive */}
                        <div className="h-48 sm:h-56 md:h-64 flex items-end justify-between gap-1 sm:gap-2 px-2 sm:px-4">
                            {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day, index) => {
                                const heights = [60, 80, 45, 90, 75, 30, 55];
                                return (
                                    <div key={day} className="flex-1 flex flex-col items-center gap-1.5 sm:gap-2">
                                        <div 
                                            className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-sm sm:rounded-t-md transition-all duration-300 hover:from-emerald-500 hover:to-emerald-300"
                                            style={{ height: `${heights[index]}%` }}
                                        />
                                        {/* Labels: abreviados en móvil pequeño */}
                                        <span className="text-[10px] sm:text-xs text-muted-foreground">
                                            <span className="hidden xs:inline">{day}</span>
                                            <span className="xs:hidden">{day.charAt(0)}</span>
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Side Card - Tareas de Hoy */}
                <Card className="bg-card/50 backdrop-blur border-border/50">
                    <CardHeader className="p-4 sm:p-6">
                        <CardTitle className="text-base sm:text-lg">Tareas de Hoy</CardTitle>
                        <CardDescription className="text-xs sm:text-sm">3 de 5 completadas</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                        <div className="space-y-2 sm:space-y-3">
                            {[
                                { task: 'Revisar presupuesto mensual', done: true },
                                { task: 'Reunión de equipo', done: true },
                                { task: 'Actualizar reportes', done: true },
                                { task: 'Planificar semana', done: false },
                                { task: 'Revisar inversiones', done: false },
                            ].map((item, index) => (
                                <div
                                    key={index}
                                    className={`
                                        flex items-center gap-2.5 sm:gap-3 
                                        p-2.5 sm:p-3 rounded-lg 
                                        transition-colors cursor-pointer
                                        min-h-[44px]
                                        ${item.done 
                                            ? 'bg-emerald-500/10 text-emerald-500' 
                                            : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                                        }
                                    `}
                                >
                                    {/* Checkbox touch-friendly */}
                                    <div className={`
                                        w-5 h-5 sm:w-5 sm:h-5 rounded-full border-2 
                                        flex items-center justify-center flex-shrink-0
                                        ${item.done 
                                            ? 'border-emerald-500 bg-emerald-500' 
                                            : 'border-muted-foreground'
                                        }
                                    `}>
                                        {item.done && (
                                            <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </div>
                                    <span className={`text-xs sm:text-sm truncate ${item.done ? 'line-through' : ''}`}>
                                        {item.task}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity */}
            <Card className="bg-card/50 backdrop-blur border-border/50">
                <CardHeader className="p-4 sm:p-6">
                    {/* Header responsive */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                            <CardTitle className="text-base sm:text-lg">Actividad Reciente</CardTitle>
                            <CardDescription className="text-xs sm:text-sm">Tus últimas transacciones y actividades</CardDescription>
                        </div>
                        {/* Botón touch-friendly */}
                        <button className="text-xs sm:text-sm text-emerald-500 hover:underline self-start sm:self-auto min-h-[44px] flex items-center">
                            Ver todo
                        </button>
                    </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                    <div className="space-y-2 sm:space-y-4">
                        {[
                            { type: 'expense', title: 'Supermercado', amount: '-$125.00', time: 'Hace 2 horas', category: 'Comida' },
                            { type: 'income', title: 'Salario', amount: '+$3,500.00', time: 'Ayer', category: 'Trabajo' },
                            { type: 'expense', title: 'Netflix', amount: '-$15.99', time: 'Hace 2 días', category: 'Suscripciones' },
                            { type: 'expense', title: 'Gasolina', amount: '-$45.00', time: 'Hace 3 días', category: 'Transporte' },
                        ].map((item, index) => (
                            <div 
                                key={index}
                                className="
                                    flex items-center justify-between 
                                    p-3 sm:p-4 rounded-lg 
                                    bg-muted/30 hover:bg-muted/50 
                                    transition-colors
                                    min-h-[60px] sm:min-h-[72px]
                                "
                            >
                                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                                    {/* Icono responsive */}
                                    <div className={`
                                        p-1.5 sm:p-2 rounded-md sm:rounded-lg flex-shrink-0
                                        ${item.type === 'income' 
                                            ? 'bg-emerald-500/10 text-emerald-500' 
                                            : 'bg-red-500/10 text-red-500'
                                        }
                                    `}>
                                        {item.type === 'income' ? (
                                            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
                                        ) : (
                                            <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5" />
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm sm:text-base font-medium text-foreground truncate">{item.title}</p>
                                        {/* En móvil: solo categoría. En desktop: categoría + tiempo */}
                                        <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                                            <span>{item.category}</span>
                                            <span className="hidden sm:inline"> • {item.time}</span>
                                        </p>
                                    </div>
                                </div>
                                {/* Monto responsive */}
                                <span className={`
                                    text-sm sm:text-base font-semibold flex-shrink-0 ml-2
                                    ${item.type === 'income' ? 'text-emerald-500' : 'text-red-500'}
                                `}>
                                    {item.amount}
                                </span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default DashboardPage;
