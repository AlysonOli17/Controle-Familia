import React, { useState } from 'react';
import { Plus, Trash2, Users, AlertCircle, Pencil } from 'lucide-react';
import { FamilyMember } from '../types/finance';

interface MembersManagerProps {
  members: FamilyMember[];
  onAddMember: (member: Omit<FamilyMember, 'id'>) => void;
  onDeleteMember: (id: string) => void;
  onEditMember: (id: string, member: Partial<Omit<FamilyMember, 'id'>>) => void;
}

const AVATAR_COLORS = [
  'bg-blue-500',
  'bg-emerald-500',
  'bg-rose-500',
  'bg-amber-500',
  'bg-indigo-500',
  'bg-cyan-500',
  'bg-fuchsia-500',
  'bg-violet-500'
];

export const MembersManager: React.FC<MembersManagerProps> = ({ members, onAddMember, onDeleteMember, onEditMember }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [name, setName] = useState('');
  const [role, setRole] = useState<FamilyMember['role']>('Membro' as any);
  const [monthlyBudgetLimit, setMonthlyBudgetLimit] = useState('');
  const [email, setEmail] = useState('');
  const [color, setColor] = useState(AVATAR_COLORS[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const initials = name
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase();

    if (editingId) {
      onEditMember(editingId, {
        name: name.trim(),
        role,
        monthlyBudgetLimit: Number(monthlyBudgetLimit) || 0,
        avatarColor: color,
        avatarInitials: initials,
        email: email.trim() || undefined,
      });
    } else {
      onAddMember({
        name: name.trim(),
        role,
        monthlyBudgetLimit: Number(monthlyBudgetLimit) || 0,
        avatarColor: color,
        avatarInitials: initials,
        email: email.trim() || undefined,
      });
    }

    resetForm();
  };

  const resetForm = () => {
    setName('');
    setRole('Membro' as any);
    setMonthlyBudgetLimit('');
    setEmail('');
    setColor(AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]);
    setIsAdding(false);
    setEditingId(null);
  };

  const handleEditClick = (m: FamilyMember) => {
    setEditingId(m.id);
    setName(m.name);
    setRole(m.role);
    setMonthlyBudgetLimit(m.monthlyBudgetLimit ? m.monthlyBudgetLimit.toString() : '');
    setEmail(m.email || '');
    setColor(m.avatarColor);
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-600" />
            Membros da Família
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Gerencie as pessoas que participam do orçamento e limite de gastos de cada um.
          </p>
        </div>
        <button
          onClick={() => {
            if (isAdding) {
              resetForm();
            } else {
              setIsAdding(true);
            }
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-xs w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Membro</span>
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm animate-in fade-in slide-in-from-top-4">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-3">
            {editingId ? 'Editar Membro' : 'Adicionar Novo Membro'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Nome Completo</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: João Silva"
                className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Papel na Família</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                <option value="Administrador">Administrador</option>
                <option value="Membro">Membro</option>
                <option value="Pai">Pai</option>
                <option value="Mãe">Mãe</option>
                <option value="Filho">Filho</option>
                <option value="Filha">Filha</option>
                <option value="Conjunta">Conta Conjunta</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Limite Mensal (Opcional)</label>
              <input
                type="number"
                value={monthlyBudgetLimit}
                onChange={(e) => setMonthlyBudgetLimit(e.target.value)}
                placeholder="Ex: 2000"
                className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email (Opcional)</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ex: joao@email.com"
                className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Cor do Perfil</label>
              <div className="flex flex-wrap gap-2">
                {AVATAR_COLORS.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-8 h-8 rounded-full ${c} ${color === c ? 'ring-2 ring-offset-2 ring-emerald-500 dark:ring-offset-slate-900' : ''}`}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 text-xs font-medium rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {editingId ? 'Atualizar Membro' : 'Salvar Membro'}
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map(member => (
          <div key={member.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-start justify-between shadow-xs">
            <div className="flex gap-3 items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0 ${member.avatarColor}`}>
                {member.avatarInitials}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">{member.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{member.role}</p>
                {member.monthlyBudgetLimit > 0 && (
                  <p className="text-[10px] text-slate-400 mt-1">Limite: R$ {member.monthlyBudgetLimit.toLocaleString('pt-BR')}</p>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <button
                onClick={() => handleEditClick(member)}
                className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-md transition-colors"
                title="Editar membro"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  if (window.confirm(`Tem certeza que deseja excluir o membro ${member.name}?`)) {
                    onDeleteMember(member.id);
                  }
                }}
                className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-md transition-colors"
                title="Excluir membro"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {members.length === 0 && (
           <div className="col-span-full p-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/50">
             <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
             <p className="text-slate-500 dark:text-slate-400 font-medium">Nenhum membro cadastrado.</p>
             <p className="text-xs text-slate-400 mt-1">Adicione os responsáveis da família clicando no botão acima.</p>
           </div>
        )}
      </div>
    </div>
  );
};
