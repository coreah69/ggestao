import React, { createContext, useContext, useState, useEffect } from "react";
import { Expense, Bill, Debt, AppState } from "../types";
import { format } from "date-fns";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";

interface FinanceContextType extends AppState {
  categories: string[];
  addCategory: (category: string) => void;
  addExpense: (expense: Omit<Expense, "id">) => Promise<void>;
  updateExpense: (id: string, expense: Omit<Expense, "id">) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;

  addBill: (bill: Omit<Bill, "id">) => Promise<void>;
  updateBill: (id: string, bill: Omit<Bill, "id">) => Promise<void>;
  deleteBill: (id: string) => Promise<void>;
  markBillAsPaid: (id: string) => Promise<void>;

  addDebt: (debt: Omit<Debt, "id">) => Promise<void>;
  updateDebt: (id: string, debt: Omit<Debt, "id">) => Promise<void>;
  deleteDebt: (id: string) => Promise<void>;

  setAvailableBalance: (balance: number) => void;
  loading: boolean;

  // Modal states for persistence
  billModal: { isOpen: boolean; editingId: string | null; formData: Omit<Bill, "id"> };
  setBillModal: React.Dispatch<React.SetStateAction<{ isOpen: boolean; editingId: string | null; formData: Omit<Bill, "id"> }>>;

  expenseModal: { isOpen: boolean; editingId: string | null; formData: Omit<Expense, "id"> };
  setExpenseModal: React.Dispatch<React.SetStateAction<{ isOpen: boolean; editingId: string | null; formData: Omit<Expense, "id"> }>>;

