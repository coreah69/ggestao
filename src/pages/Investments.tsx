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
    Calculator,
    Wallet,
    Activity,
    Layers,
    Target
} from "lucide-react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { InvestmentType, TransactionType, DividendType, Investment } from "../types";
import clsx from "clsx";

const COLORS = ["#18181b", "#6366f1", "#10b981", "#f59e0b", "#ef4444"];

export const Investments: React.FC = () => {
    const {
        investments,
        transactions,
        dividends,
        addInvestment,
        addTransaction,
        addDividend,
        deleteInvestment
    } = useFinance();

    const [activeTab, setActiveTab] = useState<"dashboard" | "assets" | "history">("dashboard");
    const [isAporteModalOpen, setIsAporteModalOpen] = useState(false);
    const [isDividendModalOpen, setIsDividendModalOpen] = useState(false);
    const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);

    // Stats Calculations
    const totalInvested = useMemo(() =>
        investments.reduce((acc, curr) => acc + (curr.shares * curr.avgPrice), 0)
        , [investments]);

    const currentValue = useMemo(() =>
        investments.reduce((acc, curr) => acc + (curr.shares * curr.currentPrice), 0)
        , [investments]);

    const totalProfit = currentValue - totalInvested;
    const profitPercentage = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;

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

    const renderDashboard = () => (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-6 rounded-3xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100/60"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-zinc-900/5 rounded-xl text-zinc-900">
                            <Wallet size={20} />
                        </div>
                        <h3 className="text-[13px] font-medium text-slate-500 tracking-wide uppercase">Patrimônio Atual</h3>
                    </div>
                    <p className="text-2xl font-bold tracking-tight text-zinc-900">
                        R$ {currentValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </p>
                    <div className="flex items-center gap-1 mt-2">
                        {totalProfit >= 0 ? (
                            <span className="text-emerald-600 flex items-center text-sm font-semibold">
                                <ArrowUpRight size={16} /> {profitPercentage.toFixed(2)}%
                            </span>
                        ) : (
                            <span className="text-rose-600 flex items-center text-sm font-semibold">
                                <ArrowDownRight size={16} /> {Math.abs(profitPercentage).toFixed(2)}%
                            </span>
                        )}
                        <span className="text-[12px] text-slate-400 font-medium ml-1">vs total investido</span>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className="bg-white p-6 rounded-3xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100/60"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
                            <TrendingUp size={20} />
                        </div>
                        <h3 className="text-[13px] font-medium text-slate-500 tracking-wide uppercase">Lucro/Prejuízo</h3>
                    </div>
                    <p className={clsx("text-2xl font-bold tracking-tight", totalProfit >= 0 ? "text-emerald-600" : "text-rose-600")}>
                        R$ {totalProfit.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-[12px] text-slate-400 font-medium mt-2">Saldo líquido da carteira</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    className="bg-white p-6 rounded-3xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100/60"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
                            <DollarSign size={20} />
                        </div>
                        <h3 className="text-[13px] font-medium text-slate-500 tracking-wide uppercase">Dividendos (Mês)</h3>
                    </div>
                    <p className="text-2xl font-bold tracking-tight text-zinc-900">
                        R$ {monthlyDividends.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-[12px] text-slate-400 font-medium mt-2">Renda passiva recebida</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    className="bg-white p-6 rounded-3xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100/60"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-amber-50 rounded-xl text-amber-600">
                            <Activity size={20} />
                        </div>
                        <h3 className="text-[13px] font-medium text-slate-500 tracking-wide uppercase">Rendimento Anual</h3>
                    </div>
                    <p className="text-2xl font-bold tracking-tight text-zinc-900">
                        R$ {yearDividends.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-[12px] text-slate-400 font-medium mt-2">Dividendos totais em {new Date().getFullYear()}</p>
                </motion.div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-8 rounded-3xl border border-slate-100/60 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                    <h4 className="text-[15px] font-semibold text-zinc-900 mb-6 flex items-center gap-2">
                        <Layers size={18} className="text-zinc-400" /> Distribuição de Ativos
                    </h4>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={distributionData}
                                    cx="50%"
                                    cy="45%"
                                    innerRadius={80}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {distributionData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                        {distributionData.map((d, i) => (
                            <div key={d.name} className="flex flex-col items-center gap-1">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                                    <span className="text-[11px] font-bold text-slate-500 uppercase">{d.name}</span>
                                </div>
                                <span className="text-xs font-semibold text-zinc-900">
                                    {((d.value / currentValue) * 100).toFixed(1)}%
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-8 rounded-3xl border border-slate-100/60 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                    <h4 className="text-[15px] font-semibold text-zinc-900 mb-6 flex items-center gap-2">
                        <TrendingUp size={18} className="text-zinc-400" /> Renda Passiva Mensal
                    </h4>
                    <div className="h-[340px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlyIncomeData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                <Tooltip
                                    cursor={{ fill: '#f8fafc' }}
                                    formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="value" fill="#18181b" radius={[6, 6, 0, 0]} barSize={24} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
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
                    const profit = current - invested;
                    const profitPct = invested > 0 ? (profit / invested) * 100 : 0;

                    return (
                        <motion.div
                            key={inv.id}
                            layoutId={inv.id}
                            className="bg-white p-6 rounded-3xl border border-slate-100/60 shadow-[0_2px_10px_rgba(0,0,0,0.02)] group hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all cursor-pointer"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-zinc-900 group-hover:text-black transition-colors">{inv.name}</h3>
                                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{inv.type}</span>
                                </div>
                                <div className={clsx("px-2.5 py-1 rounded-full text-[12px] font-bold", profit >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600")}>
                                    {profitPct >= 0 ? "+" : ""}{profitPct.toFixed(1)}%
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-50">
                                <div>
                                    <p className="text-[11px] text-slate-400 font-medium uppercase mb-1">Qte</p>
                                    <p className="text-sm font-bold text-zinc-900">{inv.shares}</p>
                                </div>
                                <div>
                                    <p className="text-[11px] text-slate-400 font-medium uppercase mb-1">Preço Médio</p>
                                    <p className="text-sm font-bold text-zinc-900">R$ {inv.avgPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                </div>
                                <div>
                                    <p className="text-[11px] text-slate-400 font-medium uppercase mb-1">Total Investido</p>
                                    <p className="text-sm font-bold text-zinc-900 text-slate-500">R$ {invested.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                </div>
                                <div>
                                    <p className="text-[11px] text-slate-400 font-medium uppercase mb-1">Valor Atual</p>
                                    <p className="text-sm font-bold text-zinc-900">R$ {current.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                </div>
                            </div>

                            <div className="mt-4 flex justify-between items-center text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={(e) => { e.stopPropagation(); deleteInvestment(inv.id); }}
                                    className="text-[11px] font-bold uppercase tracking-tight hover:underline"
                                >
                                    Excluir Ativo
                                </button>
                                <div className="flex items-center gap-1 text-[13px] font-bold text-zinc-900">
                                    {profit >= 0 ? <TrendingUp size={14} className="text-emerald-500" /> : <TrendingDown size={14} className="text-rose-500" />}
                                    R$ {Math.abs(profit).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </div>
                            </div>
                        </motion.div>
                    );
                })}

                <button
                    onClick={() => setIsAporteModalOpen(true)}
                    className="bg-zinc-50 border-2 border-dashed border-slate-200 rounded-3xl p-6 flex flex-col items-center justify-center gap-3 text-slate-400 hover:border-zinc-300 hover:text-zinc-600 transition-all min-h-[220px]"
                >
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                        <Plus size={24} />
                    </div>
                    <span className="text-sm font-semibold">Novo Aporte</span>
                </button>
            </div>
        </div>
    );

    return (
        <div className="space-y-8 pb-10">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Investimentos</h1>
                    <p className="text-slate-500 font-medium">Acompanhe seu patrimônio e dividendos</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setIsCalculatorOpen(true)}
                        className="bg-indigo-50 text-indigo-700 px-5 py-2.5 rounded-2xl font-bold flex items-center gap-2 hover:bg-indigo-100 transition-all border border-indigo-100"
                    >
                        <Calculator size={18} />
                        Calculadora
                    </button>
                    <button
                        onClick={() => setIsDividendModalOpen(true)}
                        className="bg-emerald-50 text-emerald-700 px-5 py-2.5 rounded-2xl font-bold flex items-center gap-2 hover:bg-emerald-100 transition-all border border-emerald-100"
                    >
                        <DollarSign size={18} />
                        Lançar Dividendo
                    </button>
                    <button
                        onClick={() => setIsAporteModalOpen(true)}
                        className="bg-zinc-900 text-white px-5 py-2.5 rounded-2xl font-bold flex items-center gap-2 hover:bg-black transition-all shadow-[0_4px_14px_rgba(0,0,0,0.1)]"
                    >
                        <Plus size={20} />
                        Novo Aporte
                    </button>
                </div>
            </header>

            {/* Internal Tabs */}
            <div className="flex gap-1 bg-white p-1.5 rounded-[22px] border border-slate-100/60 w-fit">
                {[
                    { id: "dashboard", label: "Visão Geral", icon: PieChartIcon },
                    { id: "assets", label: "Meus Ativos", icon: Layers },
                    { id: "history", label: "Histórico", icon: History },
                ].map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={clsx(
                                "flex items-center gap-2.5 px-6 py-2.5 rounded-[18px] text-[13px] font-bold transition-all",
                                isActive ? "bg-zinc-900 text-white shadow-md shadow-zinc-200" : "text-slate-500 hover:text-zinc-900"
                            )}
                        >
                            <Icon size={16} />
                            {tab.label}
                        </button>
                    )
                })}
            </div>

            <main>
                {activeTab === "dashboard" && renderDashboard()}
                {activeTab === "assets" && renderAssets()}
                {activeTab === "history" && (
                    <div className="bg-white rounded-3xl p-8 text-center text-slate-400 border border-slate-100/60">
                        <History size={48} className="mx-auto mb-4 opacity-10" />
                        <p className="font-medium text-lg text-slate-400">Em breve</p>
                        <p className="text-sm">Histórico detalhado de movimentações será exibido aqui.</p>
                    </div>
                )}
            </main>

            {/* Modal Placeholders - I will implement full modals in the next step */}
            <AnimatePresence>
                {isAporteModalOpen && (
                    <AporteModal onClose={() => setIsAporteModalOpen(false)} onAporte={addTransaction} addInvestment={addInvestment} investments={investments} />
                )}
                {isDividendModalOpen && (
                    <DividendModal onClose={() => setIsDividendModalOpen(false)} onDividend={addDividend} investments={investments} />
                )}
                {isCalculatorOpen && (
                    <CalculatorModal onClose={() => setIsCalculatorOpen(false)} />
                )}
            </AnimatePresence>
        </div>
    );
};

// Modal Components
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
        // Check if investment exists
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
        <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100/50"
            >
                <div className="p-7 border-b border-slate-100/60">
                    <h2 className="text-xl font-bold text-zinc-900">Registrar Aporte</h2>
                </div>
                <form onSubmit={handleSubmit} className="p-7 space-y-4">
                    <div>
                        <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5 tracking-wider">Ativo (Ex: B3SA3, GALE11)</label>
                        <input
                            required className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl font-bold"
                            value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value.toUpperCase() })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5 tracking-wider">Tipo</label>
                            <select
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl font-bold"
                                value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                            >
                                <option value="Ação">Ação</option>
                                <option value="FII">FII</option>
                                <option value="Renda Fixa">Renda Fixa</option>
                                <option value="Cripto">Cripto</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5 tracking-wider">Data</label>
                            <input
                                type="date" required className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl font-bold"
                                value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5 tracking-wider">Quantidade</label>
                            <input
                                type="number" step="any" required className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl font-bold"
                                value={formData.shares || ""} onChange={e => setFormData({ ...formData, shares: parseFloat(e.target.value) })}
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5 tracking-wider">Preço Cota (R$)</label>
                            <input
                                type="number" step="0.01" required className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl font-bold"
                                value={formData.price || ""} onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                            />
                        </div>
                    </div>
                    <div className="pt-6 flex gap-3">
                        <button type="button" onClick={onClose} className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl">Cancelar</button>
                        <button type="submit" className="flex-1 py-3 bg-zinc-900 text-white font-bold rounded-2xl shadow-lg">Salvar</button>
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
        <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100/50"
            >
                <div className="p-7 border-b border-slate-100/60">
                    <h2 className="text-xl font-bold text-zinc-900">Lançar Rendimento/Dividendo</h2>
                </div>
                <form onSubmit={handleSubmit} className="p-7 space-y-4">
                    <div>
                        <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5 tracking-wider">Ativo</label>
                        <select
                            required className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl font-bold"
                            value={formData.investmentId} onChange={e => setFormData({ ...formData, investmentId: e.target.value })}
                        >
                            <option value="">Selecione um ativo...</option>
                            {investments.map((i: any) => (
                                <option key={i.id} value={i.id}>{i.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5 tracking-wider">Valor Recebido (R$)</label>
                        <input
                            type="number" step="0.01" required className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl font-bold"
                            value={formData.amount || ""} onChange={e => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5 tracking-wider">Tipo</label>
                            <select
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl font-bold"
                                value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                            >
                                <option value="Dividendo">Dividendo</option>
                                <option value="Rendimento FII">Rendimento FII</option>
                                <option value="Juros">Juros</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5 tracking-wider">Data Recebimento</label>
                            <input
                                type="date" required className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl font-bold"
                                value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="pt-6 flex gap-3">
                        <button type="button" onClick={onClose} className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl">Cancelar</button>
                        <button type="submit" className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-2xl shadow-lg border-b-4 border-emerald-800 active:border-b-0 transition-all">Registrar Rendimento</button>
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
        <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-100/50 flex flex-col md:flex-row"
            >
                {/* Sidebar Inputs */}
                <div className="w-full md:w-80 bg-slate-50 p-8 border-r border-slate-100">
                    <h2 className="text-xl font-bold text-zinc-900 mb-6">Simulador</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5 tracking-wider">Ativo</label>
                            <input
                                placeholder="Ex: PETR4"
                                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-sm"
                                value={data.name} onChange={e => setData({ ...data, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5 tracking-wider">Preço da Cota (R$)</label>
                            <input
                                type="number" className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-sm"
                                value={data.price || ""} onChange={e => setData({ ...data, price: parseFloat(e.target.value) })}
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5 tracking-wider">Quant. de Cotas</label>
                            <input
                                type="number" className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-sm"
                                value={data.shares || ""} onChange={e => setData({ ...data, shares: parseFloat(e.target.value) })}
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5 tracking-wider">Dividend Yield Anual (%)</label>
                            <input
                                type="number" className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-sm"
                                value={data.yield || ""} onChange={e => setData({ ...data, yield: parseFloat(e.target.value) })}
                            />
                        </div>
                        <div className="pt-4 border-t border-slate-200">
                            <label className="block text-[11px] font-bold text-indigo-500 uppercase mb-1.5 tracking-wider">Meta de Renda Mensal (R$)</label>
                            <input
                                type="number" className="w-full px-4 py-2.5 bg-indigo-50/50 border border-indigo-100 rounded-xl font-bold text-sm text-indigo-700"
                                value={data.targetIncome || ""} onChange={e => setData({ ...data, targetIncome: parseFloat(e.target.value) })}
                            />
                        </div>
                    </div>
                    <button onClick={onClose} className="w-full mt-8 py-3 text-slate-500 font-bold hover:bg-slate-100 rounded-xl text-sm transition-colors">Fechar</button>
                </div>

                {/* Results Area */}
                <div className="flex-1 p-8 bg-white">
                    <div className="mb-10">
                        <h3 className="text-[13px] font-bold text-slate-400 uppercase tracking-widest mb-4">Projeção do Investimento</h3>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="bg-slate-50 p-5 rounded-2xl">
                                <p className="text-[11px] font-bold text-slate-400 uppercase mb-1">Total a Investir</p>
                                <p className="text-xl font-black text-zinc-900">R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                            </div>
                            <div className="bg-emerald-50 p-5 rounded-2xl">
                                <p className="text-[11px] font-bold text-emerald-600 uppercase mb-1">Renda Mensal Est.</p>
                                <p className="text-xl font-black text-emerald-600">R$ {monthlyIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-[13px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Target size={16} className="text-indigo-500" /> Caminho para a Independência
                        </h3>

                        <div className="relative p-6 bg-indigo-600 rounded-3xl overflow-hidden text-white shadow-xl shadow-indigo-100">
                            <div className="relative z-10">
                                <p className="text-indigo-100 text-sm font-medium mb-1">Para receber R$ {data.targetIncome.toLocaleString('pt-BR')} mensais com {data.name || "este ativo"}:</p>
                                <div className="flex items-baseline gap-2 mb-4">
                                    <span className="text-4xl font-black tracking-tight">{sharesNeeded.toLocaleString('pt-BR')}</span>
                                    <span className="text-indigo-200 font-bold uppercase text-[12px] tracking-widest">cotas</span>
                                </div>
                                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 inline-block">
                                    <p className="text-[10px] uppercase font-bold text-indigo-200 mb-1">Capital Total Necessário</p>
                                    <p className="text-lg font-black">R$ {capitalNeeded.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                </div>
                            </div>
                            {/* Aesthetic abstract shapes */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-400/20 rounded-full -ml-10 -mb-10 blur-xl"></div>
                        </div>

                        <div className="bg-amber-50 rounded-2xl p-4 flex gap-4 items-start border border-amber-100">
                            <div className="p-2 bg-amber-100 rounded-xl text-amber-700">
                                <Calculator size={18} />
                            </div>
                            <div>
                                <p className="text-[12px] font-bold text-amber-900 mb-1">Dica do GGestor</p>
                                <p className="text-[11px] text-amber-800 leading-relaxed font-medium">
                                    Lembre-se que o Dividend Yield passado não garante rendimentos futuros. Diversifique sua carteira para diluir riscos!
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

