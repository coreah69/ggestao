import React, { useState } from "react";
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
  LineChart,
  Line,
} from "recharts";
import { format, parseISO, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

const COLORS = ["#10b981", "#f43f5e", "#3b82f6", "#f59e0b", "#8b5cf6"];

export const Reports: React.FC = () => {
  const { expenses } = useFinance();
  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear().toString(),
  );

  // Filter expenses by selected year
  const yearlyExpenses = expenses.filter((e) =>
    e.date.startsWith(selectedYear),
  );

  // 1. Gastos por Categoria (Anual)
  const expensesByCategory = yearlyExpenses.reduce(
    (acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    },
    {} as Record<string, number>,
  );

  const pieData: { name: string; value: number }[] = Object.entries(
    expensesByCategory,
  )
    .map(([name, value]) => ({ name, value: value as number }))
    .sort((a, b) => b.value - a.value); // Sort descending

  // 2. Gastos por Mês (Evolução Anual)
  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const monthStr = `${selectedYear}-${String(i + 1).padStart(2, "0")}`;
    const monthExpenses = yearlyExpenses.filter((e) =>
      e.date.startsWith(monthStr),
    );
    const total = monthExpenses.reduce((acc, curr) => acc + curr.amount, 0);
    return {
      month: format(new Date(parseInt(selectedYear), i, 1), "MMM", {
        locale: ptBR,
      }),
      total,
    };
  });

  // 3. Comparação de Categorias (Onde mais gasta)
  const topCategory = pieData.length > 0 ? pieData[0] : null;

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Relatórios</h1>
          <p className="text-slate-500">
            Análises detalhadas da sua vida financeira
          </p>
        </div>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm"
        >
          {Array.from(
            { length: 5 },
            (_, i) => new Date().getFullYear() - i,
          ).map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Gráfico de Gastos por Mês */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 md:col-span-2">
          <h2 className="text-lg font-semibold text-slate-900 mb-6">
            Evolução de Gastos ({selectedYear})
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e2e8f0"
                />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  tickFormatter={(value) => `R$${value}`}
                />
                <RechartsTooltip
                  formatter={(value: number) => `R$ ${value.toFixed(2)}`}
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico de Gastos por Categoria */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900 mb-6">
            Gastos por Categoria
          </h2>
          {pieData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
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
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-400">
              Nenhum dado para exibir.
            </div>
          )}
        </div>

        {/* Resumo e Insights */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center">
          <h2 className="text-lg font-semibold text-slate-900 mb-6">
            Insights Financeiros
          </h2>

          <div className="space-y-6">
            <div>
              <p className="text-sm text-slate-500 mb-1">Maior Custo Anual</p>
              {topCategory ? (
                <div className="flex items-end gap-3">
                  <span className="text-2xl font-bold text-slate-900">
                    {topCategory.name}
                  </span>
                  <span className="text-lg font-medium text-red-500 mb-0.5">
                    R${" "}
                    {topCategory.value.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
              ) : (
                <p className="text-slate-400">Sem dados suficientes</p>
              )}
            </div>

            <div className="border-t border-slate-100 pt-6">
              <p className="text-sm text-slate-500 mb-3">
                Distribuição de Gastos
              </p>
              <div className="space-y-3">
                {pieData.slice(0, 4).map((item, index) => {
                  const total = pieData.reduce(
                    (acc, curr) => acc + curr.value,
                    0,
                  );
                  const percentage = ((item.value / total) * 100).toFixed(1);
                  return (
                    <div
                      key={item.name}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor: COLORS[index % COLORS.length],
                          }}
                        />
                        <span className="text-sm font-medium text-slate-700">
                          {item.name}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-slate-900">
                        {percentage}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
