import React, { useState } from 'react';
import {
  Target,
  Plus,
  TrendingUp,
  Calendar,
  Users,
  CheckCircle2,
  DollarSign,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { FamilyMember, SavingsGoal } from '../types/finance';

interface GoalsManagerProps {
  goals: SavingsGoal[];
  members: FamilyMember[];
  onAddGoal: (newGoal: Omit<SavingsGoal, 'id' | 'createdAt' | 'history'>) => void;
  onAddDeposit: (goalId: string, amount: number, memberId: string, note?: string) => void;
}

export const GoalsManager: React.FC<GoalsManagerProps> = ({
  goals,
  members,
  onAddGoal,
  onAddDeposit,
}) => {
  const [isNewGoalModalOpen, setIsNewGoalModalOpen] = useState(false);
  const [selectedGoalForDeposit, setSelectedGoalForDeposit] = useState<SavingsGoal | null>(null);

  // Form states para nova meta
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [initialAmount, setInitialAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [assignedTo, setAssignedTo] = useState('family');
  const [category, setCategory] = useState<SavingsGoal['category']>('travel');
  const [notes, setNotes] = useState('');

  // Form states para aporte
  const [depositAmount, setDepositAmount] = useState('');
  const [depositMember, setDepositMember] = useState('m1');
  const [depositNote, setDepositNote] = useState('');

  const memberMap = new Map(members.map((m) => [m.id, m]));

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(targetAmount);
    if (!title.trim() || isNaN(target) || target <= 0) return;

    onAddGoal({
      title: title.trim(),
      category,
      targetAmount: target,
      currentAmount: parseFloat(initialAmount) || 0,
      deadline: deadline || '2026-12-31',
      assignedTo,
      notes: notes.trim() || undefined,
    });

    // Reset
    setTitle('');
    setTargetAmount('');
    setInitialAmount('');
    setDeadline('');
    setNotes('');
    setIsNewGoalModalOpen(false);
  };

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoalForDeposit) return;
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) return;

    const willComplete =
      selectedGoalForDeposit.currentAmount + amount >= selectedGoalForDeposit.targetAmount;

    onAddDeposit(selectedGoalForDeposit.id, amount, depositMember, depositNote.trim());

    if (willComplete) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
    }

    setDepositAmount('');
    setDepositNote('');
    setSelectedGoalForDeposit(null);
  };

  // Totais agregados
  const totalTargetAllGoals = goals.reduce((acc, g) => acc + g.targetAmount, 0);
  const totalSavedAllGoals = goals.reduce((acc, g) => acc + g.currentAmount, 0);
  const globalProgress =
    totalTargetAllGoals > 0 ? Math.round((totalSavedAllGoals / totalTargetAllGoals) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header com resumo e CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>Metas de Economia da Família</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Acompanhamento em tempo real de metas conjuntas e projetos pessoais de cada membro
          </p>
        </div>

        <button
          onClick={() => setIsNewGoalModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Criar Nova Meta</span>
        </button>
      </div>

      {/* Global Progress Banner */}
      <div className="p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-lg font-mono shrink-0">
            {globalProgress}%
          </div>
          <div>
            <div className="text-xs uppercase font-bold tracking-wider text-slate-400">
              Progresso Consolidado da Família
            </div>
            <div className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-0.5">
              R$ {totalSavedAllGoals.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              <span className="text-xs font-normal text-slate-400 font-sans ml-1.5">
                de R$ {totalTargetAllGoals.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Global Progress bar */}
        <div className="w-full md:w-80">
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
            <div
              style={{ width: `${Math.min(100, globalProgress)}%` }}
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1 font-mono">
            <span>{goals.length} metas em andamento</span>
            <span>Faltam R$ {(totalTargetAllGoals - totalSavedAllGoals).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}</span>
          </div>
        </div>
      </div>

      {/* Grid de Metas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {goals.map((goal) => {
          const percent = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
          const isCompleted = goal.currentAmount >= goal.targetAmount;
          const assignedMember = memberMap.get(goal.assignedTo);

          return (
            <div
              key={goal.id}
              className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between"
            >
              <div>
                {/* Header do Card */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white line-clamp-1">
                      {goal.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                      {goal.assignedTo === 'family' ? (
                        <>
                          <Users className="w-3.5 h-3.5 text-indigo-500" />
                          <span>Meta Conjunta Familiar</span>
                        </>
                      ) : (
                        <>
                          {assignedMember && (
                            <span
                              className={`w-3.5 h-3.5 rounded-full text-[8px] font-bold text-white flex items-center justify-center ${assignedMember.avatarColor}`}
                            >
                              {assignedMember.avatarInitials}
                            </span>
                          )}
                          <span>{assignedMember?.name || 'Membro'}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <span
                    className={`font-mono text-sm font-bold ${
                      isCompleted ? 'text-emerald-600' : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {percent}%
                  </span>
                </div>

                {/* Barra de Progresso */}
                <div className="mt-4 mb-2">
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${percent}%` }}
                      className={`h-full rounded-full transition-all duration-300 ${
                        isCompleted ? 'bg-emerald-500' : 'bg-emerald-600'
                      }`}
                    />
                  </div>
                </div>

                {/* Valores */}
                <div className="flex items-center justify-between text-xs font-mono mb-4">
                  <div>
                    <span className="text-[10px] uppercase text-slate-400 block font-sans">
                      Acumulado
                    </span>
                    <strong className="text-slate-900 dark:text-white">
                      R$ {goal.currentAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </strong>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase text-slate-400 block font-sans">
                      Objetivo
                    </span>
                    <span className="text-slate-500">
                      R$ {goal.targetAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* Data Limite */}
                <div className="flex items-center gap-1.5 text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    Prazo: {goal.deadline ? goal.deadline.split('-').reverse().join('/') : 'Livre'}
                  </span>
                </div>
              </div>

              {/* Botão de Aporte */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                {isCompleted ? (
                  <div className="flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Meta Conquistada!</span>
                  </div>
                ) : (
                  <button
                    onClick={() => setSelectedGoalForDeposit(goal)}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Registrar Novo Aporte</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Novo Aporte */}
      {selectedGoalForDeposit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Aporte na Meta: {selectedGoalForDeposit.title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-5">
              Adicione economias para acelerar a conquista do objetivo.
            </p>

            <form onSubmit={handleDepositSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Valor do Aporte (R$)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-mono">
                    R$
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="0,00"
                    autoFocus
                    className="w-full pl-10 pr-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Membro Contribuinte
                </label>
                <select
                  value={depositMember}
                  onChange={(e) => setDepositMember(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nota / Origem do recurso (Opcional)
                </label>
                <input
                  type="text"
                  value={depositNote}
                  onChange={(e) => setDepositNote(e.target.value)}
                  placeholder="Ex: Economia do mês, bônus, mesada..."
                  className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setSelectedGoalForDeposit(null)}
                  className="px-4 py-2 text-xs font-medium rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                >
                  Confirmar Aporte
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Criar Nova Meta */}
      {isNewGoalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Criar Nova Meta Familiar
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-5">
              Defina um objetivo financeiro compartilhado ou pessoal.
            </p>

            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Título da Meta
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Reforma da Cozinha, Viagem para Disney, Fundo Educacional"
                  className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Valor Alvo (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    placeholder="25000"
                    className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Saldo Inicial (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={initialAmount}
                    onChange={(e) => setInitialAmount(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Prazo Limite
                  </label>
                  <input
                    type="date"
                    required
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Responsável
                  </label>
                  <select
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="family">Família Toda (Conjunto)</option>
                    {members
                      .filter((m) => m.id !== 'family')
                      .map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.role})
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Observações
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Detalhes ou metas parciais..."
                  className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsNewGoalModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                >
                  Salvar Meta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
