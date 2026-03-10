export type Category = string;

export interface Expense {
  id: string;
  date: string; // YYYY-MM-DD
  amount: number;
  description: string;
  category: Category;
}

export type BillStatus = "Pendente" | "Paga" | "Atrasada";

export interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: string; // YYYY-MM-DD
  status: BillStatus;
}

export type DebtPriority = "Alta" | "Média" | "Baixa";

export interface Debt {
  id: string;
  type: string;
  institution: string;
  amount: number;
  priority: DebtPriority;
}

export interface AppState {
  expenses: Expense[];
  bills: Bill[];
  debts: Debt[];
  availableBalance: number;
}
