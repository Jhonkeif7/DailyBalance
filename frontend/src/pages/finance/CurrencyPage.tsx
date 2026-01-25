import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    TrendingUp,
    TrendingDown,
    Plus,
    Search,
    Filter,
    DollarSign,
    CreditCard,
    Wallet,
    PiggyBank,
    ArrowUpRight,
    ArrowDownRight,
    MoreVertical,
    Calendar,
    Tag,
    Home,
    Car,
    Utensils,
    Gamepad2,
    Briefcase,
    Heart,
    Zap,
    Smartphone
} from "lucide-react";

// Interfaces
interface Transaction {
    id: string;
    description: string;
    amount: number;
    type: "income" | "expense";
    category: string;
    date: string;
    account: string;
}

interface Account {
    id: string;
    name: string;
    type: "bank" | "cash" | "credit" | "savings";
    balance: number;
    color: string;
}

interface Budget {
    id: string;
    category: string;
    limit: number;
    spent: number;
    color: string;
}

// Mock Data
const mockTransactions: Transaction[] = [
    { id: "1", description: "Salario mensual", amount: 3500, type: "income", category: "Trabajo", date: "2026-01-24", account: "Banco Principal" },
    { id: "2", description: "Supermercado", amount: 125.50, type: "expense", category: "Comida", date: "2026-01-24", account: "Tarjeta Crédito" },
    { id: "3", description: "Netflix", amount: 15.99, type: "expense", category: "Entretenimiento", date: "2026-01-23", account: "Banco Principal" },
    { id: "4", description: "Gasolina", amount: 45.00, type: "expense", category: "Transporte", date: "2026-01-22", account: "Efectivo" },
    { id: "5", description: "Freelance proyecto", amount: 800, type: "income", category: "Trabajo", date: "2026-01-21", account: "Banco Principal" },
    { id: "6", description: "Restaurante", amount: 65.00, type: "expense", category: "Comida", date: "2026-01-20", account: "Tarjeta Crédito" },
    { id: "7", description: "Luz", amount: 85.00, type: "expense", category: "Servicios", date: "2026-01-19", account: "Banco Principal" },
    { id: "8", description: "Gym mensualidad", amount: 40.00, type: "expense", category: "Salud", date: "2026-01-18", account: "Banco Principal" },
];

const mockAccounts: Account[] = [
    { id: "1", name: "Banco Principal", type: "bank", balance: 8450.00, color: "emerald" },
    { id: "2", name: "Efectivo", type: "cash", balance: 350.00, color: "amber" },
    { id: "3", name: "Tarjeta Crédito", type: "credit", balance: -1250.00, color: "red" },
    { id: "4", name: "Ahorros", type: "savings", balance: 5000.00, color: "blue" },
];

const mockBudgets: Budget[] = [
    { id: "1", category: "Comida", limit: 500, spent: 320, color: "orange" },
    { id: "2", category: "Transporte", limit: 200, spent: 145, color: "blue" },
    { id: "3", category: "Entretenimiento", limit: 150, spent: 89, color: "purple" },
    { id: "4", category: "Servicios", limit: 300, spent: 285, color: "cyan" },
    { id: "5", category: "Salud", limit: 100, spent: 40, color: "green" },
];

// Utility functions
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'USD' }).format(amount);
};

const getCategoryIcon = (category: string) => {
    const icons: Record<string, React.ReactNode> = {
        "Comida": <Utensils className="w-4 h-4" />,
        "Transporte": <Car className="w-4 h-4" />,
        "Entretenimiento": <Gamepad2 className="w-4 h-4" />,
        "Trabajo": <Briefcase className="w-4 h-4" />,
        "Servicios": <Zap className="w-4 h-4" />,
        "Salud": <Heart className="w-4 h-4" />,
        "Hogar": <Home className="w-4 h-4" />,
        "Tecnología": <Smartphone className="w-4 h-4" />,
    };
    return icons[category] || <Tag className="w-4 h-4" />;
};

const getAccountIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
        "bank": <CreditCard className="w-5 h-5" />,
        "cash": <Wallet className="w-5 h-5" />,
        "credit": <CreditCard className="w-5 h-5" />,
        "savings": <PiggyBank className="w-5 h-5" />,
    };
    return icons[type] || <DollarSign className="w-5 h-5" />;
};

