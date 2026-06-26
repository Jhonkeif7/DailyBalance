import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/Card";
import { PageContainer } from "@/components/ui/PageContainer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    Calendar,
    Download,
    PieChart,
    BarChart3,
    Target,
    Wallet,
    CreditCard,
    ShoppingCart,
    Car,
    Home,
    Utensils,
    Gamepad2,
    Sparkles,
    ArrowUpRight,
    ArrowDownRight,
} from "lucide-react";

// Tipos
interface CategoryData {
    name: string;
    amount: number;
    percentage: number;
    color: string;
    icon: React.ReactNode;
}

interface TransactionSummary {
    category: string;
    income: number;
    expense: number;
    balance: number;
}

// Datos de ejemplo
const monthlyData = [
    { month: "Ene", income: 4500, expense: 3200 },
    { month: "Feb", income: 4200, expense: 2800 },
    { month: "Mar", income: 5100, expense: 3500 },
    { month: "Abr", income: 4800, expense: 3100 },
    { month: "May", income: 5500, expense: 3800 },
    { month: "Jun", income: 5200, expense: 3400 },
];

const categoryExpenses: CategoryData[] = [
    { name: "Vivienda", amount: 1200, percentage: 35, color: "bg-blue-500", icon: <Home className="w-4 h-4" /> },
    { name: "Alimentación", amount: 650, percentage: 19, color: "bg-emerald-500", icon: <Utensils className="w-4 h-4" /> },
    { name: "Transporte", amount: 450, percentage: 13, color: "bg-amber-500", icon: <Car className="w-4 h-4" /> },
    { name: "Compras", amount: 380, percentage: 11, color: "bg-purple-500", icon: <ShoppingCart className="w-4 h-4" /> },
    { name: "Entretenimiento", amount: 280, percentage: 8, color: "bg-pink-500", icon: <Gamepad2 className="w-4 h-4" /> },
    { name: "Otros", amount: 440, percentage: 14, color: "bg-gray-500", icon: <Wallet className="w-4 h-4" /> },
];

const transactionSummary: TransactionSummary[] = [
    { category: "Enero", income: 4500, expense: 3200, balance: 1300 },
    { category: "Febrero", income: 4200, expense: 2800, balance: 1400 },
    { category: "Marzo", income: 5100, expense: 3500, balance: 1600 },
    { category: "Abril", income: 4800, expense: 3100, balance: 1700 },
    { category: "Mayo", income: 5500, expense: 3800, balance: 1700 },
    { category: "Junio", income: 5200, expense: 3400, balance: 1800 },
];

const productivityData = [
    { day: "Lun", completed: 8, total: 10 },
    { day: "Mar", completed: 6, total: 8 },
    { day: "Mié", completed: 9, total: 10 },
    { day: "Jue", completed: 7, total: 9 },
    { day: "Vie", completed: 5, total: 7 },
    { day: "Sáb", completed: 3, total: 4 },
    { day: "Dom", completed: 2, total: 3 },
];

