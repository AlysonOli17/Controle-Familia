import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  initialFamilyMembers,
  initialBankAccounts,
  initialTransactions,
  initialSavingsGoals,
  initialCategoryBudgets,
  initialInvestmentAssets,
  initialNotifications,
} from './data/initialData';
import {
  BankAccount,
  CategoryBudget,
  FamilyMember,
  InvestmentAsset,
  SavingsGoal,
  SmartNotification,
  Transaction,
} from './types/finance';
import {
  calculatePredictiveBudgetSummary,
  detectFinancialBottlenecks,
} from './services/predictiveEngine';
import { simulateOpenFinanceSync } from './services/bankSync';
import { encryptAndSaveData, loadAndDecryptData } from './services/cryptoStorage';
import { HeaderNav, NavTab } from './components/HeaderNav';
import { DashboardOverview } from './components/DashboardOverview';
import { TransactionsManager } from './components/TransactionsManager';
import { GoalsManager } from './components/GoalsManager';
import { BankSyncManager } from './components/BankSyncManager';
import { InvestmentsManager } from './components/InvestmentsManager';
import { BottlenecksAndAIMenu } from './components/BottlenecksAndAIMenu';
import { NotificationDrawer } from './components/NotificationDrawer';
import { BiometricLockModal } from './components/BiometricLockModal';
import { AddTransactionModal } from './components/AddTransactionModal';

interface AppStorageState {
  transactions: Transaction[];
  accounts: BankAccount[];
  goals: SavingsGoal[];
  budgets: CategoryBudget[];
  investments: InvestmentAsset[];
  notifications: SmartNotification[];
  members: FamilyMember[];
}