// Components
function StatCard({ title, value, trend, trendValue, icon, color }: {
    title: string;
    value: string;
    trend?: "up" | "down";
    trendValue?: string;
    icon: React.ReactNode;
    color: string;
}) {
    return (
        <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">{title}</p>
                        <p className="text-xl sm:text-2xl font-bold mt-1 truncate">{value}</p>
                        {trend && trendValue && (
                            <div className={`flex items-center gap-1 mt-1 text-xs ${trend === "up" ? "text-emerald-500" : "text-red-500"}`}>
                                {trend === "up" ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                <span>{trendValue}</span>
                            </div>
                        )}
                    </div>
                    <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl bg-${color}-500/10 text-${color}-500 flex-shrink-0`}>
                        {icon}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function TransactionItem({ transaction }: { transaction: Transaction }) {
    return (
        <div className="flex items-center justify-between p-3 sm:p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors min-h-[60px] sm:min-h-[72px]">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                <div className={`p-2 rounded-lg flex-shrink-0 ${transaction.type === "income" ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}`}>
                    {getCategoryIcon(transaction.category)}
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-sm sm:text-base font-medium truncate">{transaction.description}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                        <span>{transaction.category}</span>
                        <span className="hidden sm:inline"> • {transaction.account} • {transaction.date}</span>
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                <span className={`text-sm sm:text-base font-semibold ${transaction.type === "income" ? "text-emerald-500" : "text-red-500"}`}>
                    {transaction.type === "income" ? "+" : "-"}{formatCurrency(transaction.amount)}
                </span>
                <Button variant="ghost" size="icon" className="h-8 w-8 hidden sm:flex">
                    <MoreVertical className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
}

function AccountCard({ account }: { account: Account }) {
    const colorClasses: Record<string, string> = {
        emerald: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
        amber: "bg-amber-500/10 text-amber-500 border-amber-500/20",
        red: "bg-red-500/10 text-red-500 border-red-500/20",
        blue: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    };

    return (
        <Card className={`border ${colorClasses[account.color] || colorClasses.emerald}`}>
            <CardContent className="p-4 sm:p-5">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${colorClasses[account.color]}`}>
                        {getAccountIcon(account.type)}
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">{account.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{account.type}</p>
                    </div>
                    <div className="text-right">
                        <p className={`font-bold ${account.balance < 0 ? "text-red-500" : ""}`}>
                            {formatCurrency(account.balance)}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function BudgetItem({ budget }: { budget: Budget }) {
    const percentage = Math.min((budget.spent / budget.limit) * 100, 100);
    const isOverBudget = budget.spent > budget.limit;

    return (
        <div className="p-3 sm:p-4 rounded-lg bg-muted/30">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    {getCategoryIcon(budget.category)}
                    <span className="text-sm font-medium">{budget.category}</span>
                </div>
                <div className="text-right">
                    <span className={`text-sm font-semibold ${isOverBudget ? "text-red-500" : ""}`}>
                        {formatCurrency(budget.spent)}
                    </span>
                    <span className="text-xs text-muted-foreground"> / {formatCurrency(budget.limit)}</span>
                </div>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all ${isOverBudget ? "bg-red-500" : "bg-emerald-500"}`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
            {isOverBudget && (
                <p className="text-xs text-red-500 mt-1">Excedido por {formatCurrency(budget.spent - budget.limit)}</p>
            )}
        </div>
    );
}

function CurrencyPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [transactions] = useState<Transaction[]>(mockTransactions);
    const [accounts] = useState<Account[]>(mockAccounts);
    const [budgets] = useState<Budget[]>(mockBudgets);

    // Calculate totals
    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
    const monthlyIncome = transactions.filter(t => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
    const monthlyExpenses = transactions.filter(t => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);

    // Filter transactions
    const filteredTransactions = transactions.filter(t =>
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <StatCard
                    title="Balance Total"
                    value={formatCurrency(totalBalance)}
                    trend="up"
                    trendValue="+8.2%"
                    icon={<DollarSign className="w-5 h-5" />}
                    color="emerald"
                />
                <StatCard
                    title="Ingresos del Mes"
                    value={formatCurrency(monthlyIncome)}
                    trend="up"
                    trendValue="+12.5%"
                    icon={<TrendingUp className="w-5 h-5" />}
                    color="emerald"
                />
                <StatCard
                    title="Gastos del Mes"
                    value={formatCurrency(monthlyExpenses)}
                    trend="down"
                    trendValue="-5.3%"
                    icon={<TrendingDown className="w-5 h-5" />}
                    color="red"
                />
                <StatCard
                    title="Ahorro del Mes"
                    value={formatCurrency(monthlyIncome - monthlyExpenses)}
                    trend="up"
                    trendValue="+18.7%"
                    icon={<PiggyBank className="w-5 h-5" />}
                    color="blue"
                />
            </div>

            {/* Tabs */}
            <Tabs defaultValue="transactions" className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <TabsList className="bg-muted/50">
                        <TabsTrigger value="transactions">Transacciones</TabsTrigger>
                        <TabsTrigger value="accounts">Cuentas</TabsTrigger>
                        <TabsTrigger value="budgets">Presupuestos</TabsTrigger>
                    </TabsList>
                    <Button className="bg-emerald-500 hover:bg-emerald-600 text-white gap-2">
                        <Plus className="w-4 h-4" />
                        <span className="hidden sm:inline">Nueva Transacción</span>
                        <span className="sm:hidden">Agregar</span>
                    </Button>
                </div>

                {/* Transactions Tab */}
                <TabsContent value="transactions" className="space-y-4">
                    {/* Search and Filter */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar transacciones..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" className="gap-2">
                                <Filter className="w-4 h-4" />
                                <span className="hidden sm:inline">Filtrar</span>
                            </Button>
                            <Button variant="outline" className="gap-2">
                                <Calendar className="w-4 h-4" />
                                <span className="hidden sm:inline">Enero 2026</span>
                            </Button>
                        </div>
                    </div>

                    {/* Transactions List */}
                    <Card className="bg-card/50 backdrop-blur border-border/50">
                        <CardHeader className="p-4 sm:p-6 pb-2">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-base sm:text-lg">Historial de Transacciones</CardTitle>
                                    <CardDescription className="text-xs sm:text-sm">{filteredTransactions.length} transacciones encontradas</CardDescription>
                                </div>
                                <div className="flex gap-2">
                                    <Badge variant="outline" className="text-emerald-500 border-emerald-500/50">
                                        +{formatCurrency(monthlyIncome)}
                                    </Badge>
                                    <Badge variant="outline" className="text-red-500 border-red-500/50">
                                        -{formatCurrency(monthlyExpenses)}
                                    </Badge>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6 pt-2">
                            <div className="space-y-2 sm:space-y-3">
                                {filteredTransactions.map((transaction) => (
                                    <TransactionItem key={transaction.id} transaction={transaction} />
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Accounts Tab */}
                <TabsContent value="accounts" className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold">Mis Cuentas</h3>
                            <p className="text-sm text-muted-foreground">Administra tus cuentas y balances</p>
                        </div>
                        <Button variant="outline" className="gap-2">
                            <Plus className="w-4 h-4" />
                            <span className="hidden sm:inline">Nueva Cuenta</span>
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        {accounts.map((account) => (
                            <AccountCard key={account.id} account={account} />
                        ))}
                    </div>

                    {/* Total Balance Card */}
                    <Card className="bg-gradient-to-r from-emerald-500/10 to-emerald-600/10 border-emerald-500/20">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Balance Total de Cuentas</p>
                                    <p className="text-3xl font-bold text-emerald-500">{formatCurrency(totalBalance)}</p>
                                </div>
                                <div className="p-4 rounded-xl bg-emerald-500/10">
                                    <Wallet className="w-8 h-8 text-emerald-500" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Budgets Tab */}
                <TabsContent value="budgets" className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold">Presupuestos</h3>
                            <p className="text-sm text-muted-foreground">Controla tus gastos por categoría</p>
                        </div>
                        <Button variant="outline" className="gap-2">
                            <Plus className="w-4 h-4" />
                            <span className="hidden sm:inline">Nuevo Presupuesto</span>
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <Card className="bg-card/50 backdrop-blur border-border/50">
                            <CardHeader className="p-4 sm:p-6 pb-2">
                                <CardTitle className="text-base sm:text-lg">Progreso Mensual</CardTitle>
                                <CardDescription className="text-xs sm:text-sm">Enero 2026</CardDescription>
                            </CardHeader>
                            <CardContent className="p-4 sm:p-6 pt-2 space-y-3">
                                {budgets.map((budget) => (
                                    <BudgetItem key={budget.id} budget={budget} />
                                ))}
                            </CardContent>
                        </Card>

                        <Card className="bg-card/50 backdrop-blur border-border/50">
                            <CardHeader className="p-4 sm:p-6 pb-2">
                                <CardTitle className="text-base sm:text-lg">Resumen de Presupuestos</CardTitle>
                                <CardDescription className="text-xs sm:text-sm">Estado general</CardDescription>
                            </CardHeader>
                            <CardContent className="p-4 sm:p-6 pt-2">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 rounded-lg bg-emerald-500/10">
                                        <div className="flex items-center gap-3">
                                            <TrendingUp className="w-5 h-5 text-emerald-500" />
                                            <span className="font-medium">Dentro del presupuesto</span>
                                        </div>
                                        <Badge className="bg-emerald-500">4</Badge>
                                    </div>
                                    <div className="flex items-center justify-between p-4 rounded-lg bg-red-500/10">
                                        <div className="flex items-center gap-3">
                                            <TrendingDown className="w-5 h-5 text-red-500" />
                                            <span className="font-medium">Excedidos</span>
                                        </div>
                                        <Badge variant="destructive">1</Badge>
                                    </div>
                                    <div className="pt-4 border-t">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">Total presupuestado</span>
                                            <span className="font-semibold">{formatCurrency(budgets.reduce((s, b) => s + b.limit, 0))}</span>
                                        </div>
                                        <div className="flex items-center justify-between mt-2">
                                            <span className="text-sm text-muted-foreground">Total gastado</span>
                                            <span className="font-semibold">{formatCurrency(budgets.reduce((s, b) => s + b.spent, 0))}</span>
                                        </div>
                                        <div className="flex items-center justify-between mt-2">
                                            <span className="text-sm text-muted-foreground">Disponible</span>
                                            <span className="font-semibold text-emerald-500">
                                                {formatCurrency(budgets.reduce((s, b) => s + (b.limit - b.spent), 0))}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

export default CurrencyPage;