// Componente de tarjeta de estadística
function StatCard({ 
    title, 
    value, 
    description, 
    trend, 
    trendValue, 
    icon,
    iconColor = "bg-primary/10 text-primary"
}: {
    title: string;
    value: string;
    description: string;
    trend?: "up" | "down";
    trendValue?: string;
    icon: React.ReactNode;
    iconColor?: string;
}) {
    return (
        <Card className="bg-card/60 backdrop-blur border-border/60">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                {trend && trendValue && (
                    <span className={`flex items-center text-xs font-medium ${trend === "up" ? "text-success" : "text-destructive"}`}>
                        {trend === "up" ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {trendValue}
                    </span>
                )}
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-2xl font-bold text-foreground">{value}</div>
                        <p className="text-xs text-muted-foreground mt-1">{description}</p>
                    </div>
                    <div className={`p-3 rounded-xl ${iconColor}`}>
                        {icon}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// Componente de gráfico de barras
function BarChartComponent({ data }: { data: typeof monthlyData }) {
    const maxValue = Math.max(...data.flatMap(d => [d.income, d.expense]));
    
    return (
        <div className="h-64 flex items-end justify-between gap-3 px-2">
            {data.map((item) => (
                <div key={item.month} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full flex gap-1 items-end justify-center h-48">
                        <div
                            className="w-5 bg-gradient-to-t from-success to-success/60 rounded-t-sm transition-all duration-300 hover:opacity-80"
                            style={{ height: `${(item.income / maxValue) * 100}%` }}
                            title={`Ingresos: $${item.income}`}
                        />
                        <div
                            className="w-5 bg-gradient-to-t from-destructive to-destructive/60 rounded-t-sm transition-all duration-300 hover:opacity-80"
                            style={{ height: `${(item.expense / maxValue) * 100}%` }}
                            title={`Gastos: $${item.expense}`}
                        />
                    </div>
                    <span className="text-xs text-muted-foreground">{item.month}</span>
                </div>
            ))}
        </div>
    );
}

// Componente de gráfico circular (simulado)
function PieChartComponent({ data }: { data: CategoryData[] }) {
    return (
        <div className="flex flex-col gap-4">
            {/* Círculo visual */}
            <div className="relative w-40 h-40 mx-auto">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    {data.map((category, index) => {
                        const offset = data.slice(0, index).reduce((sum, c) => sum + c.percentage, 0);
                        const colorClasses: Record<string, string> = {
                            "bg-blue-500": "#3b82f6",
                            "bg-emerald-500": "#10b981",
                            "bg-amber-500": "#f59e0b",
                            "bg-purple-500": "#a855f7",
                            "bg-pink-500": "#ec4899",
                            "bg-gray-500": "#6b7280",
                        };
                        return (
                            <circle
                                key={category.name}
                                cx="50"
                                cy="50"
                                r="40"
                                fill="none"
                                stroke={colorClasses[category.color] || "#6b7280"}
                                strokeWidth="20"
                                strokeDasharray={`${category.percentage * 2.51} 251`}
                                strokeDashoffset={`-${offset * 2.51}`}
                                className="transition-all duration-500"
                            />
                        );
                    })}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-2xl font-bold">$3,400</p>
                        <p className="text-xs text-muted-foreground">Total</p>
                    </div>
                </div>
            </div>
            
            {/* Leyenda */}
            <div className="grid grid-cols-2 gap-2">
                {data.map((category) => (
                    <div key={category.name} className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${category.color}`} />
                        <span className="text-xs text-muted-foreground">{category.name}</span>
                        <span className="text-xs font-medium ml-auto">{category.percentage}%</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Componente de tabla de resumen
function SummaryTable({ data }: { data: TransactionSummary[] }) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="border-b border-border/50">
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Período</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Ingresos</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Gastos</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Balance</th>
                        <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Estado</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, index) => (
                        <tr 
                            key={index} 
                            className="border-b border-border/30 hover:bg-muted/30 transition-colors"
                        >
                            <td className="py-3 px-4 text-sm font-medium">{row.category}</td>
                            <td className="py-3 px-4 text-sm text-right text-success">
                                +${row.income.toLocaleString()}
                            </td>
                            <td className="py-3 px-4 text-sm text-right text-destructive">
                                -${row.expense.toLocaleString()}
                            </td>
                            <td className="py-3 px-4 text-sm text-right font-semibold">
                                ${row.balance.toLocaleString()}
                            </td>
                            <td className="py-3 px-4 text-center">
                                <Badge 
                                    variant={row.balance > 1500 ? "default" : "secondary"}
                                    className={row.balance > 1500 ? "bg-success/20 text-success hover:bg-success/30" : ""}
                                >
                                    {row.balance > 1500 ? "Excelente" : "Bueno"}
                                </Badge>
                            </td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr className="bg-muted/30">
                        <td className="py-3 px-4 text-sm font-bold">Total</td>
                        <td className="py-3 px-4 text-sm text-right font-bold text-success">
                            +${data.reduce((sum, r) => sum + r.income, 0).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-sm text-right font-bold text-destructive">
                            -${data.reduce((sum, r) => sum + r.expense, 0).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-sm text-right font-bold">
                            ${data.reduce((sum, r) => sum + r.balance, 0).toLocaleString()}
                        </td>
                        <td className="py-3 px-4"></td>
                    </tr>
                </tfoot>
            </table>
        </div>
    );
}

const ReportPage = () => {
    const [period, setPeriod] = useState("6months");

    return (
        <PageContainer>
            {/* Header con filtros */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                        <BarChart3 className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold">Centro de Reportes</h2>
                        <p className="text-sm text-muted-foreground">Analiza tu rendimiento financiero y productividad</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    <Select value={period} onValueChange={setPeriod}>
                        <SelectTrigger className="w-[180px] bg-card/50">
                            <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                            <SelectValue placeholder="Seleccionar período" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="1month">Último mes</SelectItem>
                            <SelectItem value="3months">Últimos 3 meses</SelectItem>
                            <SelectItem value="6months">Últimos 6 meses</SelectItem>
                            <SelectItem value="1year">Último año</SelectItem>
                        </SelectContent>
                    </Select>
                    
                    <Button variant="outline" className="gap-2">
                        <Download className="w-4 h-4" />
                        Exportar
                    </Button>
                </div>
            </div>

            {/* Tabs de reportes */}
            <Tabs defaultValue="finance" className="space-y-6">
                <TabsList className="bg-card/50 border border-border/50">
                    <TabsTrigger value="finance" className="gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                        <DollarSign className="w-4 h-4" />
                        Finanzas
                    </TabsTrigger>
                    <TabsTrigger value="productivity" className="gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                        <Target className="w-4 h-4" />
                        Productividad
                    </TabsTrigger>
                    <TabsTrigger value="summary" className="gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                        <PieChart className="w-4 h-4" />
                        Resumen
                    </TabsTrigger>
                </TabsList>

                {/* Tab: Finanzas */}
                <TabsContent value="finance" className="space-y-6">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard
                            title="Ingresos Totales"
                            value="$29,300"
                            description="Últimos 6 meses"
                            trend="up"
                            trendValue="+12.5%"
                            icon={<TrendingUp className="w-5 h-5" />}
                        />
                        <StatCard
                            title="Gastos Totales"
                            value="$19,800"
                            description="Últimos 6 meses"
                            trend="down"
                            trendValue="-5.2%"
                            icon={<TrendingDown className="w-5 h-5" />}
                            iconColor="bg-red-500/10 text-red-500"
                        />
                        <StatCard
                            title="Balance Neto"
                            value="$9,500"
                            description="Ahorro acumulado"
                            trend="up"
                            trendValue="+18.3%"
                            icon={<Wallet className="w-5 h-5" />}
                        />
                        <StatCard
                            title="Promedio Mensual"
                            value="$1,583"
                            description="Ahorro por mes"
                            icon={<CreditCard className="w-5 h-5" />}
                            iconColor="bg-blue-500/10 text-blue-500"
                        />
                    </div>

                    {/* Gráficos */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        {/* Gráfico de barras */}
                        <Card className="lg:col-span-2 bg-card/60 backdrop-blur border-border/60">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Ingresos vs Gastos</CardTitle>
                                        <CardDescription>Comparativa mensual</CardDescription>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-success" />
                                            <span className="text-muted-foreground">Ingresos</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-destructive" />
                                            <span className="text-muted-foreground">Gastos</span>
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <BarChartComponent data={monthlyData} />
                            </CardContent>
                        </Card>

                        {/* Gráfico circular */}
                        <Card className="bg-card/60 backdrop-blur border-border/60">
                            <CardHeader>
                                <CardTitle>Gastos por Categoría</CardTitle>
                                <CardDescription>Distribución del mes actual</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <PieChartComponent data={categoryExpenses} />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Desglose por categoría */}
                    <Card className="bg-card/60 backdrop-blur border-border/60">
                        <CardHeader>
                            <CardTitle>Desglose de Gastos</CardTitle>
                            <CardDescription>Detalle por categoría con progreso</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {categoryExpenses.map((category) => (
                                    <div key={category.name} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${category.color}/10`}>
                                                    <span className={category.color.replace("bg-", "text-")}>
                                                        {category.icon}
                                                    </span>
                                                </div>
                                                <span className="font-medium">{category.name}</span>
                                            </div>
                                            <div className="text-right">
                                                <span className="font-semibold">${category.amount}</span>
                                                <span className="text-muted-foreground text-sm ml-2">({category.percentage}%)</span>
                                            </div>
                                        </div>
                                        <Progress 
                                            value={category.percentage} 
                                            className="h-2"
                                        />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Tab: Productividad */}
                <TabsContent value="productivity" className="space-y-6">
                    {/* Stats de productividad */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard
                            title="Tareas Completadas"
                            value="156"
                            description="Este mes"
                            trend="up"
                            trendValue="+23%"
                            icon={<Target className="w-5 h-5" />}
                        />
                        <StatCard
                            title="Tasa de Éxito"
                            value="87%"
                            description="Promedio mensual"
                            trend="up"
                            trendValue="+5%"
                            icon={<Sparkles className="w-5 h-5" />}
                        />
                        <StatCard
                            title="Racha Actual"
                            value="12 días"
                            description="Días consecutivos productivos"
                            icon={<TrendingUp className="w-5 h-5" />}
                        />
                        <StatCard
                            title="Mejor Día"
                            value="Miércoles"
                            description="Día más productivo"
                            icon={<Calendar className="w-5 h-5" />}
                            iconColor="bg-purple-500/10 text-purple-500"
                        />
                    </div>

                    {/* Gráfico semanal */}
                    <Card className="bg-card/60 backdrop-blur border-border/60">
                        <CardHeader>
                            <CardTitle>Productividad Semanal</CardTitle>
                            <CardDescription>Tareas completadas vs planeadas</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {productivityData.map((day) => (
                                    <div key={day.day} className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="font-medium w-12">{day.day}</span>
                                            <div className="flex-1 mx-4">
                                                <Progress 
                                                    value={(day.completed / day.total) * 100} 
                                                    className="h-3"
                                                />
                                            </div>
                                            <span className="text-muted-foreground w-16 text-right">
                                                {day.completed}/{day.total} tareas
                                            </span>
                                            <Badge 
                                                variant="outline" 
                                                className={`ml-3 w-16 justify-center ${
                                                    (day.completed / day.total) >= 0.8 
                                                        ? "border-success text-success" 
                                                        : (day.completed / day.total) >= 0.6
                                                            ? "border-amber-500 text-amber-500"
                                                            : "border-destructive text-destructive"
                                                }`}
                                            >
                                                {Math.round((day.completed / day.total) * 100)}%
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Tab: Resumen */}
                <TabsContent value="summary" className="space-y-6">
                    {/* Tabla de resumen */}
                    <Card className="bg-card/60 backdrop-blur border-border/60">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Resumen Financiero</CardTitle>
                                    <CardDescription>Desglose mensual de los últimos 6 meses</CardDescription>
                                </div>
                                <Button variant="outline" size="sm" className="gap-2">
                                    <Download className="w-4 h-4" />
                                    Descargar CSV
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <SummaryTable data={transactionSummary} />
                        </CardContent>
                    </Card>

                    {/* Insights */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="bg-card/60 backdrop-blur border-border/60">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-success" />
                                    Puntos Positivos
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-3">
                                    <li className="flex items-start gap-3">
                                        <div className="mt-1 w-2 h-2 rounded-full bg-success" />
                                        <span className="text-sm">Has aumentado tu ahorro mensual en un <strong>18%</strong> respecto al semestre anterior.</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="mt-1 w-2 h-2 rounded-full bg-success" />
                                        <span className="text-sm">Redujiste gastos en entretenimiento en un <strong>12%</strong>.</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="mt-1 w-2 h-2 rounded-full bg-success" />
                                        <span className="text-sm">Tu productividad ha mejorado <strong>5 puntos</strong> porcentuales.</span>
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>

                        <Card className="bg-card/60 backdrop-blur border-border/60">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Target className="w-5 h-5 text-amber-500" />
                                    Áreas de Mejora
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-3">
                                    <li className="flex items-start gap-3">
                                        <div className="mt-1 w-2 h-2 rounded-full bg-amber-500" />
                                        <span className="text-sm">Los gastos en <strong>transporte</strong> aumentaron un 8% - considera alternativas.</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="mt-1 w-2 h-2 rounded-full bg-amber-500" />
                                        <span className="text-sm">Tu productividad los <strong>viernes</strong> es menor al promedio.</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="mt-1 w-2 h-2 rounded-full bg-amber-500" />
                                        <span className="text-sm">Establece un presupuesto para <strong>compras impulsivas</strong>.</span>
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </PageContainer>
    );
};

export default ReportPage;
