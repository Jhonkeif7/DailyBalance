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
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                <div className="flex items-center gap-2">
                    {trend && trendValue && (
                        <span className={`flex items-center text-xs font-medium ${trend === "up" ? "text-emerald-500" : "text-red-500"}`}>
                            {trend === "up" ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                            {trendValue}
                        </span>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-2xl font-bold text-foreground">{value}</div>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            {trend === "up" ? (
                                <TrendingUp className="w-3 h-3 text-emerald-500" />
                            ) : trend === "down" ? (
                                <TrendingDown className="w-3 h-3 text-red-500" />
                            ) : null}
                            {description}
                        </p>
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500">
                        {icon}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function DashboardPage() {
    return (
        <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Balance Total"
                    value="$12,450.00"
                    description="Aumentó este mes"
                    trend="up"
                    trendValue="+12.5%"
                    icon={<DollarSign className="w-5 h-5" />}
                />
                <StatCard
                    title="Gastos del Mes"
                    value="$2,340.00"
                    description="Reducción vs mes anterior"
                    trend="down"
                    trendValue="-8.2%"
                    icon={<TrendingDown className="w-5 h-5" />}
                />
                <StatCard
                    title="Tareas Completadas"
                    value="24"
                    description="De 30 tareas planeadas"
                    trend="up"
                    trendValue="+15%"
                    icon={<Target className="w-5 h-5" />}
                />
                <StatCard
                    title="Productividad"
                    value="87%"
                    description="Rendimiento semanal"
                    trend="up"
                    trendValue="+5.4%"
                    icon={<Activity className="w-5 h-5" />}
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Main Chart */}
                <Card className="lg:col-span-2 bg-card/50 backdrop-blur border-border/50">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Actividad Semanal</CardTitle>
                                <CardDescription>Resumen de los últimos 7 días</CardDescription>
                            </div>
                            <div className="flex gap-2">
                                <button className="px-3 py-1.5 text-xs font-medium rounded-md bg-emerald-500/10 text-emerald-500">
                                    Semana
                                </button>
                                <button className="px-3 py-1.5 text-xs font-medium rounded-md text-muted-foreground hover:bg-muted transition-colors">
                                    Mes
                                </button>
                                <button className="px-3 py-1.5 text-xs font-medium rounded-md text-muted-foreground hover:bg-muted transition-colors">
                                    Año
                                </button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {/* Chart Placeholder */}
                        <div className="h-64 flex items-end justify-between gap-2 px-4">
                            {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day, index) => {
                                const heights = [60, 80, 45, 90, 75, 30, 55];
                                return (
                                    <div key={day} className="flex-1 flex flex-col items-center gap-2">
                                        <div 
                                            className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-md transition-all duration-300 hover:from-emerald-500 hover:to-emerald-300"
                                            style={{ height: `${heights[index]}%` }}
                                        />
                                        <span className="text-xs text-muted-foreground">{day}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Side Card */}
                <Card className="bg-card/50 backdrop-blur border-border/50">
                    <CardHeader>
                        <CardTitle>Tareas de Hoy</CardTitle>
                        <CardDescription>3 de 5 completadas</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {[
                                { task: 'Revisar presupuesto mensual', done: true },
                                { task: 'Reunión de equipo', done: true },
                                { task: 'Actualizar reportes', done: true },
                                { task: 'Planificar semana', done: false },
                                { task: 'Revisar inversiones', done: false },
                            ].map((item, index) => (
                                <div
                                    key={index}
                                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                                        item.done 
                                            ? 'bg-emerald-500/10 text-emerald-500' 
                                            : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                                    }`}
                                >
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                        item.done 
                                            ? 'border-emerald-500 bg-emerald-500' 
                                            : 'border-muted-foreground'
                                    }`}>
                                        {item.done && (
                                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </div>
                                    <span className={`text-sm ${item.done ? 'line-through' : ''}`}>
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
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Actividad Reciente</CardTitle>
                            <CardDescription>Tus últimas transacciones y actividades</CardDescription>
                        </div>
                        <button className="text-sm text-emerald-500 hover:underline">
                            Ver todo
                        </button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {[
                            { type: 'expense', title: 'Supermercado', amount: '-$125.00', time: 'Hace 2 horas', category: 'Comida' },
                            { type: 'income', title: 'Salario', amount: '+$3,500.00', time: 'Ayer', category: 'Trabajo' },
                            { type: 'expense', title: 'Netflix', amount: '-$15.99', time: 'Hace 2 días', category: 'Suscripciones' },
                            { type: 'expense', title: 'Gasolina', amount: '-$45.00', time: 'Hace 3 días', category: 'Transporte' },
                        ].map((item, index) => (
                            <div 
                                key={index}
                                className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-lg ${
                                        item.type === 'income' 
                                            ? 'bg-emerald-500/10 text-emerald-500' 
                                            : 'bg-red-500/10 text-red-500'
                                    }`}>
                                        {item.type === 'income' ? (
                                            <TrendingUp className="w-5 h-5" />
                                        ) : (
                                            <TrendingDown className="w-5 h-5" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-medium text-foreground">{item.title}</p>
                                        <p className="text-xs text-muted-foreground">{item.category} • {item.time}</p>
                                    </div>
                                </div>
                                <span className={`font-semibold ${
                                    item.type === 'income' ? 'text-emerald-500' : 'text-red-500'
                                }`}>
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