export default function App() {
  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('finfamily_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // Navigation tab
  const [currentTab, setCurrentTab] = useState<NavTab>('overview');

  // Security / Lock State
  const [isLocked, setIsLocked] = useState(false);

  // Network State
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Modals & Drawers
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Main Finance Data States
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [accounts, setAccounts] = useState<BankAccount[]>(initialBankAccounts);
  const [members] = useState<FamilyMember[]>(initialFamilyMembers);
  const [goals, setGoals] = useState<SavingsGoal[]>(initialSavingsGoals);
  const [budgets, setBudgets] = useState<CategoryBudget[]>(initialCategoryBudgets);
  const [investments, setInvestments] = useState<InvestmentAsset[]>(initialInvestmentAssets);
  const [notifications, setNotifications] = useState<SmartNotification[]>(initialNotifications);
  const [isLoaded, setIsLoaded] = useState(false);

  // Efeito do tema no elemento HTML raiz
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('finfamily_theme', theme);
  }, [theme]);

  // Listener de status online/offline
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Carregar dados salvos criptografados na inicialização
  useEffect(() => {
    async function loadSavedData() {
      try {
        const decrypted = await loadAndDecryptData<AppStorageState>();
        if (decrypted) {
          if (decrypted.transactions) setTransactions(decrypted.transactions);
          if (decrypted.accounts) setAccounts(decrypted.accounts);
          if (decrypted.goals) setGoals(decrypted.goals);
          if (decrypted.budgets) setBudgets(decrypted.budgets);
          if (decrypted.investments) setInvestments(decrypted.investments);
          if (decrypted.notifications) setNotifications(decrypted.notifications);
        }
      } catch (e) {
        console.warn('Usando dados padrão:', e);
      } finally {
        setIsLoaded(true);
      }
    }
    loadSavedData();
  }, []);

  // Persistir dados criptografados sempre que houver alteração
  useEffect(() => {
    if (!isLoaded) return;
    const payload: AppStorageState = {
      transactions,
      accounts,
      goals,
      budgets,
      investments,
      notifications,
      members,
    };
    encryptAndSaveData(payload);
  }, [transactions, accounts, goals, budgets, investments, notifications, members, isLoaded]);

  // Motor Preditivo e Detecção de Gargalos reativos
  const predictiveSummary = useMemo(() => {
    return calculatePredictiveBudgetSummary(transactions);
  }, [transactions]);

  const bottlenecks = useMemo(() => {
    return detectFinancialBottlenecks(transactions, budgets);
  }, [transactions, budgets]);

  // Contas a pagar pendentes
  const pendingBills = useMemo(() => {
    return transactions.filter((t) => t.status === 'pending' && t.type === 'expense');
  }, [transactions]);

  // Toggle do tema claro/escuro
  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Adicionar novo lançamento
  const handleSaveNewTransaction = (
    newTxData: Omit<Transaction, 'id' | 'createdAt'>
  ) => {
    const newTx: Transaction = {
      ...newTxData,
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };

    setTransactions((prev) => [newTx, ...prev]);

    // Atualizar saldo da conta vinculada se for concluída
    if (newTx.status === 'completed') {
      setAccounts((prev) =>
        prev.map((acc) => {
          if (acc.id === newTx.accountId) {
            const delta = newTx.type === 'income' ? newTx.amount : -newTx.amount;
            return {
              ...acc,
              balance: Math.round((acc.balance + delta) * 100) / 100,
            };
          }
          return acc;
        })
      );
    }

    // Verificar se categoria ultrapassa limite para emitir notificação anti-impulso inteligente
    if (newTx.type === 'expense') {
      const catBudget = budgets.find((b) => b.category === newTx.category);
      if (catBudget) {
        const spentInCat = transactions
          .filter((t) => t.category === newTx.category && t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, newTx.amount);

        const pct = (spentInCat / catBudget.limitAmount) * 100;
        if (pct >= catBudget.alertThresholdPercent) {
          const alertNotif: SmartNotification = {
            id: `notif-impulse-${Date.now()}`,
            title: `Alerta Anti-Impulso: ${newTx.category}`,
            message: `Atenção: A família já consumiu ${pct.toFixed(0)}% do orçamento estipulado para ${newTx.category} (R$ ${spentInCat.toFixed(2)} de R$ ${catBudget.limitAmount.toFixed(2)}).`,
            type: 'impulse_warning',
            severity: pct >= 100 ? 'danger' : 'warning',
            timestamp: new Date().toISOString(),
            read: false,
            actionType: 'view_budget',
          };
          setNotifications((prev) => [alertNotif, ...prev]);
        }
      }
    }
  };

  // Excluir lançamento
  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  // Marcar conta como paga ou alternar status
  const handleToggleStatus = (id: string) => {
    setTransactions((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const newStatus = t.status === 'pending' ? 'completed' : 'pending';
          return { ...t, status: newStatus };
        }
        return t;
      })
    );
  };

  const handlePayBill = (billId: string) => {
    handleToggleStatus(billId);
  };

  // Sincronização automática com Open Finance
  const handleSyncAllAccounts = async () => {
    setIsSyncing(true);
    try {
      const result = await simulateOpenFinanceSync(accounts, transactions);
      setAccounts(result.updatedAccounts);
      if (result.newTransactions.length > 0) {
        setTransactions((prev) => [...result.newTransactions, ...prev]);

        // Gerar notificação de sucesso
        const notif: SmartNotification = {
          id: `sync-notif-${Date.now()}`,
          title: 'Sincronização Open Finance Concluída',
          message: `${result.totalSyncedCount} novas transações conciliadas e categorizadas automaticamente.`,
          type: 'sync_success',
          severity: 'success',
          timestamp: new Date().toISOString(),
          read: false,
          actionType: 'view_bank',
        };
        setNotifications((prev) => [notif, ...prev]);
      }
    } finally {
      setIsSyncing(false);
    }
  };

  // Adicionar nova conta bancária
  const handleAddAccount = (
    newAccount: Omit<BankAccount, 'id' | 'lastSyncAt' | 'syncStatus'>
  ) => {
    const acc: BankAccount = {
      ...newAccount,
      id: `acc-${Date.now()}`,
      lastSyncAt: new Date().toISOString(),
      syncStatus: 'synced',
    };
    setAccounts((prev) => [...prev, acc]);
  };

  // Criar nova meta
  const handleAddGoal = (newGoal: Omit<SavingsGoal, 'id' | 'createdAt' | 'history'>) => {
    const goal: SavingsGoal = {
      ...newGoal,
      id: `goal-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      history:
        newGoal.currentAmount > 0
          ? [
              {
                id: `h-init-${Date.now()}`,
                amount: newGoal.currentAmount,
                date: new Date().toISOString().split('T')[0],
                memberId: newGoal.assignedTo,
                note: 'Saldo inicial cadastrado',
              },
            ]
          : [],
    };
    setGoals((prev) => [...prev, goal]);
  };

  // Depositar em meta
  const handleAddDeposit = (
    goalId: string,
    amount: number,
    memberId: string,
    note?: string
  ) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id === goalId) {
          const newCurrent = g.currentAmount + amount;
          const newHistory = [
            ...g.history,
            {
              id: `dep-${Date.now()}`,
              amount,
              date: new Date().toISOString().split('T')[0],
              memberId,
              note,
            },
          ];

          if (newCurrent >= g.targetAmount && g.currentAmount < g.targetAmount) {
            // Notificação de meta atingida
            const notif: SmartNotification = {
              id: `notif-goal-${Date.now()}`,
              title: `Meta Conquistada: ${g.title}!`,
              message: `Parabéns para a família! Atingiram 100% do objetivo estipulado (R$ ${g.targetAmount.toLocaleString('pt-BR')}).`,
              type: 'goal_reached',
              severity: 'success',
              timestamp: new Date().toISOString(),
              read: false,
              actionType: 'view_goals',
            };
            setNotifications((n) => [notif, ...n]);
          }

          return {
            ...g,
            currentAmount: newCurrent,
            history: newHistory,
          };
        }
        return g;
      })
    );
  };

  // Adicionar ativo de investimento
  const handleAddInvestment = (newAsset: Omit<InvestmentAsset, 'id' | 'lastUpdate'>) => {
    const asset: InvestmentAsset = {
      ...newAsset,
      id: `inv-${Date.now()}`,
      lastUpdate: new Date().toISOString().split('T')[0],
    };
    setInvestments((prev) => [...prev, asset]);
  };

  // Notificações handlers
  const handleMarkNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // Mitigar gargalo da lista
  const handleApplySavingsRecommendation = (bottleneckId: string) => {
    // Registra notificação de economia confirmada
    const notif: SmartNotification = {
      id: `notif-bot-mitigated-${Date.now()}`,
      title: 'Ação Anti-Gargalo Aplicada',
      message: 'Plano de corte aplicado com sucesso. O orçamento mensal foi ajustado para evitar desperdícios.',
      type: 'bottleneck_alert',
      severity: 'info',
      timestamp: new Date().toISOString(),
      read: false,
      actionType: 'view_bottlenecks',
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors selection:bg-emerald-500 selection:text-white">
      {/* Top Bar Navigation */}
      <HeaderNav
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        notifications={notifications}
        onOpenNotifications={() => setIsNotificationDrawerOpen(true)}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onLockApp={() => setIsLocked(true)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        isOnline={isOnline}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'overview' && (
          <DashboardOverview
            summary={predictiveSummary}
            transactions={transactions}
            members={members}
            goals={goals}
            budgets={budgets}
            bottlenecks={bottlenecks}
            accounts={accounts}
            onNavigateTab={setCurrentTab}
            onOpenAddModal={() => setIsAddModalOpen(true)}
          />
        )}

        {currentTab === 'transactions' && (
          <TransactionsManager
            transactions={transactions}
            accounts={accounts}
            members={members}
            onAddTransactionClick={() => setIsAddModalOpen(true)}
            onDeleteTransaction={handleDeleteTransaction}
            onToggleStatus={handleToggleStatus}
          />
        )}

        {currentTab === 'goals' && (
          <GoalsManager
            goals={goals}
            members={members}
            onAddGoal={handleAddGoal}
            onAddDeposit={handleAddDeposit}
          />
        )}

        {currentTab === 'banks' && (
          <BankSyncManager
            accounts={accounts}
            onSyncAll={handleSyncAllAccounts}
            isSyncing={isSyncing}
            onAddAccount={handleAddAccount}
          />
        )}

        {currentTab === 'investments' && (
          <InvestmentsManager
            assets={investments}
            onAddAsset={handleAddInvestment}
          />
        )}

        {currentTab === 'bottlenecks' && (
          <BottlenecksAndAIMenu
            bottlenecks={bottlenecks}
            summary={predictiveSummary}
            transactions={transactions}
            onApplySavingsRecommendation={handleApplySavingsRecommendation}
          />
        )}
      </main>

      {/* Footer Minimalista */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-4 px-4 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>FinFamily · Gestão Financeira Familiar com Open Finance & Criptografia Local</span>
          <span className="font-mono text-[11px] text-slate-500">
            {isOnline ? 'Online · Modo Seguro Ativo' : 'Offline · Armazenamento Local AES-GCM'}
          </span>
        </div>
      </footer>

      {/* Modal: Novo Lançamento */}
      <AddTransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveNewTransaction}
        accounts={accounts}
        members={members}
      />

      {/* Drawer: Notificações & Contas a Vencer */}
      <NotificationDrawer
        isOpen={isNotificationDrawerOpen}
        onClose={() => setIsNotificationDrawerOpen(false)}
        notifications={notifications}
        pendingBills={pendingBills}
        onMarkNotificationRead={handleMarkNotificationRead}
        onMarkAllRead={handleMarkAllNotificationsRead}
        onPayBill={handlePayBill}
        onNavigateTab={setCurrentTab}
      />

      {/* Modal: Bloqueio Biométrico / PIN */}
      <BiometricLockModal
        isOpen={isLocked}
        onUnlock={() => setIsLocked(false)}
        masterPin="1234"
      />
    </div>
  );
}
