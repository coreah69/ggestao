import React, { useState } from "react";
import { useFinance } from "../context/FinanceContext";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  AlertCircle,
  Clock,
} from "lucide-react";
import { Bill, BillStatus } from "../types";
import { clsx } from "clsx";

export const Bills: React.FC = () => {
  const { bills, addBill, updateBill, deleteBill, markBillAsPaid, loading } =
    useFinance();

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-zinc-900/10 border-t-zinc-900 rounded-full animate-spin"></div>
      </div>
    );
  }
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Omit<Bill, "id">>({
    name: "",
    amount: 0,
    dueDate: format(new Date(), "yyyy-MM-dd"),
    status: "Pendente",
  });

  const [filterMonth, setFilterMonth] = useState(format(new Date(), "yyyy-MM"));

  const filteredBills = bills
    .filter((b) => b.dueDate.startsWith(filterMonth))
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  const totalMonth = filteredBills.reduce((acc, curr) => acc + curr.amount, 0);
  const totalPaid = filteredBills
    .filter((b) => b.status === "Paga")
    .reduce((acc, curr) => acc + curr.amount, 0);
  const totalPending = filteredBills
    .filter((b) => b.status !== "Paga")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateBill(editingId, formData);
    } else {
      addBill(formData);
    }
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({
      name: "",
      amount: 0,
      dueDate: format(new Date(), "yyyy-MM-dd"),
      status: "Pendente",
    });
  };

  const handleEdit = (bill: Bill) => {
    setFormData({
      name: bill.name,
      amount: bill.amount,
      dueDate: bill.dueDate,
      status: bill.status,
    });
    setEditingId(bill.id);
    setIsModalOpen(true);
  };

  const getStatusIcon = (status: BillStatus) => {
    switch (status) {
      case "Paga":
        return <CheckCircle size={16} className="text-emerald-500" />;
      case "Atrasada":
        return <AlertCircle size={16} className="text-red-500" />;
      case "Pendente":
        return <Clock size={16} className="text-amber-500" />;
    }
  };

  const getStatusClass = (status: BillStatus) => {
    switch (status) {
      case "Paga":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Atrasada":
        return "bg-red-50 text-red-700 border-red-200";
      case "Pendente":
        return "bg-amber-50 text-amber-700 border-amber-200";
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-semibold text-zinc-900 tracking-tight mb-1">Contas do Mês</h1>
          <p className="text-[15px] text-slate-500 font-medium">
            Gerencie seus pagamentos e vencimentos
          </p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setFormData({
              name: "",
              amount: 0,
              dueDate: format(new Date(), "yyyy-MM-dd"),
              status: "Pendente",
            });
            setIsModalOpen(true);
          }}
          className="bg-zinc-900 hover:bg-zinc-800 text-white px-5 py-2.5 rounded-2xl font-medium flex items-center gap-2 transition-all duration-200 shadow-[0_4px_14px_rgba(0,0,0,0.1)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)]"
        >
          <Plus size={20} />
          Nova Conta
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-7 rounded-3xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100/60">
          <h3 className="text-[13px] font-medium text-slate-500 tracking-wide mb-2">
            Total do Mês
          </h3>
          <p className="text-3xl font-semibold tracking-tight text-zinc-900">
            R${" "}
            {totalMonth.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-white p-7 rounded-3xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100/60">
          <h3 className="text-[13px] font-medium text-slate-500 tracking-wide mb-2">
            Total Pago
          </h3>
          <p className="text-3xl font-semibold tracking-tight text-emerald-600">
            R$ {totalPaid.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-white p-7 rounded-3xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100/60">
          <h3 className="text-[13px] font-medium text-slate-500 tracking-wide mb-2">
            Total Pendente
          </h3>
          <p className="text-3xl font-semibold tracking-tight text-amber-600">
            R${" "}
            {totalPending.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100/60 overflow-hidden">
        <div className="p-5 border-b border-slate-100/60 flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-50/30">
          <div className="flex items-center gap-2 text-slate-600 font-medium text-[15px]">
            Mês de Referência
          </div>
          <input
            type="month"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[15px] font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all"
          />
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500 text-[13px] uppercase tracking-wider border-b border-slate-100/60">
                <th className="p-5 font-medium">Conta</th>
                <th className="p-5 font-medium">Vencimento</th>
                <th className="p-5 font-medium text-right">Valor</th>
                <th className="p-5 font-medium text-center">Status</th>
                <th className="p-5 font-medium text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredBills.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-[15px] text-slate-400 font-medium">
                    Nenhuma conta encontrada para o mês selecionado.
                  </td>
                </tr>
              ) : (
                filteredBills.map((bill) => (
                  <tr
                    key={bill.id}
                    className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="p-5 text-[15px] font-medium text-zinc-900">
                      {bill.name}
                    </td>
                    <td className="p-5 text-[15px] text-slate-500 font-medium whitespace-nowrap">
                      {format(parseISO(bill.dueDate), "dd/MM/yyyy")}
                    </td>
                    <td className="p-5 text-[15px] font-semibold text-zinc-900 text-right whitespace-nowrap">
                      R${" "}
                      {bill.amount.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="p-5 text-center">
                      <span
                        className={clsx(
                          "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[13px] font-medium border",
                          getStatusClass(bill.status),
                        )}
                      >
                        {getStatusIcon(bill.status)}
                        {bill.status}
                      </span>
                    </td>
                    <td className="p-5 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {bill.status !== "Paga" && (
                        <button
                          onClick={() => markBillAsPaid(bill.id)}
                          title="Marcar como Paga"
                          className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                        >
                          <CheckCircle size={16} strokeWidth={2.5} />
                        </button>
                      )}
                      <button
                        onClick={() => handleEdit(bill)}
                        className="p-2 text-slate-400 hover:text-zinc-900 hover:bg-slate-100 rounded-xl transition-all"
                      >
                        <Edit2 size={16} strokeWidth={2.5} />
                      </button>
                      <button
                        onClick={() => deleteBill(bill.id)}
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
          {filteredBills.length === 0 ? (
            <div className="p-10 text-center text-[15px] text-slate-400 font-medium">
              Nenhuma conta encontrada para o mês selecionado.
            </div>
          ) : (
            filteredBills.map((bill) => (
              <div
                key={bill.id}
                className="p-5 border-b border-slate-100/60 flex flex-col gap-3 hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-[15px] font-semibold text-zinc-900">
                      {bill.name}
                    </span>
                    <span className="text-[13px] text-slate-500 font-medium">
                      Vence em: {format(parseISO(bill.dueDate), "dd/MM/yyyy")}
                    </span>
                  </div>
                  <span className="text-[16px] font-bold text-zinc-900 whitespace-nowrap">
                    R${" "}
                    {bill.amount.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span
                    className={clsx(
                      "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-medium border",
                      getStatusClass(bill.status),
                    )}
                  >
                    {getStatusIcon(bill.status)}
                    {bill.status}
                  </span>
                  <div className="flex items-center gap-1">
                    {bill.status !== "Paga" && (
                      <button
                        onClick={() => markBillAsPaid(bill.id)}
                        title="Marcar como Paga"
                        className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                      >
                        <CheckCircle size={16} strokeWidth={2.5} />
                      </button>
                    )}
                    <button
                      onClick={() => handleEdit(bill)}
                      className="p-2 text-slate-400 hover:text-zinc-900 hover:bg-slate-100 rounded-xl transition-all"
                    >
                      <Edit2 size={16} strokeWidth={2.5} />
                    </button>
                    <button
                      onClick={() => deleteBill(bill.id)}
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
                {editingId ? "Editar Conta" : "Nova Conta"}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-7 space-y-5">
              <div>
                <label className="block text-[13px] font-medium text-slate-500 mb-2 tracking-wide">
                  Nome da Conta
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-[15px] font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 focus:bg-white transition-all"
                  placeholder="Ex: Aluguel, Luz, Internet"
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
                  Data de Vencimento
                </label>
                <input
                  type="date"
                  required
                  value={formData.dueDate}
                  onChange={(e) =>
                    setFormData({ ...formData, dueDate: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-[15px] font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 focus:bg-white transition-all"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-slate-500 mb-2 tracking-wide">
                  Status
                </label>
                <select
                  required
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as BillStatus,
                    })
                  }
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-[15px] font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 focus:bg-white transition-all"
                >
                  <option value="Pendente">Pendente</option>
                  <option value="Paga">Paga</option>
                  <option value="Atrasada">Atrasada</option>
                </select>
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
