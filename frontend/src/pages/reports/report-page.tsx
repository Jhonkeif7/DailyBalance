import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import * as reportsService from "@/services/reports.service";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/Card";
import { PageContainer } from "@/components/ui/PageContainer";
import { StatCard } from "@/components/ui/StatCard";
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
    Sparkles,
} from "lucide-react";

// Tipos
interface CategoryData {
    name: string;
    amount: number;
    percentage: number;
    color: string;
}

interface MonthlyRow {
    month: string;
    income: number;
    expense: number;
}

interface TransactionSummary {
    category: string;
    income: number;
    expense: number;
    balance: number;
}

interface ProductivityRow {
    day: string;
    completed: number;
    total: number;
}

const currencyFmt = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

// Componente de gráfico de barras
function BarChartComponent({ data }: { data: MonthlyRow[] }) {
    if (data.length === 0) {
        return <p className="py-10 text-center text-sm text-muted-foreground">Sin datos para el período.</p>;
    }
    const maxValue = Math.max(1, ...data.flatMap(d => [d.income, d.expense]));

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

// Convierte una clase tailwind "bg-*" o un hex a un color CSS usable en SVG/inline.
const TAILWIND_HEX: Record<string, string> = {
    "bg-blue-500": "#3b82f6",
    "bg-emerald-500": "#10b981",
    "bg-amber-500": "#f59e0b",
    "bg-purple-500": "#a855f7",
    "bg-pink-500": "#ec4899",
    "bg-gray-500": "#6b7280",
    "bg-red-500": "#ef4444",
    "bg-green-500": "#22c55e",
    "bg-cyan-500": "#06b6d4",
    "bg-indigo-500": "#6366f1",
    "bg-orange-500": "#f97316",
    "bg-yellow-500": "#eab308",
};
const toCssColor = (color: string) => (color.startsWith("#") ? color : TAILWIND_HEX[color] ?? "#6b7280");

// Componente de gráfico circular
function PieChartComponent({ data }: { data: CategoryData[] }) {
    const total = data.reduce((sum, c) => sum + c.amount, 0);
    if (data.length === 0) {
        return <p className="py-10 text-center text-sm text-muted-foreground">Sin gastos registrados.</p>;
    }
    return (
        <div className="flex flex-col gap-4">
            {/* Círculo visual */}
            <div className="relative w-40 h-40 mx-auto">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    {data.map((category, index) => {
                        const offset = data.slice(0, index).reduce((sum, c) => sum + c.percentage, 0);
                        return (
                            <circle
                                key={category.name}
                                cx="50"
                                cy="50"
                                r="40"
                                fill="none"
                                stroke={toCssColor(category.color)}
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
                        <p className="text-2xl font-bold">{currencyFmt(total)}</p>
                        <p className="text-xs text-muted-foreground">Total</p>
                    </div>
                </div>
            </div>

            {/* Leyenda */}
            <div className="grid grid-cols-2 gap-2">
                {data.map((category) => (
                    <div key={category.name} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: toCssColor(category.color) }} />
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
    const [monthly, setMonthly] = useState<reportsService.MonthlyFinanceSummary[]>([]);
    const [expenses, setExpenses] = useState<reportsService.ExpenseByCategory[]>([]);
    const [daily, setDaily] = useState<reportsService.DailyProductivity[]>([]);
    const [, setLoading] = useState(true);

    useEffect(() => {
        let active = true;
        (async () => {
            try {
                const [m, e, d] = await Promise.all([
                    reportsService.getMonthlyFinanceSummary(),
                    reportsService.getExpensesByCategory(),
                    reportsService.getDailyProductivity(),
                ]);
                if (!active) return;
                setMonthly(m);
                setExpenses(e);
                setDaily(d);
            } catch (err) {
                console.error(err);
                toast.error("No se pudieron cargar los reportes");
            } finally {
                if (active) setLoading(false);
            }
        })();
        return () => {
            active = false;
        };
    }, []);

    // Etiqueta de mes legible a partir de "2026-01" o fecha ISO.
    const monthLabel = (month: string) => {
        const d = month.length === 7 ? new Date(`${month}-01T00:00:00`) : new Date(month);
        return isNaN(d.getTime())
            ? month
            : new Intl.DateTimeFormat("es-ES", { month: "short" }).format(d);
    };

    const barData: MonthlyRow[] = useMemo(
        () => monthly.map((m) => ({ month: monthLabel(m.month), income: m.income, expense: m.expenses })),
        [monthly]
    );

    const categoryData: CategoryData[] = useMemo(() => {
        const total = expenses.reduce((sum, e) => sum + e.total, 0);
        return expenses.map((e) => ({
            name: e.categoryName,
            amount: e.total,
            percentage: total > 0 ? Math.round((e.total / total) * 100) : 0,
            color: e.color,
        }));
    }, [expenses]);

    const summaryData: TransactionSummary[] = useMemo(
        () =>
            monthly.map((m) => ({
                category: monthLabel(m.month),
                income: m.income,
                expense: m.expenses,
                balance: m.balance,
            })),
        [monthly]
    );

    const productivityData: ProductivityRow[] = useMemo(
        () =>
            daily.map((d) => {
                const date = new Date(d.day);
                const label = isNaN(date.getTime())
                    ? d.day
                    : date.toLocaleDateString("es-ES", { weekday: "short" }).replace(".", "");
                return { day: label, completed: d.completed, total: d.total };
            }),
        [daily]
    );

    // KPIs financieros derivados.
    const totalIncome = monthly.reduce((s, m) => s + m.income, 0);
    const totalExpense = monthly.reduce((s, m) => s + m.expenses, 0);
    const netBalance = totalIncome - totalExpense;
    const monthlyAvg = monthly.length > 0 ? netBalance / monthly.length : 0;

    // KPIs de productividad derivados.
    const totalCompleted = daily.reduce((s, d) => s + d.completed, 0);
    const totalPlanned = daily.reduce((s, d) => s + d.total, 0);
    const successRate = totalPlanned > 0 ? Math.round((totalCompleted / totalPlanned) * 100) : 0;
    const productiveDays = daily.filter((d) => d.total > 0 && d.completed / d.total >= 0.8).length;
    const bestDay = productivityData.reduce<{ label: string; ratio: number }>(
        (best, d) => {
            const ratio = d.total > 0 ? d.completed / d.total : 0;
            return ratio > best.ratio ? { label: d.day, ratio } : best;
        },
        { label: "—", ratio: -1 }
    ).label;

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
                    <div className="grid grid-cols-2 gap-2 xl:grid-cols-4 xl:gap-4">
                        <StatCard
                            compactOnMobile
                            title="Ingresos Totales"
                            value={currencyFmt(totalIncome)}
                            description={`${monthly.length} meses`}
                            icon={<TrendingUp className="h-full w-full" />}
                            tone="success"
                        />
                        <StatCard
                            compactOnMobile
                            title="Gastos Totales"
                            value={currencyFmt(totalExpense)}
                            description={`${monthly.length} meses`}
                            icon={<TrendingDown className="h-full w-full" />}
                            tone="destructive"
                        />
                        <StatCard
                            compactOnMobile
                            title="Balance Neto"
                            value={currencyFmt(netBalance)}
                            description="Ahorro acumulado"
                            icon={<Wallet className="h-full w-full" />}
                            tone="primary"
                        />
                        <StatCard
                            compactOnMobile
                            title="Promedio Mensual"
                            value={currencyFmt(monthlyAvg)}
                            description="Ahorro por mes"
                            icon={<CreditCard className="h-full w-full" />}
                            tone="primary"
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
                                <BarChartComponent data={barData} />
                            </CardContent>
                        </Card>

                        {/* Gráfico circular */}
                        <Card className="bg-card/60 backdrop-blur border-border/60">
                            <CardHeader>
                                <CardTitle>Gastos por Categoría</CardTitle>
                                <CardDescription>Distribución del mes actual</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <PieChartComponent data={categoryData} />
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
                                {categoryData.length === 0 && (
                                    <p className="py-6 text-center text-sm text-muted-foreground">Sin gastos registrados.</p>
                                )}
                                {categoryData.map((category) => (
                                    <div key={category.name} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-9 h-9 rounded-lg flex items-center justify-center"
                                                    style={{ backgroundColor: `${toCssColor(category.color)}1a` }}
                                                >
                                                    <span
                                                        className="w-3 h-3 rounded-full"
                                                        style={{ backgroundColor: toCssColor(category.color) }}
                                                    />
                                                </div>
                                                <span className="font-medium">{category.name}</span>
                                            </div>
                                            <div className="text-right">
                                                <span className="font-semibold">{currencyFmt(category.amount)}</span>
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
                    <div className="grid grid-cols-2 gap-2 xl:grid-cols-4 xl:gap-4">
                        <StatCard
                            compactOnMobile
                            title="Tareas Completadas"
                            value={String(totalCompleted)}
                            description="En el período"
                            icon={<Target className="h-full w-full" />}
                            tone="primary"
                        />
                        <StatCard
                            compactOnMobile
                            title="Tasa de Éxito"
                            value={`${successRate}%`}
                            description="Completadas vs planeadas"
                            icon={<Sparkles className="h-full w-full" />}
                            tone="success"
                        />
                        <StatCard
                            compactOnMobile
                            title="Días Productivos"
                            value={`${productiveDays} días`}
                            description="Con 80% o más completado"
                            icon={<TrendingUp className="h-full w-full" />}
                            tone="success"
                        />
                        <StatCard
                            compactOnMobile
                            title="Mejor Día"
                            value={bestDay}
                            description="Día más productivo"
                            icon={<Calendar className="h-full w-full" />}
                            tone="primary"
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
                                {productivityData.length === 0 && (
                                    <p className="py-6 text-center text-sm text-muted-foreground">Sin actividad registrada.</p>
                                )}
                                {productivityData.map((day, index) => (
                                    <div key={`${day.day}-${index}`} className="space-y-2">
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
                            <SummaryTable data={summaryData} />
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
