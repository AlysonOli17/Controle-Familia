export type TransactionType = 'income' | 'expense';

export type TransactionCategory =
  | 'Moradia'
  | 'Alimentação'
  | 'Supermercado'
  | 'Transporte'
  | 'Saúde'
  | 'Educação'
  | 'Lazer & Viagem'
  | 'Assinaturas & Serviços'
  | 'Compras & Vestuário'
  | 'Investimentos'
  | 'Salário'
  | 'Rendimentos'
  | 'Freelance / Extra'
  | 'Outros';

export type PaymentMethod =
  | 'pix'
  | 'credit_card'
  | 'debit_card'
  | 'boleto'
  | 'transfer'
  | 'cash';

export interface FamilyMember {
  id: string;
  name: string;
  role: 'Pai' | 'Mãe' | 'Filho' | 'Filha' | 'Conjunta';
  monthlyBudgetLimit: number;
  avatarColor: string;
  avatarInitials: string;
  email?: string;
}

export interface BankAccount {
  id: string;
  institutionName: string;
  institutionCode: string;
  accountType: 'checking' | 'credit' | 'savings' | 'investment';
  accountNumber: string;
  balance: number;
  creditLimit?: number;
  currentInvoice?: number;
  lastSyncAt: string;
  color: string;
  syncStatus: 'synced' | 'syncing' | 'error' | 'disconnected';
  autoSync: boolean;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: TransactionCategory;
  date: string; // YYYY-MM-DD
  paymentMethod: PaymentMethod;
  accountId: string;
  memberId: string;
  status: 'completed' | 'pending';
  dueDate?: string; // YYYY-MM-DD for pending bills
  isRecurring?: boolean;
  notes?: string;
  tags?: string[];
  createdAt: string;
}

export interface SavingsGoalHistory {
  id: string;
  amount: number;
  date: string;
  memberId: string;
  note?: string;
}

export interface SavingsGoal {
  id: string;
  title: string;
  category: 'emergency_fund' | 'travel' | 'car' | 'home' | 'education' | 'investment' | 'custom';
  targetAmount: number;
  currentAmount: number;
  deadline: string; // YYYY-MM-DD
  assignedTo: string; // memberId or 'family'
  notes?: string;
  createdAt: string;
  history: SavingsGoalHistory[];
}

export interface CategoryBudget {
  category: TransactionCategory;
  limitAmount: number;
  alertThresholdPercent: number; // e.g. 80
}

export interface InvestmentAsset {
  id: string;
  name: string;
  type: 'CDB / Renda Fixa' | 'Tesouro Direto' | 'Ações BR' | 'Fundos Imobiliários' | 'Previdência Privada' | 'Criptoativos';
  institution: string;
  investedAmount: number;
  currentValue: number;
  profitabilityPercent: number;
  benchmark: string;
  lastUpdate: string;
}

export interface SmartNotification {
  id: string;
  title: string;
  message: string;
  type: 'bill_due' | 'impulse_warning' | 'goal_reached' | 'sync_success' | 'bottleneck_alert';
  severity: 'info' | 'warning' | 'danger' | 'success';
  timestamp: string;
  read: boolean;
  actionType?: 'view_bills' | 'view_budget' | 'view_goals' | 'view_bottlenecks' | 'view_bank';
}

export interface FinancialBottleneck {
  id: string;
  title: string;
  description: string;
  severity: 'alta' | 'media' | 'baixa';
  category: TransactionCategory | 'Geral';
  estimatedWasteMonthly: number;
  suggestedAction: string;
  affectedTransactionsCount: number;
}

export interface PredictiveBudgetSummary {
  currentExpense: number;
  currentIncome: number;
  currentBalance: number;
  daysPassed: number;
  daysRemaining: number;
  totalDaysInMonth: number;
  dailyBurnRate: number;
  projectedExpenseEndMonth: number;
  projectedBalanceEndMonth: number;
  isOverBudgetRisk: boolean;
  budgetDeficitForecast: number;
  savingsRateForecastPercent: number;
}
