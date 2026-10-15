import { useEffect, useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/Card";
import { PageContainer } from "@/components/ui/PageContainer";
import { StatCard } from "@/components/ui/StatCard";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { TrendingUp, TrendingDown, Activity, DollarSign, Target, ArrowLeftRight } from "lucide-react";
import * as financeService from "@/services/finance.service";
import * as tasksService from "@/services/tasks.service";
import * as reportsService from "@/services/reports.service";
import { getUsdExchangeRates } from "@/services/exchange-rate.service";
import {
    computeFinanceTotals,
    deriveAccountBalances,
    type ExchangeRatesMap,
} from "@/pages/finance/finance-calc";
import { formatCurrency, todayInput } from "@/pages/finance/finance-utils";

// Fecha local en formato YYYY-MM-DD.
const toLocalDay = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const todayStr = todayInput();

function DashboardPage() {
    const [accounts, setAccounts] = useState<financeService.Account[]>([]);
    const [transactions, setTransactions] = useState<financeService.Transaction[]>([]);
    const [categories, setCategories] = useState<financeService.Category[]>([]);
    const [tasks, setTasks] = useState<tasksService.Task[]>([]);
    const [daily, setDaily] = useState<reportsService.DailyProductivity[]>([]);
    const [rates, setRates] = useState<ExchangeRatesMap | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;
        (async () => {
            try {
                const [acc, txs, cats, ts, prod, rateData] = await Promise.all([
                    financeService.getAccounts(),
                    financeService.getTransactions(),
                    financeService.getCategories(),
                    tasksService.getTasks(),
                    reportsService.getDailyProductivity(),
                    getUsdExchangeRates().catch(() => null),
                ]);
                if (!active) return;
                setAccounts(acc);
                setTransactions(txs);
                setCategories(cats);
                setTasks(ts);
                setDaily(prod);
                if (rateData) setRates(rateData.rates);
            } catch (err) {
                console.error(err);
                toast.error("No se pudieron cargar los datos del dashboard");
            } finally {
                if (active) setLoading(false);
            }
        })();
        return () => {
            active = false;
        };
    }, []);

    const categoryName = useMemo(() => {
        const map = new Map(categories.map((c) => [c.id, c.name]));
        return (id: string | null | undefined) => (id ? map.get(id) ?? "Sin categoría" : "Sin categoría");
    }, [categories]);

    const accountName = useMemo(() => {
        const map = new Map(accounts.map((a) => [a.id, a.name]));
        return (id: string | null | undefined) => (id ? map.get(id) ?? "Cuenta" : "Cuenta");
    }, [accounts]);

    const accountsView = useMemo(
        () => deriveAccountBalances(accounts, transactions, rates),
        [accounts, transactions, rates]
    );

    const totals = useMemo(
        () => computeFinanceTotals(accountsView, transactions, rates),
        [accountsView, transactions, rates]
    );

    const totalBalance = totals.totalBalance;
    const monthlyExpenses = totals.monthlyExpenses;
    const money = (n: number) => formatCurrency(n, totals.baseCurrency);
    const completedTasks = useMemo(() => tasks.filter((t) => t.completed).length, [tasks]);

    // Productividad: % completado promedio de los días con actividad (últimos 7).
    const weeklyDays = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const byDay = new Map<string, reportsService.DailyProductivity>();
        for (const d of daily) byDay.set(String(d.day).slice(0, 10), d);
        return Array.from({ length: 7 }, (_, i) => {
            const date = new Date(today);
            date.setDate(today.getDate() - (6 - i));
            const key = toLocalDay(date);
            const entry = byDay.get(key);
            const pct =
                entry && entry.total > 0
                    ? entry.percentage ?? Math.round((entry.completed / entry.total) * 100)
                    : 0;
            const label = date.toLocaleDateString("es-ES", { weekday: "short" }).replace(".", "");
            return { key, label, percentage: Math.max(0, Math.min(100, pct)), hasData: !!entry && entry.total > 0 };
        });
    }, [daily]);

    const productivity = useMemo(() => {
        const active = weeklyDays.filter((d) => d.hasData);
        if (active.length === 0) return 0;
        return Math.round(active.reduce((s, d) => s + d.percentage, 0) / active.length);
    }, [weeklyDays]);

    // Tareas con vencimiento hoy.
    const todayTasks = useMemo(
        () => tasks.filter((t) => (t.dueDate ?? "") === todayStr),
        [tasks]
    );
    const todayDone = todayTasks.filter((t) => t.completed).length;

    // Actividad reciente: movimientos de hoy; si no hay, los más recientes.
    const recentActivity = useMemo(() => {
        const todays = transactions.filter((t) => (t.date ?? "") === todayStr);
        const source = todays.length > 0 ? todays : transactions.slice(0, 5);
        return source.slice(0, 5);
    }, [transactions]);

    const relTime = (dateStr: string) => {
        if (!dateStr) return "";
        if (dateStr === todayStr) return "Hoy";
        const d = new Date(`${dateStr}T00:00:00`);
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        if (dateStr === toLocalDay(yesterday)) return "Ayer";
        return new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short" }).format(d);
    };

    return (
        <PageContainer>
            {/* Stats Grid - Mobile: 2 cols compactos, Desktop: 4 cols */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
                <StatCard
                    compactOnMobile
                    title="Balance Total"
                    value={loading ? "—" : money(totalBalance)}
                    description={
                        totals.hasMultipleCurrencies
                            ? `En ${totals.baseCurrency} · ${accounts.length} cuentas`
                            : `En ${accounts.length} ${accounts.length === 1 ? "cuenta" : "cuentas"}`
                    }
                    tone="primary"
                    icon={<DollarSign className="h-full w-full" />}
                />
                <StatCard
                    compactOnMobile
                    title="Gastos del Mes"
                    value={loading ? "—" : money(monthlyExpenses)}
                    description="Confirmados · sin transferencias"
                    tone="destructive"
                    icon={<TrendingDown className="h-full w-full" />}
                />
                <StatCard
                    compactOnMobile
                    title="Tareas Completadas"
                    value={loading ? "—" : String(completedTasks)}
                    description={`De ${tasks.length} ${tasks.length === 1 ? "tarea" : "tareas"}`}
                    tone="success"
                    icon={<Target className="h-full w-full" />}
                />
                <StatCard
                    compactOnMobile
                    title="Productividad"
                    value={loading ? "—" : `${productivity}%`}
                    description="Promedio últimos 7 días"
                    tone="primary"
                    icon={<Activity className="h-full w-full" />}
                />
            </div>

            {/* Charts Section - Stack en móvil, side-by-side en desktop */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
                {/* Main Chart - Full width en móvil, 2/3 en desktop */}
                <Card className="lg:col-span-2 bg-card/60 backdrop-blur border-border/60">
                    <CardHeader className="p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div>
                                <CardTitle className="text-base sm:text-lg">Actividad Semanal</CardTitle>
                                <CardDescription className="text-xs sm:text-sm">Productividad de los últimos 7 días</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                        {/* Chart - Altura responsive */}
                        <div className="h-48 sm:h-56 md:h-64 flex items-end justify-between gap-1 sm:gap-2 px-2 sm:px-4">
                            {weeklyDays.map((day) => (
                                <div key={day.key} className="flex-1 flex flex-col items-center gap-1.5 sm:gap-2">
                                    <div className="w-full flex-1 flex items-end">
                                        <div
                                            className="w-full bg-gradient-to-t from-primary to-primary/60 rounded-t-sm sm:rounded-t-md transition-all duration-300 hover:from-primary/90 hover:to-primary/50"
                                            style={{ height: `${Math.max(day.percentage, 2)}%` }}
                                            title={`${day.percentage}% completado`}
                                        />
                                    </div>
                                    <span className="text-[10px] sm:text-xs text-muted-foreground">
                                        <span className="hidden xs:inline">{day.label}</span>
                                        <span className="xs:hidden">{day.label.charAt(0)}</span>
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Side Card - Tareas de Hoy */}
                <Card className="bg-card/60 backdrop-blur border-border/60">
                    <CardHeader className="p-4 sm:p-6">
                        <CardTitle className="text-base sm:text-lg">Tareas de Hoy</CardTitle>
                        <CardDescription className="text-xs sm:text-sm">
                            {todayTasks.length === 0
                                ? "Sin tareas para hoy"
                                : `${todayDone} de ${todayTasks.length} completadas`}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                        {todayTasks.length === 0 ? (
                            <div className="py-8 text-center text-xs sm:text-sm text-muted-foreground">
                                No tienes tareas con vencimiento hoy.
                            </div>
                        ) : (
                            <div className="space-y-2 sm:space-y-3">
                                {todayTasks.slice(0, 6).map((item) => (
                                    <div
                                        key={item.id}
                                        className={`
                                            flex items-center gap-2.5 sm:gap-3 
                                            p-2.5 sm:p-3 rounded-lg 
                                            transition-colors
                                            min-h-[44px]
                                            ${item.completed
                                                ? "bg-success/10 text-success"
                                                : "bg-muted/50 text-muted-foreground"
                                            }
                                        `}
                                    >
                                        <div className={`
                                            w-5 h-5 sm:w-5 sm:h-5 rounded-full border-2 
                                            flex items-center justify-center flex-shrink-0
                                            ${item.completed
                                                ? "border-success bg-success"
                                                : "border-muted-foreground"
                                            }
                                        `}>
                                            {item.completed && (
                                                <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-success-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </div>
                                        <span className={`text-xs sm:text-sm truncate ${item.completed ? "line-through" : ""}`}>
                                            {item.title}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity */}
            <Card className="bg-card/60 backdrop-blur border-border/60">
                <CardHeader className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                            <CardTitle className="text-base sm:text-lg">Actividad Reciente</CardTitle>
                            <CardDescription className="text-xs sm:text-sm">Tus movimientos de hoy</CardDescription>
                        </div>
                        <Link
                            to="/currency"
                            className="text-xs sm:text-sm text-primary hover:underline self-start sm:self-auto min-h-[44px] flex items-center"
                        >
                            Ver todo
                        </Link>
                    </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                    {recentActivity.length === 0 ? (
                        <div className="py-8 text-center text-xs sm:text-sm text-muted-foreground">
                            No hay movimientos para mostrar.
                        </div>
                    ) : (
                        <div className="space-y-2 sm:space-y-4">
                            {recentActivity.map((item) => {
                                const isIncome = item.type === "income";
                                const isTransfer = item.type === "transfer";
                                const sign = isIncome ? "+" : isTransfer ? "" : "-";
                                const currency =
                                    accounts.find((a) => a.id === item.accountId)?.currency ?? totals.baseCurrency;
                                const name = isTransfer
                                    ? `${accountName(item.accountId)} → ${accountName(item.transferAccountId)}`
                                    : item.description?.trim() || categoryName(item.categoryId);
                                const subtitle = isTransfer
                                    ? "Transferencia"
                                    : categoryName(item.categoryId);
                                return (
                                    <div
                                        key={item.id}
                                        className="
                                            flex items-center justify-between 
                                            p-3 sm:p-4 rounded-lg 
                                            bg-muted/30 hover:bg-muted/50 
                                            transition-colors
                                            min-h-[60px] sm:min-h-[72px]
                                        "
                                    >
                                        <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                                            <div className={`
                                                p-1.5 sm:p-2 rounded-md sm:rounded-lg flex-shrink-0
                                                ${isIncome
                                                    ? "bg-success/10 text-success"
                                                    : isTransfer
                                                      ? "bg-muted text-foreground"
                                                      : "bg-destructive/10 text-destructive"
                                                }
                                            `}>
                                                {isIncome ? (
                                                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
                                                ) : isTransfer ? (
                                                    <ArrowLeftRight className="w-4 h-4 sm:w-5 sm:h-5" />
                                                ) : (
                                                    <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5" />
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm sm:text-base font-medium text-foreground truncate">{name}</p>
                                                <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                                                    <span>{subtitle}</span>
                                                    <span className="hidden sm:inline"> • {relTime(item.date)}</span>
                                                </p>
                                            </div>
                                        </div>
                                        <span className={`
                                            text-sm sm:text-base font-semibold flex-shrink-0 ml-2
                                            ${isIncome ? "text-success" : isTransfer ? "text-foreground" : "text-destructive"}
                                        `}>
                                            {sign}{formatCurrency(item.amount, currency)}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </PageContainer>
    );
}

export default DashboardPage;
