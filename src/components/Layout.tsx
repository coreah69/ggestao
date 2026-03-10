import React, { useState } from "react";
import { Sidebar, TabType } from "./Sidebar";
import { Dashboard } from "../pages/Dashboard";
import { Expenses } from "../pages/Expenses";
import { Bills } from "../pages/Bills";
import { Debts } from "../pages/Debts";
import { Reports } from "../pages/Reports";
import { Planning } from "../pages/Planning";
import { LayoutDashboard, Receipt, CreditCard, Target, AlertTriangle, PieChart, MoreHorizontal } from "lucide-react";
import { clsx } from "clsx";

export const Layout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "expenses":
        return <Expenses />;
      case "bills":
        return <Bills />;
      case "debts":
        return <Debts />;
      case "reports":
        return <Reports />;
      case "planning":
        return <Planning />;
      default:
        return <Dashboard />;
    }
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setIsMoreMenuOpen(false);
  };

  const bottomNavItems = [
    { id: "dashboard", label: "Início", icon: LayoutDashboard },
    { id: "expenses", label: "Gastos", icon: Receipt },
    { id: "bills", label: "Contas", icon: CreditCard },
  ] as const;

  const moreMenuItems = [
    { id: "debts", label: "Dívidas", icon: AlertTriangle },
    { id: "reports", label: "Relatórios", icon: PieChart },
    { id: "planning", label: "Planejamento", icon: Target },
  ] as const;

  return (
    <div className="flex min-h-screen bg-[#F7F7F9] font-sans text-zinc-900 pb-20 md:pb-0">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md flex items-center justify-between px-6 z-40 border-b border-slate-100">
        <h1 className="text-lg font-semibold text-zinc-900 flex items-center gap-2">
          <div className="w-8 h-8 bg-zinc-900 rounded-full flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-sm">G</span>
          </div>
          Gestor
        </h1>
      </div>

      {/* Sidebar Container (Desktop) */}
      <div className="hidden md:block sticky top-0 left-0 h-screen z-50">
        <Sidebar activeTab={activeTab} setActiveTab={handleTabChange} />
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-10 pt-24 md:pt-10 overflow-y-auto h-screen w-full">
        <div className="max-w-5xl mx-auto">{renderContent()}</div>
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-slate-100 z-50 flex justify-around items-center h-20 px-4 pb-4 pt-2">
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={clsx(
                "flex flex-col items-center justify-center w-full h-full gap-1.5 transition-all duration-200",
                isActive ? "text-zinc-900" : "text-slate-400 hover:text-zinc-600"
              )}
            >
              <Icon size={22} className={isActive ? "text-zinc-900" : "text-slate-400"} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium tracking-wide">{item.label}</span>
            </button>
          );
        })}
        
        {/* More Menu Button */}
        <div className="relative flex flex-col items-center justify-center w-full h-full">
          <button
            onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
            className={clsx(
              "flex flex-col items-center justify-center w-full h-full gap-1.5 transition-all duration-200",
              isMoreMenuOpen || moreMenuItems.some(m => m.id === activeTab) ? "text-zinc-900" : "text-slate-400 hover:text-zinc-600"
            )}
          >
            <MoreHorizontal size={22} className={isMoreMenuOpen || moreMenuItems.some(m => m.id === activeTab) ? "text-zinc-900" : "text-slate-400"} strokeWidth={isMoreMenuOpen || moreMenuItems.some(m => m.id === activeTab) ? 2.5 : 2} />
            <span className="text-[10px] font-medium tracking-wide">Mais</span>
          </button>

          {/* More Menu Popup */}
          {isMoreMenuOpen && (
            <>
              <div 
                className="fixed inset-0 z-40"
                onClick={() => setIsMoreMenuOpen(false)}
              />
              <div className="absolute bottom-20 right-2 bg-white/90 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-100/50 p-2 z-50 w-52 flex flex-col gap-1 mb-2">
                {moreMenuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleTabChange(item.id)}
                      className={clsx(
                        "flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 text-sm font-medium w-full text-left",
                        isActive
                          ? "bg-zinc-100 text-zinc-900"
                          : "hover:bg-slate-50 text-slate-600"
                      )}
                    >
                      <Icon
                        size={18}
                        className={isActive ? "text-zinc-900" : "text-slate-400"}
                        strokeWidth={isActive ? 2.5 : 2}
                      />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
