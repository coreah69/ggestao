import React, { createContext, useContext, useState, useEffect } from "react";
import {
  Expense,
  Bill,
  Debt,
  AppState,
  Investment,
  InvestmentTransaction,
  Dividend,
  InvestmentType,
  TransactionType,
  DividendType
} from "../types";
import { format } from "date-fns";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";

interface FinanceContextType extends AppState {
  loading: boolean;
  setAvailableBalance: (balance: number) => void;

  investments: Investment[];
  addInvestment: (investment: Omit<Investment, "id">) => Promise<void>;
  updateInvestment: (id: string, investment: Omit<Investment, "id">) => Promise<void>;
  deleteInvestment: (id: string) => Promise<void>;

  transactions: InvestmentTransaction[];
  addTransaction: (transaction: Omit<InvestmentTransaction, "id">) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;

  dividends: Dividend[];
  addDividend: (dividend: Omit<Dividend, "id">) => Promise<void>;
  deleteDividend: (id: string) => Promise<void>;

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
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [transactions, setTransactions] = useState<InvestmentTransaction[]>([]);
  const [dividends, setDividends] = useState<Dividend[]>([]);
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
      setInvestments([]);
      setTransactions([]);
      setDividends([]);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);

      const [
        { data: expensesData },
        { data: billsData },
        { data: debtsData },
        { data: profileData },
        { data: investmentsData },
        { data: transactionsData },
        { data: dividendsData }
      ] = await Promise.all([
        supabase.from('expenses').select('*').order('date', { ascending: false }),
        supabase.from('bills').select('*').order('due_date', { ascending: true }),
        supabase.from('debts').select('*').order('amount', { ascending: false }),
        supabase.from('profiles').select('available_balance').eq('id', user.id).single(),
        supabase.from('investments').select('*').order('name', { ascending: true }),
        supabase.from('investment_transactions').select('*').order('date', { ascending: false }),
        supabase.from('dividends').select('*').order('date', { ascending: false })
      ]);

      if (expensesData) setExpenses(expensesData as Expense[]);
      if (billsData) {
        setBills(billsData.map(b => ({
          id: b.id,
          name: b.name,
          amount: Number(b.amount),
          dueDate: b.due_date,
          status: b.status
        })));
      }
      if (debtsData) setDebts(debtsData as Debt[]);
      if (profileData) setAvailableBalance(profileData.available_balance || 0);

      if (investmentsData) {
        setInvestments(investmentsData.map(i => ({
          id: i.id,
          name: i.name,
          type: i.type as InvestmentType,
          shares: Number(i.shares),
          avgPrice: Number(i.avg_price),
          currentPrice: Number(i.current_price)
        })));
      }
      if (transactionsData) {
        setTransactions(transactionsData.map(t => ({
          id: t.id,
          investmentId: t.investment_id,
          type: t.type as TransactionType,
          date: t.date,
          shares: Number(t.shares),
          pricePerShare: Number(t.price_per_share),
          brokerage: Number(t.brokerage),
          observation: t.observation
        })));
      }
      if (dividendsData) {
        setDividends(dividendsData.map(d => ({
          id: d.id,
          investmentId: d.investment_id,
          amount: Number(d.amount),
          date: d.date,
          type: d.type as DividendType
        })));
      }
      setLoading(false);
    };

    fetchData();
  }, [user]);

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

  const addInvestment = async (investment: Omit<Investment, "id">) => {
    if (!user) return;
    const { data, error } = await supabase
      .from('investments')
      .insert([{
        name: investment.name,
        type: investment.type,
        shares: investment.shares,
        avg_price: investment.avgPrice,
        current_price: investment.currentPrice,
        user_id: user.id
      }])
      .select()
      .single();
    if (data && !error) {
      setInvestments([...investments, { ...investment, id: data.id }]);
    }
  };

  const updateInvestment = async (id: string, investment: Omit<Investment, "id">) => {
    const { error } = await supabase
      .from('investments')
      .update({
        name: investment.name,
        type: investment.type,
        shares: investment.shares,
        avg_price: investment.avgPrice,
        current_price: investment.currentPrice
      })
      .eq('id', id);
    if (!error) {
      setInvestments(investments.map((i) => (i.id === id ? { ...investment, id } : i)));
    }
  };

  const deleteInvestment = async (id: string) => {
    const { error } = await supabase.from('investments').delete().eq('id', id);
    if (!error) {
      setInvestments(investments.filter((i) => i.id !== id));
    }
  };

  const addTransaction = async (transaction: Omit<InvestmentTransaction, "id">) => {
    if (!user) return;
    const { data, error } = await supabase
      .from('investment_transactions')
      .insert([{
        investment_id: transaction.investmentId,
        type: transaction.type,
        date: transaction.date,
        shares: transaction.shares,
        price_per_share: transaction.pricePerShare,
        brokerage: transaction.brokerage,
        observation: transaction.observation,
        user_id: user.id
      }])
      .select()
      .single();
    if (data && !error) {
      setTransactions([{ ...transaction, id: data.id }, ...transactions]);

      const inv = investments.find(i => i.id === transaction.investmentId);
      if (inv) {
        let newShares = inv.shares;
        let newAvgPrice = inv.avgPrice;

        if (transaction.type === "Compra") {
          const totalCostBefore = inv.shares * inv.avgPrice;
          const totalCostNew = transaction.shares * transaction.pricePerShare;
          newShares += transaction.shares;
          newAvgPrice = (totalCostBefore + totalCostNew) / newShares;
        } else {
          newShares -= transaction.shares;
        }

        updateInvestment(inv.id, { ...inv, shares: newShares, avgPrice: newAvgPrice });
      }
    }
  };

  const deleteTransaction = async (id: string) => {
    const { error } = await supabase.from('investment_transactions').delete().eq('id', id);
    if (!error) {
      setTransactions(transactions.filter((t) => t.id !== id));
    }
  };

  const addDividend = async (dividend: Omit<Dividend, "id">) => {
    if (!user) return;
    const { data, error } = await supabase
      .from('dividends')
      .insert([{
        investment_id: dividend.investmentId,
        amount: dividend.amount,
        date: dividend.date,
        type: dividend.type,
        user_id: user.id
      }])
      .select()
      .single();
    if (data && !error) {
      setDividends([{ ...dividend, id: data.id }, ...dividends]);
    }
  };

  const deleteDividend = async (id: string) => {
    const { error } = await supabase.from('dividends').delete().eq('id', id);
    if (!error) {
      setDividends(dividends.filter((d) => d.id !== id));
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
        setDebtModal,
        investments,
        addInvestment,
        updateInvestment,
        deleteInvestment,
        transactions,
        addTransaction,
        deleteTransaction,
        dividends,
        addDividend,
        deleteDividend
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
