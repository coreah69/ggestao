import React from "react";
import { useFinance } from "../context/FinanceContext";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  AlertCircle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  AlertTriangle,
  Wallet,
} from "lucide-react";
import { format, parseISO, isSameMonth } from "date-fns";
import { ptBR } from "date-fns/locale";

const COLORS = ["#10b981", "#f43f5e", "#3b82f6", "#f59e0b", "#8b5cf6"];

export const Dashboard: React.FC = () => {
  const { expenses, bills, debts, availableBalance, loading } = useFinance();

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-zinc-900/10 border-t-zinc-900 rounded-full animate-spin"></div>
      </div>
    );
  }

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  // Calculations
  const monthlyExpenses = expenses.filter((e) => {
    const date = parseISO(e.date);
    return (
      date.getMonth() === currentMonth && date.getFullYear() === currentYear
    );
  });

  const totalSpent = monthlyExpenses.reduce(
    (acc, curr) => acc + curr.amount,
    0,
  );

  const monthlyBills = bills.filter((b) => {
    const date = parseISO(b.dueDate);
    return (
      date.getMonth() === currentMonth && date.getFullYear() === currentYear
    );
  });

  const totalBills = monthlyBills.reduce((acc, curr) => acc + curr.amount, 0);
  const totalPaidBills = monthlyBills
    .filter((b) => b.status === "Paga")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalDebts = debts.reduce((acc, curr) => acc + curr.amount, 0);

  // Category Chart Data
  const expensesByCategory = monthlyExpenses.reduce(
    (acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    },
    {} as Record<string, number>,
  );

  const pieData = Object.entries(expensesByCategory).map(([name, value]) => ({
    name,
    value,
  }));

  // Evolution Chart Data (Group by day)
  const expensesByDay = monthlyExpenses.reduce(
    (acc, curr) => {
      const day = format(parseISO(curr.date), "dd/MM");
      acc[day] = (acc[day] || 0) + curr.amount;
      return acc;
    },
    {} as Record<string, number>,
  );

  const barData = Object.entries(expensesByDay)
    .map(([date, amount]) => ({ date, amount }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Alerts
  const upcomingBills = bills.filter(
    (b) =>
      b.status === "Pendente" &&
      parseISO(b.dueDate) >= today &&
      parseISO(b.dueDate).getTime() <=
      today.getTime() + 7 * 24 * 60 * 60 * 1000,
  );
  const overdueBills = bills.filter((b) => b.status === "Atrasada");

  return (
    <div className="space-y-6">
      <header className="mb-10">
        <h1 className="text-3xl font-semibold text-zinc-900 tracking-tight mb-1">Dashboard</h1>
        <p className="text-[15px] text-slate-500 font-medium">
          Visão geral das suas finanças em{" "}
          {format(today, "MMMM yyyy", { locale: ptBR })}
        </p>
      </header>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card
          title="Gasto no Mês"
          amount={totalSpent}
          icon={TrendingDown}
          color="text-red-500"
          bg="bg-red-50"
        />
        <Card
          title="Contas do Mês"
          amount={totalBills}
          icon={CreditCard}
          color="text-blue-500"
          bg="bg-blue-50"
        />
        <Card
          title="Total Pago"
          amount={totalPaidBills}
          icon={TrendingUp}
          color="text-emerald-500"
          bg="bg-emerald-50"
        />
        <Card
          title="Total Dívidas"
          amount={totalDebts}
          icon={AlertTriangle}
          color="text-amber-500"
          bg="bg-amber-50"
        />
        <Card
          title="Saldo Disponível"
          amount={availableBalance}
          icon={Wallet}
          color="text-indigo-500"
          bg="bg-indigo-50"
        />
      </div>

      {/* Alerts */}
      {(upcomingBills.length > 0 || overdueBills.length > 0) && (
        <div className="bg-white p-7 rounded-3xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100/60">
          <h2 className="text-[15px] font-semibold text-zinc-900 mb-5 flex items-center gap-2.5">
            <div className="p-2 bg-amber-50 rounded-xl">
              <AlertCircle className="text-amber-500" size={18} strokeWidth={2.5} />
            </div>
            Alertas Automáticos
          </h2>
          <div className="space-y-3">
            {overdueBills.map((bill) => (
              <div
                key={bill.id}
                className="flex items-center justify-between p-4 bg-red-50/50 border border-red-100/50 text-red-700 rounded-2xl"
              >
                <span className="font-medium text-[15px]">Conta Atrasada: {bill.name}</span>
                <span className="font-semibold tracking-tight">R$ {bill.amount.toFixed(2)}</span>
              </div>
            ))}
            {upcomingBills.map((bill) => (
              <div
                key={bill.id}
                className="flex items-center justify-between p-4 bg-amber-50/50 border border-amber-100/50 text-amber-700 rounded-2xl"
              >
                <span className="font-medium text-[15px]">
                  Vencimento Próximo: {bill.name} (
                  {format(parseISO(bill.dueDate), "dd/MM")})
                </span>
                <span className="font-semibold tracking-tight">R$ {bill.amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-7 rounded-3xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100/60">
          <h2 className="text-[15px] font-semibold text-zinc-900 mb-8 tracking-wide">
            Gastos por Categoria
          </h2>
          {pieData.length > 0 ? (
            <div className="flex flex-col">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={85}
                      paddingAngle={6}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      formatter={(value: number) => `R$ ${value.toFixed(2)}`}
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.08)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-x-5 gap-y-3 mt-6">
                {pieData.map((entry, index) => (
                  <div
                    key={entry.name}
                    className="flex items-center gap-2 text-[13px] font-medium text-slate-500"
                  >
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    {entry.name}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-[15px] text-slate-400 font-medium">
              Nenhum gasto registrado neste mês.
            </div>
          )}
        </div>

        <div className="bg-white p-7 rounded-3xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100/60">
          <h2 className="text-[15px] font-semibold text-zinc-900 mb-8 tracking-wide">
            Evolução de Gastos
          </h2>
          {barData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 500 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 500 }}
                    tickFormatter={(value) => `R$${value}`}
                  />
                  <RechartsTooltip
                    formatter={(value: number) => `R$ ${value.toFixed(2)}`}
                    cursor={{ fill: "#f8fafc" }}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.08)' }}
                  />
                  <Bar dataKey="amount" fill="#18181b" radius={[6, 6, 6, 6]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-[15px] text-slate-400 font-medium">
              Nenhum gasto registrado neste mês.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Card = ({ title, amount, icon: Icon, color, bg }: any) => (
  <div className="bg-white p-7 rounded-3xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100/60 flex flex-col justify-between transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-[13px] font-medium text-slate-500 tracking-wide">{title}</h3>
      <div className={`p-2.5 rounded-2xl ${bg} ${color}`}>
        <Icon size={18} strokeWidth={2.5} />
      </div>
    </div>
    <p className="text-3xl font-semibold tracking-tight text-zinc-900">
      R${" "}
      {amount.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}
    </p>
  </div>
);