  debtModal: { isOpen: boolean; editingId: string | null; formData: Omit<Debt, "id"> };
  setDebtModal: React.Dispatch<React.SetStateAction<{ isOpen: boolean; editingId: string | null; formData: Omit<Debt, "id"> }>>;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>(["Contas", "Alimentação", "Manutenção", "Amor", "Outros"]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [availableBalance, setAvailableBalance] = useState<number>(0);

  // Modal Persistence States
  const [billModal, setBillModal] = useState<{ isOpen: boolean; editingId: string | null; formData: Omit<Bill, "id"> }>({
    isOpen: false,
    editingId: null,
    formData: { name: "", amount: 0, dueDate: format(new Date(), "yyyy-MM-dd"), status: "Pendente" }
  });

  const [expenseModal, setExpenseModal] = useState<{ isOpen: boolean; editingId: string | null; formData: Omit<Expense, "id"> }>({
    isOpen: false,
    editingId: null,
    formData: { date: format(new Date(), "yyyy-MM-dd"), amount: 0, description: "", category: "Outros" }
  });

  const [debtModal, setDebtModal] = useState<{ isOpen: boolean; editingId: string | null; formData: Omit<Debt, "id"> }>({
    isOpen: false,
    editingId: null,
    formData: { type: "", institution: "", amount: 0, priority: "Média" }
  });

  useEffect(() => {
    if (!user) {
      setExpenses([]);
      setBills([]);
      setDebts([]);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);

        const [
          { data: expensesData, error: expensesError },
          { data: billsData, error: billsError },
          { data: debtsData, error: debtsError },
          { data: profileData, error: profileError }
        ] = await Promise.all([
          supabase.from('expenses').select('*').order('date', { ascending: false }),
          supabase.from('bills').select('*').order('due_date', { ascending: true }),
          supabase.from('debts').select('*').order('amount', { ascending: false }),
          supabase.from('profiles').select('available_balance').eq('id', user.id).single()
        ]);

        if (expensesError) console.error("Error fetching expenses:", expensesError);
        if (billsError) console.error("Error fetching bills:", billsError);
        if (debtsError) console.error("Error fetching debts:", debtsError);
        // Silencing profileError since it might just mean the profile doesn't exist yet for a new user

        if (expensesData) setExpenses(expensesData as Expense[]);
        if (billsData) {
          setBills(billsData.map(b => ({
            id: b.id,
            name: b.name,
            amount: b.amount,
            dueDate: b.due_date,
            status: b.status
          })));
        }
        if (debtsData) setDebts(debtsData as Debt[]);
        if (profileData) setAvailableBalance(profileData.available_balance || 0);
      } catch (error) {
        console.error("Critical error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Sync available balance to Supabase (debounced or on change)
  useEffect(() => {
    if (user && !loading) {
      supabase.from('profiles').upsert({ id: user.id, available_balance: availableBalance });
    }
  }, [availableBalance, user, loading]);

  const addCategory = (category: string) => {
    if (category && !categories.includes(category)) {
      setCategories([...categories, category]);
    }
  };

  const addExpense = async (expense: Omit<Expense, "id">) => {
    if (!user) return;
    const { data, error } = await supabase
      .from('expenses')
      .insert([{ ...expense, user_id: user.id }])
      .select()
      .single();
    if (data && !error) {
      setExpenses([data as Expense, ...expenses]);
    }
  };

  const updateExpense = async (id: string, expense: Omit<Expense, "id">) => {
    const { error } = await supabase
      .from('expenses')
      .update(expense)
      .eq('id', id);
    if (!error) {
      setExpenses(expenses.map((e) => (e.id === id ? { ...expense, id } : e)));
    }
  };

  const deleteExpense = async (id: string) => {
    const { error } = await supabase.from('expenses').delete().eq('id', id);
    if (!error) {
      setExpenses(expenses.filter((e) => e.id !== id));
    }
  };

  const addBill = async (bill: Omit<Bill, "id">) => {
    if (!user) return;
    const { data, error } = await supabase
      .from('bills')
      .insert([{
        name: bill.name,
        amount: bill.amount,
        due_date: bill.dueDate,
        status: bill.status,
        user_id: user.id
      }])
      .select()
      .single();
    if (data && !error) {
      setBills([...bills, { ...bill, id: data.id }]);
    }
  };

  const updateBill = async (id: string, bill: Omit<Bill, "id">) => {
    const { error } = await supabase
      .from('bills')
      .update({
        name: bill.name,
        amount: bill.amount,
        due_date: bill.dueDate,
        status: bill.status
      })
      .eq('id', id);
    if (!error) {
      setBills(bills.map((b) => (b.id === id ? { ...bill, id } : b)));
    }
  };

  const deleteBill = async (id: string) => {
    const { error } = await supabase.from('bills').delete().eq('id', id);
    if (!error) {
      setBills(bills.filter((b) => b.id !== id));
    }
  };

  const markBillAsPaid = async (id: string) => {
    const { error } = await supabase.from('bills').update({ status: 'Paga' }).eq('id', id);
    if (!error) {
      setBills(bills.map((b) => (b.id === id ? { ...b, status: "Paga" } : b)));
    }
  };

  const addDebt = async (debt: Omit<Debt, "id">) => {
    if (!user) return;
    const { data, error } = await supabase
      .from('debts')
      .insert([{ ...debt, user_id: user.id }])
      .select()
      .single();
    if (data && !error) {
      setDebts([...debts, { ...debt, id: data.id }]);
    }
  };

  const updateDebt = async (id: string, debt: Omit<Debt, "id">) => {
    const { error } = await supabase.from('debts').update(debt).eq('id', id);
    if (!error) {
      setDebts(debts.map((d) => (d.id === id ? { ...debt, id } : d)));
    }
  };

  const deleteDebt = async (id: string) => {
    const { error } = await supabase.from('debts').delete().eq('id', id);
    if (!error) {
      setDebts(debts.filter((d) => d.id !== id));
    }
  };

  return (
    <FinanceContext.Provider
      value={{
        categories,
        addCategory,
        expenses,
        bills,
        debts,
        availableBalance,
        addExpense,
        updateExpense,
        deleteExpense,
        addBill,
        updateBill,
        deleteBill,
        markBillAsPaid,
        addDebt,
        updateDebt,
        deleteDebt,
        setAvailableBalance,
        loading,
        billModal,
        setBillModal,
        expenseModal,
        setExpenseModal,
        debtModal,
        setDebtModal
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context)
    throw new Error("useFinance must be used within FinanceProvider");
  return context;
};
