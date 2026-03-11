import React from "react";
import {
  LayoutDashboard,
  Receipt,
  CreditCard,
  AlertTriangle,
  PieChart,
  Target,
  TrendingUp,
  LogOut,
} from "lucide-react";
import { clsx } from "clsx";
import { useAuth } from "../context/AuthContext";

export type TabType =
  | "dashboard"
  | "expenses"
  | "bills"
  | "debts"
  | "reports"
  | "planning"
  | "investments";

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
}) => {
  const { signOut } = useAuth();
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "expenses", label: "Gastos Diários", icon: Receipt },
    { id: "bills", label: "Contas do Mês", icon: CreditCard },
    { id: "debts", label: "Dívidas", icon: AlertTriangle },
    { id: "reports", label: "Relatórios", icon: PieChart },
    { id: "planning", label: "Planejamento", icon: Target },
    { id: "investments", label: "Investimentos", icon: TrendingUp },
  ] as const;

  return (
    <aside className="w-64 bg-white border-r border-slate-100 flex flex-col h-full">
      <div className="p-8">
        <h1 className="text-xl font-semibold text-zinc-900 flex items-center gap-3">
          <div className="w-9 h-9 bg-zinc-900 rounded-full flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-sm">G</span>
          </div>
          Gestor
        </h1>
      </div>

      <nav className="flex-1 px-4 space-y-1.5 mt-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={clsx(
                "w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl transition-all duration-200 text-sm font-medium",
                isActive
                  ? "bg-zinc-100 text-zinc-900"
                  : "text-slate-500 hover:bg-slate-50 hover:text-zinc-900",
              )}
            >
              <Icon
                size={20}
                className={isActive ? "text-zinc-900" : "text-slate-400"}
                strokeWidth={isActive ? 2.5 : 2}
              />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="px-4 mb-4">
        <button
          onClick={signOut}
          className="w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl transition-all duration-200 text-sm font-medium text-red-500 hover:bg-red-50"
        >
          <LogOut size={20} strokeWidth={2} />
          Sair da Conta
        </button>
      </div>

      <div className="p-8 border-t border-slate-50">
        <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
          Gestor Pessoal &copy; {new Date().getFullYear()}
        </p>
      </div>
    </aside>
  );
};
