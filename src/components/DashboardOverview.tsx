import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  AlertCircle,
  ArrowRight,
  Flame,
  CheckCircle,
  FileSpreadsheet,
  Printer,
  Sparkles,
} from 'lucide-react';
import {
  CategoryBudget,
  FamilyMember,
  FinancialBottleneck,
  PredictiveBudgetSummary,
  SavingsGoal,
  Transaction,
  TransactionCategory,
} from '../types/finance';
import { exportTransactionsToCSV, printFinancialReportPDF } from '../services/exportService';


interface DashboardOverviewProps {
  summary: PredictiveBudgetSummary;
  transactions: Transaction[];
  members: FamilyMember[];
  goals: SavingsGoal[];
  budgets: CategoryBudget[];
  bottlenecks: FinancialBottleneck[];

  onNavigateTab: (tab: any) => void;
  onOpenAddModal: () => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  Moradia: '#3b82f6',
  Supermercado: '#10b981',
  Alimentação: '#f59e0b',
  Transporte: '#8b5cf6',
  Saúde: '#ec4899',
  Educação: '#06b6d4',
  'Lazer & Viagem': '#f97316',
  'Assinaturas & Serviços': '#6366f1',
  'Compras & Vestuário': '#14b8a6',
  Investimentos: '#22c55e',
  Salário: '#10b981',
  Rendimentos: '#0ea5e9',
  'Freelance / Extra': '#84cc16',
  Outros: '#94a3b8',
};

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  summary,
  transactions,
  members,
  goals,
  budgets,
  bottlenecks,

  onNavigateTab,
  onOpenAddModal,
}) => {
  const [activeCategoryHover, setActiveCategoryHover] = useState<string | null>(null);

  // Calcular despesas por categoria
  const completedExpenses = transactions.filter(
    (t) => t.type === 'expense' && t.status === 'completed'
  );
  const totalExpenseVal = completedExpenses.reduce((acc, t) => acc + t.amount, 0) || 1;

  const categoryTotals: Record<string, number> = {};
  completedExpenses.forEach((t) => {
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
  });

  const categoryEntries = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .map(([cat, amount]) => ({
      category: cat as TransactionCategory,
      amount,
      percentage: Math.round((amount / totalExpenseVal) * 100),
      color: CATEGORY_COLORS[cat] || '#94a3b8',
    }));

  // Gastos por membro da família
  const memberExpenses = members.map((m) => {
    const total = completedExpenses
      .filter((t) => (m.id === 'family' ? t.memberId === 'family' : t.memberId === m.id))
      .reduce((sum, t) => sum + t.amount, 0);

    const percent = m.monthlyBudgetLimit > 0 ? (total / m.monthlyBudgetLimit) * 100 : 0;
    return {
      member: m,
      spent: total,
      limit: m.monthlyBudgetLimit,
      percentage: Math.min(100, Math.round(percent)),
    };
  });

  // Contas pendentes a vencer logo
  const pendingExpenses = transactions.filter(
    (t) => t.status === 'pending' && t.type === 'expense'
  );
  const totalPendingVal = pendingExpenses.reduce((acc, t) => acc + t.amount, 0);

  const upcomingBills = pendingExpenses.slice(0, 3);

  // Donut SVG Math
  let cumulativeAngle = 0;
  const radius = 64;
  const strokeWidth = 24;
  const center = 90;
  const circumference = 2 * Math.PI * radius;

  // Dias do mês para gráfico de ritmo diário
  const now = new Date();
  const currentDay = now.getDate();
  const daysArray = Array.from({ length: summary.totalDaysInMonth }, (_, i) => i + 1);

  // Média acumulada por dia
  let runningTotal = 0;
  const dailyCumulative = daysArray.map((day) => {
    if (day <= currentDay) {
      // somar transações desse dia
      const dayTotal = completedExpenses
        .filter((t) => {
          const d = new Date(t.date).getDate();
          return d === day;
        })
        .reduce((sum, t) => sum + t.amount, 0);
      runningTotal += dayTotal;
      return { day, value: runningTotal, isProjected: false };
    } else {
      // projetado
      const projectedVal = runningTotal + summary.dailyBurnRate * (day - currentDay) * 0.7;
      return { day, value: projectedVal, isProjected: true };
    }
  });

  const maxCumulativeVal = Math.max(summary.projectedExpenseEndMonth * 1.1, 10000);

  return (
    <div className="space-y-6">
      {/* Top Welcome & Actions Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Painel Financeiro da Família
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Mês de {now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })} · {summary.daysRemaining} dias restantes
          </p>
        </div>

        {/* Quick export actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => exportTransactionsToCSV(transactions, [], members)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            title="Exportar todas as transações em CSV para Excel"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={() => printFinancialReportPDF(summary, bottlenecks, goals, transactions, members)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            title="Imprimir ou Salvar Relatório Completo em PDF"
          >
            <Printer className="w-3.5 h-3.5 text-blue-600" />
            <span>Relatório PDF</span>
          </button>
        </div>
      </div>

      {/* Main KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Receitas */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Receitas Realizadas
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-white">
            R$ {summary.currentIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Salários & Investimentos</span>
            <span>conciliados</span>
          </div>
        </div>

        {/* Despesas */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Despesas Realizadas
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-white">
            R$ {summary.currentExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span>Ritmo: <strong className="font-mono text-slate-700 dark:text-slate-300">R$ {summary.dailyBurnRate.toFixed(0)}/dia</strong></span>
          </div>
        </div>

        {/* Saldo Líquido Atual */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Saldo em Conta
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold font-mono tracking-tight text-emerald-600 dark:text-emerald-400">
            R$ {summary.currentBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Em 6 contas bancárias ativas
          </div>
        </div>

        {/* Projeção Inteligente Fim do Mês */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Previsão Fim do Mês
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-white">
            R$ {summary.projectedExpenseEndMonth.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
            <span>Poupança esperada:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
              {summary.savingsRateForecastPercent}%
            </span>
          </div>
        </div>

        {/* Contas Pendentes */}
        <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/10 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-400">
              A Pagar
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold font-mono tracking-tight text-amber-800 dark:text-amber-400">
            R$ {totalPendingVal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-amber-700/70 dark:text-amber-400/70">
            <span>{pendingExpenses.length} contas pendentes</span>
          </div>
        </div>
      </div>

      {/* Alerta de Contas a Vencer e Gargalo Imediato */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Contas a Vencer */}
        <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/10 lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-400 font-bold text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>Contas Pendentes com Vencimento Próximo</span>
            </div>
            <button
              onClick={() => onNavigateTab('transactions')}
              className="text-xs text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
            >
              Ver todas ({transactions.filter((t) => t.status === 'pending').length}) &rarr;
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {upcomingBills.map((b) => (
              <div
                key={b.id}
                className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/40 text-xs shadow-2xs"
              >
                <div className="font-semibold text-slate-900 dark:text-white truncate">
                  {b.description}
                </div>
                <div className="text-rose-600 dark:text-rose-400 font-bold font-mono mt-1">
                  R$ {b.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Vence: {b.dueDate ? b.dueDate.split('-').reverse().join('/') : 'Em breve'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Principal Gargalo Detectado */}
        {bottlenecks.length > 0 && (
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Gargalo em Destaque</span>
              </div>
              <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
                {bottlenecks[0].title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                {bottlenecks[0].description}
              </p>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Economia: <strong className="font-mono text-emerald-600">R$ {bottlenecks[0].estimatedWasteMonthly.toFixed(2)}/mês</strong>
              </span>
              <button
                onClick={() => onNavigateTab('bottlenecks')}
                className="text-xs text-emerald-600 hover:underline font-semibold cursor-pointer"
              >
                Analisar &rarr;
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Seção de Gráficos Visuais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico 1: Despesas por Categoria (Donut SVG Interativo) */}
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Despesas por Categoria
              </h3>
              <p className="text-xs text-slate-400">Distribuição do orçamento realizado</p>
            </div>
            <span className="text-xs font-mono font-semibold text-slate-500">
              Total: R$ {totalExpenseVal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Donut SVG */}
            <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
              <svg viewBox="0 0 180 180" className="w-full h-full -rotate-90 transform">
                {categoryEntries.map((cat) => {
                  const strokeDasharray = `${(cat.amount / totalExpenseVal) * circumference} ${circumference}`;
                  const strokeDashoffset = -cumulativeAngle;
                  cumulativeAngle += (cat.amount / totalExpenseVal) * circumference;

                  return (
                    <circle
                      key={cat.category}
                      cx={center}
                      cy={center}
                      r={radius}
                      fill="transparent"
                      stroke={cat.color}
                      strokeWidth={strokeWidth}
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      className="transition-all duration-300 hover:opacity-80 cursor-pointer"
                      onMouseEnter={() => setActiveCategoryHover(cat.category)}
                      onMouseLeave={() => setActiveCategoryHover(null)}
                    />
                  );
                })}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                <span className="text-[11px] text-slate-400 uppercase">
                  {activeCategoryHover || 'Categorias'}
                </span>
                <span className="text-sm font-bold font-mono text-slate-900 dark:text-white">
                  {activeCategoryHover
                    ? `R$ ${(categoryTotals[activeCategoryHover] || 0).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`
                    : `${categoryEntries.length} ativas`}
                </span>
              </div>
            </div>

            {/* Legenda de Categorias */}
            <div className="flex-1 w-full space-y-2 max-h-48 overflow-y-auto pr-1">
              {categoryEntries.map((item) => (
                <div
                  key={item.category}
                  onMouseEnter={() => setActiveCategoryHover(item.category)}
                  onMouseLeave={() => setActiveCategoryHover(null)}
                  className={`flex items-center justify-between text-xs p-1.5 rounded-lg transition-colors cursor-pointer ${
                    activeCategoryHover === item.category
                      ? 'bg-slate-100 dark:bg-slate-800'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-medium text-slate-700 dark:text-slate-300 truncate">
                      {item.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 font-mono">
                    <span className="text-slate-400">{item.percentage}%</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      R$ {item.amount.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Gráfico 2: Projeção Preditiva Diária (Ritmo de Gastos do Mês) */}
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Ritmo Diário & Projeção
              </h3>
              <p className="text-xs text-slate-400">
                Gastos acumulados até hoje (dia {currentDay}) vs projeção até o dia {summary.totalDaysInMonth}
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="inline-block w-2.5 h-2.5 bg-emerald-500 rounded-xs" />
              <span className="text-slate-500">Realizado</span>
              <span className="inline-block w-2.5 h-2.5 bg-indigo-400 border border-dashed rounded-xs ml-2" />
              <span className="text-slate-500">Projeção</span>
            </div>
          </div>

          {/* Gráfico de Barras / Linha SVG */}
          <div className="h-44 w-full flex items-end gap-1 pt-4 pb-2">
            {dailyCumulative
              .filter((_, idx) => idx % 2 === 0 || idx === currentDay - 1 || idx === summary.totalDaysInMonth - 1)
              .map((pt) => {
                const heightPercent = Math.min(100, Math.max(8, (pt.value / maxCumulativeVal) * 100));
                return (
                  <div
                    key={pt.day}
                    className="flex-1 flex flex-col items-center h-full justify-end group relative"
                  >
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full rounded-t-xs transition-all ${
                        pt.isProjected
                          ? 'bg-indigo-300 dark:bg-indigo-900/60 border border-indigo-400 border-dashed'
                          : 'bg-emerald-500 hover:bg-emerald-600'
                      }`}
                    />
                    <span className="text-[10px] text-slate-400 mt-1 font-mono">{pt.day}</span>

                    {/* Tooltip */}
                    <div className="opacity-0 group-hover:opacity-100 pointer-events-none absolute bottom-full mb-1 bg-slate-900 text-white text-[10px] px-2 py-1 rounded-sm shadow-md whitespace-nowrap z-10 font-mono transition-opacity">
                      Dia {pt.day}: R$ {Math.round(pt.value).toLocaleString('pt-BR')}
                    </div>
                  </div>
                );
              })}
          </div>

          <div className="mt-2 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>Burn rate diário: <strong className="font-mono text-slate-700 dark:text-slate-200">R$ {summary.dailyBurnRate.toFixed(2)}</strong></span>
            <span>Previsão de fechamento: <strong className="font-mono text-indigo-600 dark:text-indigo-400">R$ {summary.projectedExpenseEndMonth.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></span>
          </div>
        </div>
      </div>

      {/* Repartição de Gastos por Membro da Família */}
      <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Orçamento por Membro da Família
            </h3>
            <p className="text-xs text-slate-400">
              Acompanhamento de gastos individuais e limites mensais
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('goals')}
            className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
          >
            Ver Metas &rarr;
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {memberExpenses.map(({ member, spent, limit, percentage }) => (
            <div
              key={member.id}
              className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-full text-white text-xs font-bold flex items-center justify-center ${member.avatarColor}`}
                  >
                    {member.avatarInitials}
                  </div>
                  <div>
                    <span className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white">
                      {member.name}
                    </span>
                    <span className="block text-[10px] text-slate-400">{member.role}</span>
                  </div>
                </div>
                <span
                  className={`text-xs font-mono font-bold ${
                    percentage > 90
                      ? 'text-rose-600'
                      : percentage > 75
                      ? 'text-amber-600'
                      : 'text-emerald-600'
                  }`}
                >
                  {percentage}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <div
                  style={{ width: `${Math.min(100, percentage)}%` }}
                  className={`h-full rounded-full transition-all ${
                    percentage > 90
                      ? 'bg-rose-500'
                      : percentage > 75
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                />
              </div>

              <div className="mt-2 flex items-center justify-between text-xs font-mono text-slate-500">
                <span>Gasto: R$ {spent.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}</span>
                <span>Teto: R$ {limit.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
