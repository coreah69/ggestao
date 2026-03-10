import React, { useState } from "react";
import { useFinance } from "../context/FinanceContext";
import {
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  ArrowUpCircle,
  ArrowRightCircle,
  ArrowDownCircle,
} from "lucide-react";
import { Debt, DebtPriority } from "../types";
import { clsx } from "clsx";

export const Debts: React.FC = () => {
  const { debts, addDebt, updateDebt, deleteDebt, loading } = useFinance();

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-zinc-900/10 border-t-zinc-900 rounded-full animate-spin"></div>
      </div>
    );
  }
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Omit<Debt, "id">>({
    type: "",
    institution: "",
    amount: 0,
    priority: "Média",
  });

  const totalDebts = debts.reduce((acc, curr) => acc + curr.amount, 0);

  // Find highest priority debt (Alta > Média > Baixa)
  const urgentDebt =
    debts.find((d) => d.priority === "Alta") ||
    debts.find((d) => d.priority === "Média") ||
    debts.find((d) => d.priority === "Baixa");

  // Find debt with highest amount
  const highestDebt = [...debts].sort((a, b) => b.amount - a.amount)[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateDebt(editingId, formData);
    } else {
      addDebt(formData);
    }
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ type: "", institution: "", amount: 0, priority: "Média" });
  };

  const handleEdit = (debt: Debt) => {
    setFormData({
      type: debt.type,
      institution: debt.institution,
      amount: debt.amount,
      priority: debt.priority,
    });
    setEditingId(debt.id);
    setIsModalOpen(true);
  };

  const getPriorityIcon = (priority: DebtPriority) => {
    switch (priority) {
      case "Alta":
        return <ArrowUpCircle size={16} className="text-red-500" />;
      case "Média":
        return <ArrowRightCircle size={16} className="text-amber-500" />;
      case "Baixa":
        return <ArrowDownCircle size={16} className="text-emerald-500" />;
    }
  };

  const getPriorityClass = (priority: DebtPriority) => {
    switch (priority) {
      case "Alta":
        return "bg-red-50 text-red-700 border-red-200";
      case "Média":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Baixa":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dívidas</h1>
          <p className="text-slate-500">
            Acompanhe e organize o pagamento das suas dívidas
          </p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setFormData({
              type: "",
              institution: "",
              amount: 0,
              priority: "Média",
            });
            setIsModalOpen(true);
          }}
          className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Nova Dívida
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-sm font-medium text-slate-500 mb-1">
            Total de Dívidas
          </h3>
          <p className="text-2xl font-bold text-red-600">
            R${" "}
            {totalDebts.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-sm font-medium text-slate-500 mb-1">
            Dívida Mais Urgente
          </h3>
          {urgentDebt ? (
            <div>
              <p className="text-lg font-bold text-slate-900 truncate">
                {urgentDebt.institution}
              </p>
              <p className="text-sm text-slate-500">
                R${" "}
                {urgentDebt.amount.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
          ) : (
            <p className="text-slate-400">Nenhuma dívida</p>
          )}
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-sm font-medium text-slate-500 mb-1">
            Maior Dívida
          </h3>
          {highestDebt ? (
            <div>
              <p className="text-lg font-bold text-slate-900 truncate">
                {highestDebt.institution}
              </p>
              <p className="text-sm text-slate-500">
                R${" "}
                {highestDebt.amount.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
          ) : (
            <p className="text-slate-400">Nenhuma dívida</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-100">
                <th className="p-4 font-medium">Instituição</th>
                <th className="p-4 font-medium">Tipo</th>
                <th className="p-4 font-medium text-right">Valor</th>
                <th className="p-4 font-medium text-center">Prioridade</th>
                <th className="p-4 font-medium text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {debts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    Nenhuma dívida cadastrada. Que ótimo!
                  </td>
                </tr>
              ) : (
                debts
                  .sort((a, b) => {
                    const priorityWeight = { Alta: 3, Média: 2, Baixa: 1 };
                    return (
                      priorityWeight[b.priority] - priorityWeight[a.priority]
                    );
                  })
                  .map((debt) => (
                    <tr
                      key={debt.id}
                      className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="p-4 font-medium text-slate-900">
                        {debt.institution}
                      </td>
                      <td className="p-4 text-slate-600">{debt.type}</td>
                      <td className="p-4 font-medium text-red-600 text-right">
                        R${" "}
                        {debt.amount.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                      <td className="p-4 text-center">
                        <span
                          className={clsx(
                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
                            getPriorityClass(debt.priority),
                          )}
                        >
                          {getPriorityIcon(debt.priority)}
                          {debt.priority}
                        </span>
                      </td>
                      <td className="p-4 flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(debt)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => deleteDebt(debt.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">
                {editingId ? "Editar Dívida" : "Nova Dívida"}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Instituição/Banco
                </label>
                <input
                  type="text"
                  required
                  value={formData.institution}
                  onChange={(e) =>
                    setFormData({ ...formData, institution: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  placeholder="Ex: Nubank, Itaú, SPC"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Tipo de Dívida
                </label>
                <input
                  type="text"
                  required
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  placeholder="Ex: Cartão de Crédito, Empréstimo"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Valor Total (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={formData.amount || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      amount: parseFloat(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  placeholder="0,00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Prioridade
                </label>
                <select
                  required
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      priority: e.target.value as DebtPriority,
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                >
                  <option value="Alta">Alta (Urgente)</option>
                  <option value="Média">Média</option>
                  <option value="Baixa">Baixa</option>
                </select>
              </div>
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 transition-colors"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
