import React, { useState } from "react";
import { useFinance } from "../context/FinanceContext";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Plus, Edit2, Trash2, Search, Filter } from "lucide-react";
import { Expense, Category } from "../types";

export const Expenses: React.FC = () => {
  const { expenses, addExpense, updateExpense, deleteExpense, categories, addCategory, loading } = useFinance();

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-zinc-900/10 border-t-zinc-900 rounded-full animate-spin"></div>
      </div>
    );
  }
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Omit<Expense, "id">>({
    date: format(new Date(), "yyyy-MM-dd"),
    amount: 0,
    description: "",
    category: "Outros",
  });

  const [filterMonth, setFilterMonth] = useState(format(new Date(), "yyyy-MM"));
  const [filterCategory, setFilterCategory] = useState<Category | "Todas">(
    "Todas",
  );

  const filteredExpenses = expenses
    .filter((e) => {
      const matchMonth = e.date.startsWith(filterMonth);
      const matchCategory =
        filterCategory === "Todas" || e.category === filterCategory;
      return matchMonth && matchCategory;
    })
    .sort((a, b) => b.date.localeCompare(a.date));

  const totalMonth = filteredExpenses.reduce(
    (acc, curr) => acc + curr.amount,
    0,
  );
  const totalDay = filteredExpenses
    .filter((e) => e.date === format(new Date(), "yyyy-MM-dd"))
    .reduce((acc, curr) => acc + curr.amount, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.category) {
      addCategory(formData.category);
    }
    if (editingId) {
      updateExpense(editingId, formData);
    } else {
      addExpense(formData);
    }
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({
      date: format(new Date(), "yyyy-MM-dd"),
      amount: 0,
      description: "",
      category: "Outros",
    });
  };

  const handleEdit = (expense: Expense) => {
    setFormData({
      date: expense.date,
      amount: expense.amount,
      description: expense.description,
      category: expense.category,
    });
    setEditingId(expense.id);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-semibold text-zinc-900 tracking-tight mb-1">Gastos Diários</h1>
          <p className="text-[15px] text-slate-500 font-medium">
            Registre e acompanhe suas despesas do dia a dia
          </p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setFormData({
              date: format(new Date(), "yyyy-MM-dd"),
              amount: 0,
              description: "",
              category: "Outros",
            });
            setIsModalOpen(true);
          }}
          className="bg-zinc-900 hover:bg-zinc-800 text-white px-5 py-2.5 rounded-2xl font-medium flex items-center gap-2 transition-all duration-200 shadow-[0_4px_14px_rgba(0,0,0,0.1)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)]"
        >
          <Plus size={20} />
          Novo Gasto
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-7 rounded-3xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100/60">
          <h3 className="text-[13px] font-medium text-slate-500 tracking-wide mb-2">
            Total no Dia (Hoje)
          </h3>
          <p className="text-3xl font-semibold tracking-tight text-zinc-900">
            R$ {totalDay.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-white p-7 rounded-3xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100/60">
          <h3 className="text-[13px] font-medium text-slate-500 tracking-wide mb-2">
            Total no Mês Selecionado
          </h3>
          <p className="text-3xl font-semibold tracking-tight text-zinc-900">
            R${" "}
            {totalMonth.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100/60 overflow-hidden">
        <div className="p-5 border-b border-slate-100/60 flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-50/30">
          <div className="flex items-center gap-2 text-slate-600 font-medium text-[15px]">
            <Filter size={18} />
            Filtros
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <input
              type="month"
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[15px] font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all"
            />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value as any)}
              className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[15px] font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all"
            >
              <option value="Todas">Todas as Categorias</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500 text-[13px] uppercase tracking-wider border-b border-slate-100/60">
                <th className="p-5 font-medium">Data</th>
                <th className="p-5 font-medium">Descrição</th>
                <th className="p-5 font-medium">Categoria</th>
                <th className="p-5 font-medium text-right">Valor</th>
                <th className="p-5 font-medium text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-[15px] text-slate-400 font-medium">
                    Nenhum gasto encontrado para os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((expense) => (
                  <tr
                    key={expense.id}
                    className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="p-5 text-[15px] text-slate-500 font-medium whitespace-nowrap">
                      {format(parseISO(expense.date), "dd/MM/yyyy")}
                    </td>
                    <td className="p-5 text-[15px] font-medium text-zinc-900">
                      {expense.description}
                    </td>
                    <td className="p-5">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-[13px] font-medium bg-slate-100 text-slate-600 whitespace-nowrap">
                        {expense.category}
                      </span>
                    </td>
                    <td className="p-5 text-[15px] font-semibold text-zinc-900 text-right whitespace-nowrap">
                      R${" "}
                      {expense.amount.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="p-5 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEdit(expense)}
                        className="p-2 text-slate-400 hover:text-zinc-900 hover:bg-slate-100 rounded-xl transition-all"
                      >
                        <Edit2 size={16} strokeWidth={2.5} />
                      </button>
                      <button
                        onClick={() => deleteExpense(expense.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 size={16} strokeWidth={2.5} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden flex flex-col">
          {filteredExpenses.length === 0 ? (
            <div className="p-10 text-center text-[15px] text-slate-400 font-medium">
              Nenhum gasto encontrado para os filtros selecionados.
            </div>
          ) : (
            filteredExpenses.map((expense) => (
              <div
                key={expense.id}
                className="p-5 border-b border-slate-100/60 flex flex-col gap-3 hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-[15px] font-semibold text-zinc-900">
                      {expense.description}
                    </span>
                    <span className="text-[13px] text-slate-500 font-medium">
                      {format(parseISO(expense.date), "dd/MM/yyyy")}
                    </span>
                  </div>
                  <span className="text-[16px] font-bold text-zinc-900 whitespace-nowrap">
                    R${" "}
                    {expense.amount.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-[12px] font-medium bg-slate-100 text-slate-600">
                    {expense.category}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(expense)}
                      className="p-2 text-slate-400 hover:text-zinc-900 hover:bg-slate-100 rounded-xl transition-all"
                    >
                      <Edit2 size={16} strokeWidth={2.5} />
                    </button>
                    <button
                      onClick={() => deleteExpense(expense.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash2 size={16} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100/50">
            <div className="p-7 border-b border-slate-100/60">
              <h2 className="text-xl font-semibold text-zinc-900 tracking-tight">
                {editingId ? "Editar Gasto" : "Novo Gasto"}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-7 space-y-5">
              <div>
                <label className="block text-[13px] font-medium text-slate-500 mb-2 tracking-wide">
                  Data
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-[15px] font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 focus:bg-white transition-all"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-slate-500 mb-2 tracking-wide">
                  Valor (R$)
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
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-[15px] font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 focus:bg-white transition-all"
                  placeholder="0,00"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-slate-500 mb-2 tracking-wide">
                  Descrição
                </label>
                <input
                  type="text"
                  required
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-[15px] font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 focus:bg-white transition-all"
                  placeholder="Ex: Supermercado"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-slate-500 mb-2 tracking-wide">
                  Categoria
                </label>
                <input
                  type="text"
                  required
                  list="categories-list"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      category: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-[15px] font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 focus:bg-white transition-all"
                  placeholder="Selecione ou digite uma nova"
                />
                <datalist id="categories-list">
                  {categories.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>
              <div className="pt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-5 py-3 border border-slate-200 text-slate-600 rounded-2xl font-medium hover:bg-slate-50 transition-all duration-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-5 py-3 bg-zinc-900 text-white rounded-2xl font-medium hover:bg-zinc-800 transition-all duration-200 shadow-[0_4px_14px_rgba(0,0,0,0.1)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)]"
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
