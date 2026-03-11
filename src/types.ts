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
  investments: Investment[];
  transactions: InvestmentTransaction[];
  dividends: Dividend[];
}

export type InvestmentType = "Ação" | "FII" | "Renda Fixa" | "Cripto";

export interface Investment {
  id: string;
  name: string;
  type: InvestmentType;
  shares: number;
  avgPrice: number;
  currentPrice: number;
}

export type TransactionType = "Compra" | "Venda";

export interface InvestmentTransaction {
  id: string;
  investmentId: string;
  type: TransactionType;
  date: string;
  shares: number;
  pricePerShare: number;
  brokerage?: number;
  observation?: string;
}

export type DividendType = "Dividendo" | "Rendimento FII" | "Juros";

export interface Dividend {
  id: string;
  investmentId: string;
  amount: number;
  date: string;
  type: DividendType;
}
