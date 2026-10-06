import React, { useState } from 'react';
import {
  Sparkles,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  TrendingUp,
  DollarSign,
  ShieldAlert,
  Zap,
  CheckCircle2,
} from 'lucide-react';
import { FinancialBottleneck, PredictiveBudgetSummary, Transaction } from '../types/finance';

interface BottlenecksAndAIMenuProps {
  bottlenecks: FinancialBottleneck[];
  summary: PredictiveBudgetSummary;
  transactions: Transaction[];
  onApplySavingsRecommendation: (bottleneckId: string) => void;
}

export const BottlenecksAndAIMenu: React.FC<BottlenecksAndAIMenuProps> = ({
  bottlenecks,
  summary,
  transactions,
  onApplySavingsRecommendation,
}) => {
  const [resolvedIds, setResolvedIds] = useState<string[]>([]);
  const [compoundYears, setCompoundYears] = useState<number>(3);

  const totalMonthlyWaste = bottlenecks
    .filter((b) => !resolvedIds.includes(b.id))
    .reduce((sum, b) => sum + b.estimatedWasteMonthly, 0);

  const totalAnnualWaste = totalMonthlyWaste * 12;

  // Cálculo de juros compostos simulados a 11.5% a.a. (CDI aproximado)
  const annualRate = 0.115;
  const monthlyRate = Math.pow(1 + annualRate, 1 / 12) - 1;
  const months = compoundYears * 12;
  const compoundFutureValue =
    totalMonthlyWaste > 0
      ? totalMonthlyWaste * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate)
      : 0;

  const handleResolve = (id: string) => {
    setResolvedIds((prev) => [...prev, id]);
    onApplySavingsRecommendation(id);
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <span>Gargalos Financeiros & Inteligência Preditiva</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Auditoria algorítmica de vazamentos ocultos de capital, micro-despesas e projeção futura
        </p>
      </div>

      {/* Destaque do Impacto do Desperdício Detectado */}
      <div className="p-5 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
              <Zap className="w-4 h-4" />
              <span>Vazamentos de Orçamento Mensal Identificados</span>
            </div>
            <div className="mt-2 text-2xl font-bold font-mono text-slate-900 dark:text-white">
              R$ {totalMonthlyWaste.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              <span className="text-sm font-normal text-slate-500 font-sans ml-2">
                / mês em desperdícios evitáveis
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
              Corresponde a uma perda anual de{' '}
              <strong className="text-rose-600 font-mono">
                R$ {totalAnnualWaste.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </strong>{' '}
              que poderia estar acelerando as metas da família.
            </p>
          </div>

          {/* Projeção de Riqueza Futura */}
          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800/60 w-full md:w-80">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>Se aplicado a 100% do CDI em:</span>
              <div className="flex gap-1">
                {[1, 3, 5].map((y) => (
                  <button
                    key={y}
                    onClick={() => setCompoundYears(y)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                      compoundYears === y
                        ? 'bg-amber-500 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {y}a
                  </button>
                ))}
              </div>
            </div>
            <div className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">
              R$ {Math.round(compoundFutureValue).toLocaleString('pt-BR')}
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              Patrimônio resgatável com juros compostos
            </span>
          </div>
        </div>
      </div>

      {/* Diagnóstico Preditivo do Mês */}
      <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-emerald-600" />
          <span>Diagnóstico Preditivo de Fechamento de Mês</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <span className="text-slate-400 block font-medium">Burn Rate (Queima Diária)</span>
            <div className="text-base font-bold font-mono text-slate-900 dark:text-white mt-1">
              R$ {summary.dailyBurnRate.toFixed(2)} / dia
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Baseado em {summary.daysPassed} dias já decorridos
            </span>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <span className="text-slate-400 block font-medium">Gasto Projetado no Dia {summary.totalDaysInMonth}</span>
            <div className="text-base font-bold font-mono text-slate-900 dark:text-white mt-1">
              R$ {summary.projectedExpenseEndMonth.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Despesas realizadas + {summary.daysRemaining} dias restantes
            </span>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <span className="text-slate-400 block font-medium">Risco de Déficit Familiar</span>
            <div
              className={`text-base font-bold font-mono mt-1 ${
                summary.isOverBudgetRisk
                  ? 'text-rose-600'
                  : 'text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {summary.isOverBudgetRisk
                ? `Risco Alto (+R$ ${summary.budgetDeficitForecast.toFixed(2)})`
                : 'Orçamento Seguro'}
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              {summary.isOverBudgetRisk
                ? 'Tendência de estourar a receita total'
                : `Poupança esperada de ${summary.savingsRateForecastPercent}%`}
            </span>
          </div>
        </div>
      </div>

      {/* Lista de Gargalos Específicos Detectados */}
      <div className="space-y-4">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white">
          Auditoria de Gargalos Detectados ({bottlenecks.length})
        </h3>

        {bottlenecks.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="font-medium text-sm text-slate-700 dark:text-slate-200">
              Nenhum gargalo crítico encontrado!
            </p>
            <p className="text-xs mt-1">A família está mantendo disciplina nos limites planejados.</p>
          </div>
        ) : (
          bottlenecks.map((bot) => {
            const isResolved = resolvedIds.includes(bot.id);

            return (
              <div
                key={bot.id}
                className={`p-5 rounded-xl border transition-all ${
                  isResolved
                    ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 opacity-70'
                    : bot.severity === 'alta'
                    ? 'border-rose-200 dark:border-rose-900/60 bg-white dark:bg-slate-900 shadow-xs'
                    : 'border-amber-200 dark:border-amber-900/60 bg-white dark:bg-slate-900 shadow-xs'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        isResolved
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300'
                          : bot.severity === 'alta'
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300'
                      }`}
                    >
                      {isResolved ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <AlertTriangle className="w-5 h-5" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                          {bot.title}
                        </h4>
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            bot.severity === 'alta'
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                          }`}
                        >
                          Severidade {bot.severity}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                        {bot.description}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                      Desperdício Estimado
                    </span>
                    <span className="text-base font-bold font-mono text-rose-600 dark:text-rose-400">
                      R$ {bot.estimatedWasteMonthly.toFixed(2)}/mês
                    </span>
                  </div>
                </div>

                {/* Plano de Ação Recomendado */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>
                      <strong>Ação Recomendada:</strong> {bot.suggestedAction}
                    </span>
                  </div>

                  {isResolved ? (
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Gargalo Mitigado</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => handleResolve(bot.id)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer shrink-0"
                    >
                      Aplicar Correção
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
