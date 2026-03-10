import React, { useState } from "react";
import { useFinance } from "../context/FinanceContext";
import {
  Target,
  TrendingUp,
  AlertTriangle,
  Calculator,
  ArrowRight,
  Wallet,
} from "lucide-react";
import { format, parseISO, subMonths } from "date-fns";

export const Planning: React.FC = () => {
  const { expenses, bills, debts, availableBalance, setAvailableBalance } =
    useFinance();

  const [simulationAmount, setSimulationAmount] = useState<number>(0);
  const [selectedDebtId, setSelectedDebtId] = useState<string>("");

  const today = new Date();
  const currentMonth = format(today, "yyyy-MM");
  const lastMonth = format(subMonths(today, 1), "yyyy-MM");

  // 1. Quanto precisa pagar de dívidas (Total)
  const totalDebts = debts.reduce((acc, curr) => acc + curr.amount, 0);

  // 2. Quanto paga por mês em contas (Média dos últimos 2 meses ou atual)
  const currentMonthBills = bills
    .filter((b) => b.dueDate.startsWith(currentMonth))
    .reduce((acc, curr) => acc + curr.amount, 0);
  const lastMonthBills = bills
    .filter((b) => b.dueDate.startsWith(lastMonth))
    .reduce((acc, curr) => acc + curr.amount, 0);
  const avgBills =
    (currentMonthBills + lastMonthBills) / (lastMonthBills > 0 ? 2 : 1);

  // 3. Média de gastos mensais (Gastos Diários)
  const currentMonthExpenses = expenses
    .filter((e) => e.date.startsWith(currentMonth))
    .reduce((acc, curr) => acc + curr.amount, 0);
  const lastMonthExpenses = expenses
    .filter((e) => e.date.startsWith(lastMonth))
    .reduce((acc, curr) => acc + curr.amount, 0);
  const avgExpenses =
    (currentMonthExpenses + lastMonthExpenses) /
    (lastMonthExpenses > 0 ? 2 : 1);

  // 4. Simulação de Pagamento de Dívida
  const selectedDebt = debts.find((d) => d.id === selectedDebtId);
  const monthsToPayOff =
    selectedDebt && simulationAmount > 0
      ? Math.ceil(selectedDebt.amount / simulationAmount)
      : 0;

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Planejamento Financeiro
          </h1>
          <p className="text-slate-500">
            Projete seu futuro e organize suas metas
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Resumo Atual */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 md:col-span-2">
          <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
            <Target className="text-emerald-500" size={20} />
            Sua Situação Atual
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-sm font-medium text-slate-500 mb-1">
                Dívidas Totais
              </p>
              <p className="text-xl font-bold text-red-600">
                R${" "}
                {totalDebts.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-sm font-medium text-slate-500 mb-1">
                Média de Contas/Mês
              </p>
              <p className="text-xl font-bold text-blue-600">
                R${" "}
                {avgBills.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-sm font-medium text-slate-500 mb-1">
                Média de Gastos/Mês
              </p>
              <p className="text-xl font-bold text-amber-600">
                R${" "}
                {avgExpenses.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-700 mb-1">
                Custo de Vida Mensal Estimado
              </p>
              <p className="text-2xl font-bold text-emerald-800">
                R${" "}
                {(avgBills + avgExpenses).toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
            <TrendingUp className="text-emerald-500 opacity-50" size={48} />
          </div>
        </div>

        {/* Atualizar Saldo */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
            <Wallet className="text-indigo-500" size={20} />
            Saldo Atual
          </h2>
          <div className="space-y-4">
            <p className="text-sm text-slate-500">
              Atualize o saldo disponível na sua conta para acompanhar o
              dashboard.
            </p>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Valor em Conta (R$)
              </label>
              <input
                type="number"
                step="0.01"
                value={availableBalance || ""}
                onChange={(e) =>
                  setAvailableBalance(parseFloat(e.target.value) || 0)
                }
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium text-lg"
                placeholder="0,00"
              />
            </div>
          </div>
        </div>

        {/* Simulador de Dívidas */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 md:col-span-3">
          <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
            <Calculator className="text-blue-500" size={20} />
            Simulador de Quitação de Dívidas
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Selecione a Dívida
                </label>
                <select
                  value={selectedDebtId}
                  onChange={(e) => setSelectedDebtId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="">Selecione...</option>
                  {debts.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.institution} - R${" "}
                      {d.amount.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Quanto pode pagar por mês? (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={simulationAmount || ""}
                  onChange={(e) =>
                    setSimulationAmount(parseFloat(e.target.value) || 0)
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  placeholder="Ex: 200,00"
                />
              </div>
            </div>

            <div className="md:col-span-2 flex items-center justify-center h-full">
              {selectedDebt && simulationAmount > 0 ? (
                <div className="bg-blue-50 border border-blue-100 p-6 rounded-xl w-full text-center">
                  <p className="text-blue-800 font-medium mb-2">
                    Se você pagar R${" "}
                    {simulationAmount.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}{" "}
                    por mês,
                  </p>
                  <p className="text-3xl font-bold text-blue-600 mb-2">
                    Você quitará a dívida em{" "}
                    <span className="text-blue-900">{monthsToPayOff}</span>{" "}
                    meses
                  </p>
                  <p className="text-sm text-blue-700 opacity-80">
                    (Sem considerar juros adicionais do período)
                  </p>
                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-100 p-6 rounded-xl w-full text-center text-slate-400 flex flex-col items-center justify-center h-full min-h-[140px]">
                  <ArrowRight size={32} className="mb-2 opacity-50" />
                  <p>Preencha os dados ao lado para simular</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
