import React, { useState, useMemo } from "react";
import { useFinance } from "../context/FinanceContext";
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import {
    TrendingUp,
    TrendingDown,
    Plus,
    History,
    PieChart as PieChartIcon,
    DollarSign,
    ArrowUpRight,
    ArrowDownRight,
    Wallet,
    Activity,
    Layers,
    Calculator,
    Target,
    ChevronDown,
    X,
    PlusCircle,
    BarChart3,
    MoreVertical,
    Trash2,
    AlertCircle
} from "lucide-react";
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    AreaChart,
    Area
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { InvestmentType, TransactionType, DividendType, Investment } from "../types";
import clsx from "clsx";

// Premium Color Palette
const COLORS = ["#18181b", "#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export const Investments: React.FC = () => {
    const {
        investments,
        transactions,
        dividends,
        addInvestment,
        addTransaction,
        addDividend,
        deleteInvestment,
        deleteTransaction,
        deleteDividend
    } = useFinance();

    const [activeTab, setActiveTab] = useState<"dashboard" | "assets" | "history">("dashboard");
    const [isAporteModalOpen, setIsAporteModalOpen] = useState(false);
    const [isDividendModalOpen, setIsDividendModalOpen] = useState(false);
    const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
    const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
    const [selectedHistoryInvestment, setSelectedHistoryInvestment] = useState<Investment | null>(null);
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);

    // Stats Calculations
    const totalInvested = useMemo(() =>
        investments.reduce((acc, curr) => acc + (curr.shares * curr.avgPrice), 0)
        , [investments]);

    const currentValue = useMemo(() =>
        investments.reduce((acc, curr) => acc + (curr.shares * curr.currentPrice), 0)
        , [investments]);

    const allTimeDividends = useMemo(() =>
        dividends.reduce((acc, curr) => acc + curr.amount, 0)
        , [dividends]);

    const totalProfit = (currentValue - totalInvested) + allTimeDividends;
    const profitPercentage = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;
    const portfolioYOC = totalInvested > 0 ? (allTimeDividends / totalInvested) * 100 : 0;

    const monthlyDividends = useMemo(() => {
        const now = new Date();
        const start = startOfMonth(now);
        const end = endOfMonth(now);
        return dividends
            .filter(d => isWithinInterval(parseISO(d.date), { start, end }))
            .reduce((acc, curr) => acc + curr.amount, 0);
    }, [dividends]);

    const yearDividends = useMemo(() => {
        const year = new Date().getFullYear();
        return dividends
            .filter(d => parseISO(d.date).getFullYear() === year)
            .reduce((acc, curr) => acc + curr.amount, 0);
    }, [dividends]);

    // Chart Data
    const distributionData = useMemo(() => {
        const types: Record<string, number> = {};
        investments.forEach(inv => {
            const value = inv.shares * inv.currentPrice;
            types[inv.type] = (types[inv.type] || 0) + value;
        });
        return Object.entries(types).map(([name, value]) => ({ name, value }));
    }, [investments]);

    const monthlyIncomeData = useMemo(() => {
        const months: Record<string, number> = {};
        const last6Months = Array.from({ length: 6 }).map((_, i) => {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            return format(d, "MMM/yy");
        }).reverse();

        last6Months.forEach(m => months[m] = 0);

        dividends.forEach(d => {
            const m = format(parseISO(d.date), "MMM/yy");
            if (months[m] !== undefined) {
                months[m] += d.amount;
            }
        });

        return Object.entries(months).map(([name, value]) => ({ name, value }));
    }, [dividends]);

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-zinc-900 border-none rounded-2xl p-4 shadow-2xl text-white">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{payload[0].payload.name}</p>
                    <p className="text-sm font-bold">R$ {payload[0].value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
            );
        }
        return null;
    };

    const renderDashboard = () => (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    className="bg-white p-6 rounded-[32px] shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-slate-100/60 transition-all hover:border-slate-200"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-zinc-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-zinc-200">
                            <Wallet size={18} strokeWidth={2.5} />
                        </div>
                        <h3 className="text-[12px] font-black text-slate-400 tracking-widest uppercase">Patrimônio</h3>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[28px] font-black tracking-tight text-zinc-900 leading-none">
                            R$ {currentValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </p>
                        <div className="flex items-center gap-1.5 pt-1">
                            <div className={clsx(
                                "flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-bold",
                                totalProfit >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                            )}>
                                {totalProfit >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                {profitPercentage.toFixed(1)}%
                            </div>
                            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wide">Saldo</span>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
                    className="bg-white p-6 rounded-[32px] shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-slate-100/60 transition-all hover:border-slate-200"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-emerald-100">
                            <TrendingUp size={18} strokeWidth={2.5} />
                        </div>
                        <h3 className="text-[12px] font-black text-slate-400 tracking-widest uppercase">Rentabilidade Total</h3>
                    </div>
                    <div className="space-y-1">
                        <p className={clsx("text-[28px] font-black tracking-tight leading-none", totalProfit >= 0 ? "text-emerald-600" : "text-rose-600")}>
                            {totalProfit >= 0 ? "+" : "-"}R$ {Math.abs(totalProfit).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wide pt-1">Valorização + Dividendos</p>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
                    className="bg-zinc-900 p-6 rounded-[32px] shadow-2xl shadow-zinc-200 border border-zinc-800 transition-all hover:-translate-y-1"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center text-white backdrop-blur-md">
                            <DollarSign size={18} strokeWidth={2.5} />
                        </div>
                        <h3 className="text-[12px] font-black text-zinc-400 tracking-widest uppercase">Renda Acumulada</h3>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[28px] font-black tracking-tight text-white leading-none">
                            R$ {allTimeDividends.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-wide pt-1">Total de Proventos</p>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}
                    className="bg-white p-6 rounded-[32px] shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-slate-100/60 transition-all hover:border-slate-200"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-amber-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-amber-100">
                            <Activity size={18} strokeWidth={2.5} />
                        </div>
                        <h3 className="text-[12px] font-black text-slate-400 tracking-widest uppercase">Yield on Cost</h3>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[28px] font-black tracking-tight text-zinc-900 leading-none">
                            {portfolioYOC.toFixed(2)}%
                        </p>
                        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wide pt-1">Retorno Médio em Proventos</p>
                    </div>
                </motion.div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Pie Chart Card */}
                <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.04)] relative overflow-hidden">
                    <div className="flex justify-between items-center mb-10">
                        <h4 className="text-[16px] font-black text-zinc-900 flex items-center gap-3">
                            <div className="w-1.5 h-8 bg-zinc-900 rounded-full" />
                            Alocação de Carteira
                        </h4>
                        <div className="text-[11px] font-black bg-slate-50 px-3 py-1 rounded-full text-slate-400 tracking-tighter">TOTAL: R$ {currentValue.toFixed(0)}</div>
                    </div>

                    <div className="h-[320px] w-full relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={distributionData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={110}
                                    paddingAngle={8}
                                    dataKey="value"
                                    animationBegin={200}
                                >
                                    {distributionData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={COLORS[index % COLORS.length]}
                                            stroke="transparent"
                                        />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Center Label */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Ativos</p>
                            <p className="text-xl font-black text-zinc-900 leading-none">{investments.length}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 mt-8">
                        {distributionData.map((d, i) => (
                            <div key={d.name} className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                                <div className="min-w-0">
                                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-tighter truncate">{d.name}</p>
                                    <p className="text-xs font-black text-zinc-900">{((d.value / currentValue) * 100).toFixed(1)}%</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bar Chart Card */}
                <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.04)]">
                    <div className="flex justify-between items-center mb-10">
                        <h4 className="text-[16px] font-black text-zinc-900 flex items-center gap-3">
                            <div className="w-1.5 h-8 bg-indigo-500 rounded-full" />
                            Progressão de Renda
                        </h4>
                        <div className="p-2 bg-indigo-50 text-indigo-500 rounded-xl">
                            <BarChart3 size={20} />
                        </div>
                    </div>

                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlyIncomeData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#6366f1" stopOpacity={1} />
                                        <stop offset="100%" stopColor="#818cf8" stopOpacity={0.8} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 700 }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 700 }}
                                />
                                <Tooltip
                                    cursor={{ fill: '#f8fafc', radius: 12 }}
                                    content={<CustomTooltip />}
                                />
                                <Bar
                                    dataKey="value"
                                    fill="url(#barGradient)"
                                    radius={[12, 12, 4, 4]}
                                    barSize={32}
                                    animationDuration={1500}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <p className="text-[11px] text-center text-slate-400 font-bold uppercase tracking-widest mt-6">Histórico dos últimos 6 meses</p>
                </div>
            </div>
        </div>
    );

    const renderAssets = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {investments.map((inv) => {
                    const invested = inv.shares * inv.avgPrice;
                    const current = inv.shares * inv.currentPrice;

                    const assetDividends = dividends
                        .filter(d => d.investmentId === inv.id)
                        .reduce((acc, curr) => acc + curr.amount, 0);

                    const realProfit = (current - invested) + assetDividends;
                    const realProfitPct = invested > 0 ? (realProfit / invested) * 100 : 0;
                    const divReturnPct = invested > 0 ? (assetDividends / invested) * 100 : 0;

                    return (
                        <motion.div
                            key={inv.id}
                            layoutId={inv.id}
                            className="bg-white p-7 rounded-[40px] border border-slate-100 shadow-[0_2px_15px_rgba(0,0,0,0.02)] group hover:shadow-[0_15px_40px_rgba(0,0,0,0.08)] hover:scale-[1.02] transition-all cursor-pointer relative overflow-hidden"
                        >
                            {/* Background accent */}
                            <div className={clsx(
                                "absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full blur-3xl opacity-10",
                                realProfit >= 0 ? "bg-emerald-500" : "bg-rose-500"
                            )} />

                            <div className="flex justify-between items-start mb-8 relative z-10">
                                <div>
                                    <h3 className="text-xl font-black text-zinc-900 leading-tight">{inv.name}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded-md">{inv.type}</span>
                                        <span className="w-1 h-1 bg-slate-300 rounded-full" />
                                        <span className="text-[10px] font-bold text-slate-500">{inv.shares} cotas</span>
                                    </div>
                                </div>
                                <div className={clsx(
                                    "px-3 py-1.5 rounded-2xl text-[12px] font-black shadow-sm",
                                    realProfit >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                                )}>
                                    {realProfit >= 0 ? "+" : ""}{realProfitPct.toFixed(1)}%
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-y-6 gap-x-4 mb-8 relative z-10">
                                <div>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1.5 flex items-center gap-1">
                                        Valor Investido
                                    </p>
                                    <p className="text-[16px] font-black text-zinc-900 leading-none">R$ {invested.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1.5 flex items-center gap-1">
                                        Patrimônio
                                    </p>
                                    <p className="text-[16px] font-black text-indigo-600 leading-none">R$ {current.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                </div>
                                <div className="col-span-1">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1.5 flex items-center gap-1 text-emerald-600">
                                        Dividendos
                                    </p>
                                    <p className="text-[16px] font-black text-emerald-600 leading-none">R$ {assetDividends.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                </div>
                                <div className="col-span-1">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1.5 flex items-center gap-1">
                                        Yield on Cost
                                    </p>
                                    <p className="text-[16px] font-black text-zinc-900 leading-none">{divReturnPct.toFixed(2)}%</p>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-50 flex justify-between items-center relative z-20">
                                <div className="relative">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveMenuId(activeMenuId === inv.id ? null : inv.id);
                                        }}
                                        className="w-10 h-10 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center hover:bg-slate-100 transition-all shadow-sm"
                                        title="Mais Opções"
                                    >
                                        <MoreVertical size={18} />
                                    </button>

                                    <AnimatePresence>
                                        {activeMenuId === inv.id && (
                                            <>
                                                <div
                                                    className="fixed inset-0 z-30"
                                                    onClick={(e) => { e.stopPropagation(); setActiveMenuId(null); }}
                                                />
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                                    className="absolute bottom-12 left-0 w-48 bg-white rounded-3xl shadow-2xl border border-slate-100 p-2 z-40 overflow-hidden"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <button
                                                        onClick={() => {
                                                            setSelectedHistoryInvestment(inv);
                                                            setActiveMenuId(null);
                                                        }}
                                                        className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-2xl transition-all text-sm font-bold"
                                                    >
                                                        <History size={16} />
                                                        Ver Histórico
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setItemToDelete(inv.id);
                                                            setActiveMenuId(null);
                                                        }}
                                                        className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-rose-50 hover:text-rose-500 rounded-2xl transition-all text-sm font-bold"
                                                    >
                                                        <Trash2 size={16} />
                                                        Excluir Ativo
                                                    </button>
                                                </motion.div>
                                            </>
                                        )}
                                    </AnimatePresence>
                                </div>
                                <div className={clsx(
                                    "flex items-center gap-2.5 px-4 py-2.5 rounded-2xl font-black text-[11px] shadow-sm tracking-tighter uppercase",
                                    realProfit >= 0 ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"
                                )}>
                                    {realProfit >= 0 ? <TrendingUp size={14} strokeWidth={4} /> : <TrendingDown size={14} strokeWidth={3} />}
                                    <span>{realProfit >= 0 ? "Ganho Real" : "Prejuízo Real"} R$ {Math.abs(realProfit).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}

                <button
                    onClick={() => setIsAporteModalOpen(true)}
                    className="bg-slate-50/50 border-3 border-dashed border-slate-200 rounded-[40px] p-8 flex flex-col items-center justify-center gap-4 text-slate-400 hover:border-zinc-900 hover:bg-white hover:text-zinc-900 transition-all min-h-[300px] group"
                >
                    <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-lg shadow-slate-200/50 group-hover:scale-110 group-hover:bg-zinc-900 group-hover:text-white transition-all">
                        <Plus size={32} strokeWidth={2.5} />
                    </div>
                    <span className="text-[15px] font-black uppercase tracking-widest">Novo Aporte</span>
                </button>
            </div>
        </div>
    );

    return (
        <div className="space-y-8 pb-32 md:pb-10 relative">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12">
                <div className="space-y-1">
                    <h1 className="text-[34px] font-black text-zinc-900 tracking-tighter leading-tight">Investimentos</h1>
                    <p className="text-[15px] text-slate-400 font-bold uppercase tracking-widest">Gestão de Patrimônio</p>
                </div>

                {/* Desktop Actions */}
                <div className="hidden lg:flex flex-wrap gap-3">
                    <button
                        onClick={() => setIsCalculatorOpen(true)}
                        className="h-12 bg-white text-indigo-600 px-6 rounded-2xl font-black flex items-center gap-2.5 hover:bg-indigo-50 transition-all border border-indigo-100 shadow-sm"
                    >
                        <Calculator size={18} strokeWidth={2.5} />
                        Simulador
                    </button>
                    <button
                        onClick={() => setIsDividendModalOpen(true)}
                        className="h-12 bg-white text-emerald-600 px-6 rounded-2xl font-black flex items-center gap-2.5 hover:bg-emerald-50 transition-all border border-emerald-100 shadow-sm"
                    >
                        <DollarSign size={18} strokeWidth={2.5} />
                        Dividendo
                    </button>
                    <button
                        onClick={() => setIsAporteModalOpen(true)}
                        className="h-12 bg-zinc-900 text-white px-6 rounded-2xl font-black flex items-center gap-2.5 hover:bg-black transition-all shadow-xl shadow-zinc-200"
                    >
                        <PlusCircle size={18} strokeWidth={2.5} />
                        Novo Aporte
                    </button>
                </div>
            </header>

            {/* Internal Tabs - Redesigned */}
            <div className="flex bg-slate-100/60 p-1.5 rounded-[28px] border border-slate-100/50 w-full sm:w-fit overflow-x-auto no-scrollbar shadow-inner">
                {[
                    { id: "dashboard", label: "Dashboard", icon: PieChartIcon },
                    { id: "assets", label: "Minha Carteira", icon: Layers },
                ].map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={clsx(
                                "flex items-center gap-2.5 px-6 py-3 rounded-[22px] text-[13px] font-black transition-all whitespace-nowrap",
                                isActive ? "bg-white text-zinc-900 shadow-lg shadow-slate-200/50" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            <Icon size={16} strokeWidth={2.5} />
                            {tab.label}
                        </button>
                    )
                })}
            </div>

            <main className="relative z-10">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {activeTab === "dashboard" && renderDashboard()}
                        {activeTab === "assets" && renderAssets()}
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* MOBILE ACTION BUTTON - Consolidated */}
            <div className="fixed bottom-24 right-6 lg:hidden z-50">
                <AnimatePresence>
                    {isActionMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.9 }}
                            className="absolute bottom-20 right-0 flex flex-col gap-3 min-w-[220px]"
                        >
                            <button
                                onClick={() => { setIsCalculatorOpen(true); setIsActionMenuOpen(false); }}
                                className="bg-white border border-indigo-100 p-4 rounded-3xl flex items-center gap-4 shadow-2xl"
                            >
                                <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                                    <Calculator size={20} />
                                </div>
                                <span className="font-black text-zinc-800 text-sm">Simulador</span>
                            </button>
                            <button
                                onClick={() => { setIsDividendModalOpen(true); setIsActionMenuOpen(false); }}
                                className="bg-white border border-emerald-100 p-4 rounded-3xl flex items-center gap-4 shadow-2xl"
                            >
                                <div className="w-10 h-10 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                                    <DollarSign size={20} />
                                </div>
                                <span className="font-black text-zinc-800 text-sm">Dividendo</span>
                            </button>
                            <button
                                onClick={() => { setIsAporteModalOpen(true); setIsActionMenuOpen(false); }}
                                className="bg-zinc-900 p-4 rounded-3xl flex items-center gap-4 shadow-2xl"
                            >
                                <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center text-white">
                                    <Plus size={20} />
                                </div>
                                <span className="font-black text-white text-sm">Novo Aporte</span>
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <button
                    onClick={() => setIsActionMenuOpen(!isActionMenuOpen)}
                    className={clsx(
                        "w-16 h-16 rounded-[24px] flex items-center justify-center shadow-2xl transition-all duration-300",
                        isActionMenuOpen ? "bg-rose-500 text-white rotate-135" : "bg-zinc-900 text-white"
                    )}
                >
                    {isActionMenuOpen ? <X size={28} strokeWidth={3} /> : <Plus size={28} strokeWidth={3} />}
                </button>
            </div>

            {/* Modals Layer */}
            <AnimatePresence>
                {isAporteModalOpen && (
                    <AporteModal
                        onClose={() => setIsAporteModalOpen(false)}
                        onAporte={addTransaction}
                        addInvestment={addInvestment}
                        investments={investments}
                    />
                )}
                {isDividendModalOpen && (
                    <DividendModal
                        onClose={() => setIsDividendModalOpen(false)}
                        onDividend={addDividend}
                        investments={investments}
                    />
                )}
                {isCalculatorOpen && (
                    <CalculatorModal
                        onClose={() => setIsCalculatorOpen(false)}
                    />
                )}
                {selectedHistoryInvestment && (
                    <HistoryModal
                        investment={selectedHistoryInvestment}
                        transactions={transactions.filter(t => t.investmentId === selectedHistoryInvestment.id)}
                        dividends={dividends.filter(d => d.investmentId === selectedHistoryInvestment.id)}
                        onDeleteTransaction={deleteTransaction}
                        onDeleteDividend={deleteDividend}
                        onClose={() => setSelectedHistoryInvestment(null)}
                    />
                )}
                {itemToDelete && (
                    <DeleteConfirmationModal
                        onConfirm={() => {
                            deleteInvestment(itemToDelete);
                            setItemToDelete(null);
                        }}
                        onCancel={() => setItemToDelete(null)}
                        itemName={investments.find(i => i.id === itemToDelete)?.name || ""}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

const HistoryModal = ({ investment, transactions, dividends, onDeleteTransaction, onDeleteDividend, onClose }: any) => {
    const [activeTab, setActiveTab] = useState<"transactions" | "dividends">("transactions");

    return (
        <div className="fixed inset-0 bg-zinc-900/60 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 z-[9999]">
            <motion.div
                initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }}
                className="bg-white rounded-t-[40px] sm:rounded-[48px] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
                <div className="p-10 pb-4 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-black text-zinc-900">Histórico</h2>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{investment.name}</p>
                    </div>
                    <button onClick={onClose} className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 transition-colors">
                        <X size={20} strokeWidth={3} />
                    </button>
                </div>

                {/* Internal Tabs */}
                <div className="px-10 flex gap-4 border-b border-slate-50">
                    <button
                        onClick={() => setActiveTab("transactions")}
                        className={clsx(
                            "pb-4 text-[13px] font-black uppercase tracking-widest transition-all relative",
                            activeTab === "transactions" ? "text-zinc-900" : "text-slate-300 hover:text-slate-400"
                        )}
                    >
                        Aportes ({transactions.length})
                        {activeTab === "transactions" && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-900 rounded-full" />}
                    </button>
                    <button
                        onClick={() => setActiveTab("dividends")}
                        className={clsx(
                            "pb-4 text-[13px] font-black uppercase tracking-widest transition-all relative",
                            activeTab === "dividends" ? "text-emerald-600" : "text-slate-300 hover:text-slate-400"
                        )}
                    >
                        Dividendos ({dividends.length})
                        {activeTab === "dividends" && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500 rounded-full" />}
                    </button>

                    {activeTab === "dividends" && dividends.length > 0 && (
                        <button
                            onClick={() => {
                                if (confirm(`Deseja limpar todos os ${dividends.length} dividendos de ${investment.name}?`)) {
                                    dividends.forEach((d: any) => onDeleteDividend(d.id));
                                }
                            }}
                            className="ml-auto pb-4 text-[11px] font-black text-rose-400 hover:text-rose-600 uppercase tracking-widest transition-all"
                        >
                            Limpar Tudo
                        </button>
                    )}
                </div>

                <div className="p-10 pt-6 overflow-y-auto custom-scrollbar flex-1">
                    {activeTab === "transactions" ? (
                        transactions.length === 0 ? (
                            <div className="text-center py-10 text-slate-400 font-bold uppercase tracking-widest">Nenhum aporte encontrado.</div>
                        ) : (
                            <div className="space-y-4">
                                {transactions.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((t: any) => (
                                    <div key={t.id} className="flex items-center justify-between p-5 bg-slate-50 rounded-[24px] border border-slate-100/50 group">
                                        <div className="flex items-center gap-4">
                                            <div className={clsx("w-10 h-10 rounded-2xl flex items-center justify-center", t.type === "Compra" ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600")}>
                                                {t.type === "Compra" ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-zinc-900">{t.type}</p>
                                                <p className="text-[11px] font-bold text-slate-400">{format(parseISO(t.date), "dd/MM/yyyy")}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="text-right">
                                                <p className="text-sm font-black text-zinc-900">{t.shares} cotas</p>
                                                <p className="text-[11px] font-bold text-slate-500">R$ {t.pricePerShare.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / cota</p>
                                            </div>
                                            <button
                                                onClick={() => { if (confirm('Excluir este aporte?')) onDeleteTransaction(t.id); }}
                                                className="w-8 h-8 rounded-xl bg-rose-50 text-rose-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-100 hover:text-rose-600"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                    ) : (
                        dividends.length === 0 ? (
                            <div className="text-center py-10 text-slate-400 font-bold uppercase tracking-widest">Nenhum dividendo encontrado.</div>
                        ) : (
                            <div className="space-y-4">
                                {dividends.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((d: any) => (
                                    <div key={d.id} className="flex items-center justify-between p-5 bg-emerald-50/30 rounded-[24px] border border-emerald-100/50 group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
                                                <DollarSign size={18} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-zinc-900">{d.type}</p>
                                                <p className="text-[11px] font-bold text-slate-400">{format(parseISO(d.date), "dd/MM/yyyy")}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="text-right">
                                                <p className="text-sm font-black text-emerald-600">+ R$ {d.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Recebido</p>
                                            </div>
                                            <button
                                                onClick={() => { if (confirm('Excluir este dividendo?')) onDeleteDividend(d.id); }}
                                                className="w-8 h-8 rounded-xl bg-rose-50 text-rose-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-100 hover:text-rose-600"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                    )}
                </div>
            </motion.div>
        </div>
    );
};

// Modal Components (AporteModal and DividendModal remains largely the same but with style updates for consistency)
const AporteModal = ({ onClose, onAporte, addInvestment, investments }: any) => {
    const [formData, setFormData] = useState({
        name: "",
        type: "Ação" as InvestmentType,
        date: format(new Date(), "yyyy-MM-dd"),
        shares: 0,
        price: 0,
        brokerage: 0
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        let entry = investments.find((i: any) => i.name === formData.name);

        const finish = (id: string) => {
            onAporte({
                investmentId: id,
                type: "Compra",
                date: formData.date,
                shares: Number(formData.shares),
                pricePerShare: Number(formData.price),
                brokerage: Number(formData.brokerage)
            });
            onClose();
        };

        if (!entry) {
            addInvestment({
                name: formData.name,
                type: formData.type,
                shares: 0,
                avgPrice: 0,
                currentPrice: Number(formData.price)
            }).then((newInv: any) => {
                if (newInv?.id) {
                    finish(newInv.id);
                }
            });
        } else {
            finish(entry.id);
        }
    };

    return (
        <div className="fixed inset-0 bg-zinc-900/60 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 z-[9999]">
            <motion.div
                initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }}
                className="bg-white rounded-t-[40px] sm:rounded-[48px] shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100/50"
            >
                <div className="p-10 pb-4 flex justify-between items-center">
                    <h2 className="text-2xl font-black text-zinc-900">Novo Aporte</h2>
                    <button onClick={onClose} className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 transition-colors">
                        <X size={20} strokeWidth={3} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-10 pt-6 space-y-6">
                    <div className="space-y-1.5">
                        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Ativo</label>
                        <input
                            required placeholder="Ex: GALE11"
                            className="w-full h-14 px-6 bg-slate-50 border-2 border-transparent focus:border-zinc-900 focus:bg-white rounded-3xl font-black transition-all outline-none"
                            value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value.toUpperCase() })}
                        />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipo</label>
                            <select
                                className="w-full h-14 px-6 bg-slate-50 border-2 border-transparent focus:border-zinc-900 focus:bg-white rounded-3xl font-black transition-all outline-none appearance-none"
                                value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                            >
                                <option value="Ação">Ação</option>
                                <option value="FII">FII</option>
                                <option value="Renda Fixa">Renda Fixa</option>
                                <option value="Cripto">Cripto</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Data</label>
                            <input
                                type="date" required className="w-full h-14 px-6 bg-slate-50 border-2 border-transparent focus:border-zinc-900 focus:bg-white rounded-3xl font-black transition-all outline-none"
                                value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Quant. de Cotas</label>
                            <input
                                type="number" step="any" required className="w-full h-14 px-6 bg-slate-50 border-2 border-transparent focus:border-zinc-900 focus:bg-white rounded-3xl font-black transition-all outline-none"
                                value={formData.shares || ""} onChange={e => setFormData({ ...formData, shares: parseFloat(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Preço (R$)</label>
                            <input
                                type="number" step="0.01" required className="w-full h-14 px-6 bg-slate-50 border-2 border-transparent focus:border-zinc-900 focus:bg-white rounded-3xl font-black transition-all outline-none"
                                value={formData.price || ""} onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                            />
                        </div>
                    </div>
                    <div className="pt-8">
                        <button type="submit" className="w-full h-16 bg-zinc-900 text-white font-black rounded-[24px] shadow-2xl shadow-zinc-200 hover:bg-black transition-all uppercase tracking-widest">Registrar Aporte</button>
                    </div>
                </form>
            </motion.div>
        </div>
    )
};

const DividendModal = ({ onClose, onDividend, investments }: any) => {
    const [formData, setFormData] = useState({
        investmentId: "",
        amount: 0,
        date: format(new Date(), "yyyy-MM-dd"),
        type: "Rendimento FII" as DividendType
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onDividend(formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-zinc-900/60 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 z-[9999]">
            <motion.div
                initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }}
                className="bg-white rounded-t-[40px] sm:rounded-[48px] shadow-2xl w-full max-w-lg overflow-hidden"
            >
                <div className="p-10 pb-4 flex justify-between items-center">
                    <h2 className="text-2xl font-black text-zinc-900">Novo Dividendo</h2>
                    <button onClick={onClose} className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 transition-colors">
                        <X size={20} strokeWidth={3} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-10 pt-6 space-y-6">
                    <div className="space-y-1.5">
                        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Ativo Beneficiário</label>
                        <select
                            required className="w-full h-14 px-6 bg-slate-50 border-2 border-transparent focus:border-zinc-900 focus:bg-white rounded-3xl font-black transition-all outline-none appearance-none"
                            value={formData.investmentId} onChange={e => setFormData({ ...formData, investmentId: e.target.value })}
                        >
                            <option value="">Selecione o ativo...</option>
                            {investments.map((i: any) => (
                                <option key={i.id} value={i.id}>{i.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Valor do Rendimento (R$)</label>
                        <input
                            type="number" step="0.01" required placeholder="0,00"
                            className="w-full h-14 px-6 bg-slate-50 border-2 border-transparent focus:border-zinc-900 focus:bg-white rounded-3xl font-black text-xl text-emerald-600 transition-all outline-none"
                            value={formData.amount || ""} onChange={e => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                        />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipo</label>
                            <select
                                className="w-full h-14 px-6 bg-slate-50 border-2 border-transparent focus:border-zinc-900 focus:bg-white rounded-3xl font-black transition-all outline-none appearance-none"
                                value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                            >
                                <option value="Dividendo">Dividendo</option>
                                <option value="Rendimento FII">Rendimento FII</option>
                                <option value="Juros">Juros</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Data</label>
                            <input
                                type="date" required className="w-full h-14 px-6 bg-slate-50 border-2 border-transparent focus:border-zinc-900 focus:bg-white rounded-3xl font-black transition-all outline-none"
                                value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="pt-8">
                        <button type="submit" className="w-full h-16 bg-emerald-600 text-white font-black rounded-[24px] shadow-2xl shadow-emerald-100 hover:bg-emerald-700 transition-all uppercase tracking-widest">Confirmar Recebimento</button>
                    </div>
                </form>
            </motion.div>
        </div>
    )
};

const CalculatorModal = ({ onClose }: any) => {
    const [data, setData] = useState({
        name: "",
        price: 0,
        shares: 0,
        yield: 0, // Annual %
        targetIncome: 1000
    });

    const totalValue = data.price * data.shares;
    const annualIncome = totalValue * (data.yield / 100);
    const monthlyIncome = annualIncome / 12;

    const dividendPerShare = (data.price * (data.yield / 100)) / 12;
    const sharesNeeded = dividendPerShare > 0 ? Math.ceil(data.targetIncome / dividendPerShare) : 0;
    const capitalNeeded = sharesNeeded * data.price;

    return (
        <div className="fixed inset-0 bg-zinc-900/60 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 z-[9999]">
            <motion.div
                initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }}
                className="bg-white rounded-t-[40px] sm:rounded-[48px] shadow-2xl w-full max-w-4xl overflow-y-auto max-h-[90vh] sm:max-h-none flex flex-col md:flex-row"
            >
                {/* Sidebar Inputs */}
                <div className="w-full md:w-80 bg-slate-50 p-10 border-r border-slate-100">
                    <div className="flex justify-between items-center mb-10 md:mb-8">
                        <h2 className="text-2xl font-black text-zinc-900">Simulador</h2>
                        <button onClick={onClose} className="md:hidden p-3 bg-white text-slate-400 rounded-2xl">
                            <X size={20} strokeWidth={3} />
                        </button>
                    </div>
                    <div className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest">Código do Ativo</label>
                            <input
                                placeholder="Ex: PETR4"
                                className="w-full h-12 px-5 bg-white border border-slate-200 rounded-2xl font-black text-sm outline-none focus:border-zinc-900"
                                value={data.name} onChange={e => setData({ ...data, name: e.target.value.toUpperCase() })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest">Preço da Cota (R$)</label>
                            <input
                                type="number" className="w-full h-12 px-5 bg-white border border-slate-200 rounded-2xl font-black text-sm outline-none focus:border-zinc-900"
                                value={data.price || ""} onChange={e => setData({ ...data, price: parseFloat(e.target.value) || 0 })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest">Quant. de Cotas</label>
                            <input
                                type="number" className="w-full h-12 px-5 bg-white border border-slate-200 rounded-2xl font-black text-sm outline-none focus:border-zinc-900"
                                value={data.shares || ""} onChange={e => setData({ ...data, shares: parseFloat(e.target.value) || 0 })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest">Dividend Yield Anual (%)</label>
                            <input
                                type="number" className="w-full h-12 px-5 bg-white border border-slate-200 rounded-2xl font-black text-sm outline-none focus:border-zinc-900"
                                value={data.yield || ""} onChange={e => setData({ ...data, yield: parseFloat(e.target.value) || 0 })}
                            />
                        </div>
                        <div className="pt-6 border-t border-slate-200">
                            <label className="block text-[11px] font-black text-indigo-600 uppercase tracking-widest mb-2">Meta Financeira (R$)</label>
                            <input
                                type="number" className="w-full h-14 px-5 bg-indigo-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl font-black text-lg text-indigo-700 outline-none"
                                value={data.targetIncome || ""} onChange={e => setData({ ...data, targetIncome: parseFloat(e.target.value) || 0 })}
                            />
                        </div>
                    </div>
                    <button onClick={onClose} className="hidden md:block w-full mt-10 py-4 text-slate-400 font-black uppercase tracking-widest hover:text-zinc-900 transition-colors text-xs">Sair do Simulador</button>
                </div>

                {/* Results Area */}
                <div className="flex-1 p-10 bg-white">
                    <div className="mb-12">
                        <h3 className="text-[12px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <div className="w-1 h-4 bg-emerald-500 rounded-full" />
                            Resultado Esperado
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-slate-50 p-6 rounded-[32px]">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Investido</p>
                                <p className="text-3xl font-black text-zinc-900">R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                            </div>
                            <div className="bg-emerald-500 p-6 rounded-[32px] text-white shadow-xl shadow-emerald-100">
                                <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-2">Renda Mensal</p>
                                <p className="text-3xl font-black">R$ {monthlyIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <h3 className="text-[12px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <div className="w-1 h-4 bg-indigo-500 rounded-full" />
                            Meta de Liberdade
                        </h3>

                        <div className="relative p-10 bg-zinc-900 rounded-[40px] overflow-hidden text-white shadow-2xl">
                            <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
                                <div className="space-y-4">
                                    <p className="text-zinc-400 text-sm font-bold uppercase tracking-wide">Para atingir sua meta de <span className="text-white">R$ {data.targetIncome.toLocaleString('pt-BR')}</span>/mês:</p>
                                    <div className="flex items-baseline gap-3">
                                        <span className="text-6xl font-black tracking-tighter">{sharesNeeded.toLocaleString('pt-BR')}</span>
                                        <span className="text-zinc-500 font-black uppercase text-xs tracking-[0.2em]">Cotas de {data.name || "Ativo"}</span>
                                    </div>
                                </div>
                                <div className="mt-4 md:mt-0">
                                    <div className="bg-white/10 backdrop-blur-xl rounded-[32px] p-6 border border-white/10">
                                        <p className="text-[10px] uppercase font-black text-zinc-400 mb-2">Aporte Total Necessário</p>
                                        <p className="text-2xl font-black text-white">R$ {capitalNeeded.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                    </div>
                                </div>
                            </div>
                            {/* Aesthetic abstract shapes */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full -mr-32 -mt-32 blur-[80px]"></div>
                            <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/10 rounded-full -ml-24 -mb-24 blur-[60px]"></div>
                        </div>

                        <div className="bg-amber-50 rounded-[28px] p-6 flex gap-5 items-start border border-amber-100 shadow-sm shadow-amber-50">
                            <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-700 flex-shrink-0">
                                <Activity size={24} />
                            </div>
                            <div>
                                <p className="text-sm font-black text-amber-900 mb-1 uppercase tracking-tight">Fique Atento</p>
                                <p className="text-[13px] text-amber-800 leading-relaxed font-bold opacity-70">
                                    Valores baseados no Yield informado. O preço da cota e o dividendo podem variar diariamente no mercado. Use como simulação estratégica.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

const DeleteConfirmationModal = ({ onConfirm, onCancel, itemName }: any) => {
    return (
        <div className="fixed inset-0 bg-zinc-900/60 backdrop-blur-md flex items-center justify-center p-4 z-[9999]">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-[40px] shadow-2xl w-full max-w-sm overflow-hidden border border-slate-100 p-10 text-center"
            >
                <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <Trash2 size={32} strokeWidth={2.5} />
                </div>
                <h2 className="text-2xl font-black text-zinc-900 mb-3">Excluir {itemName}?</h2>
                <p className="text-slate-500 font-bold mb-8 leading-relaxed">
                    Esta ação não pode ser desfeita. Todos os aportes e dividendos deste ativo serão removidos permanentemente.
                </p>
                <div className="flex flex-col gap-3">
                    <button
                        onClick={onConfirm}
                        className="h-14 bg-rose-500 text-white font-black rounded-2xl shadow-xl shadow-rose-100 hover:bg-rose-600 transition-all uppercase tracking-widest text-sm"
                    >
                        Sim, Excluir Ativo
                    </button>
                    <button
                        onClick={onCancel}
                        className="h-14 bg-slate-50 text-slate-400 font-black rounded-2xl hover:bg-slate-100 transition-all uppercase tracking-widest text-sm"
                    >
                        Cancelar
                    </button>
                </div>
            </motion.div>
        </div>
    );
};
