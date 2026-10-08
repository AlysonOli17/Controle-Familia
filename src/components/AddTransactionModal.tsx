import React, { useState, useEffect } from 'react';
import { X, Sparkles, PlusCircle, Edit2 } from 'lucide-react';
import {
  BankAccount,
  FamilyMember,
  PaymentMethod,
  Transaction,
  TransactionCategory,
  TransactionType,
} from '../types/finance';
import { autoCategorizeByText } from '../services/predictiveEngine';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void;
  onEdit?: (id: string, transaction: Partial<Omit<Transaction, 'id' | 'createdAt'>>) => void;
  initialData?: Transaction | null;
  members: FamilyMember[];
}

const CATEGORIES: TransactionCategory[] = [
  'Moradia',
  'Alimentação',
  'Supermercado',
  'Transporte',
  'Saúde',
  'Educação',
  'Lazer & Viagem',
  'Assinaturas & Serviços',
  'Compras & Vestuário',
  'Investimentos',
  'Salário',
  'Rendimentos',
  'Freelance / Extra',
  'Outros',
];

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onEdit,
  initialData,
  members,
}) => {
  if (!isOpen) return null;

  const [type, setType] = useState<TransactionType>('expense');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<TransactionCategory>('Supermercado');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('credit_card');

  const [memberId, setMemberId] = useState('family');
  const [isPending, setIsPending] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [notes, setNotes] = useState('');
  const [suggestedCat, setSuggestedCat] = useState<string | null>(null);

  useEffect(() => {
    if (initialData && isOpen) {
      setType(initialData.type);
      setDescription(initialData.description);
      setAmount(initialData.amount.toString());
      setCategory(initialData.category);
      setDate(initialData.date);
      setDueDate(initialData.dueDate || '');
      setPaymentMethod(initialData.paymentMethod);
      setMemberId(initialData.memberId || 'family');
      setIsPending(initialData.status === 'pending');
      setIsRecurring(initialData.isRecurring || false);
      setNotes(initialData.notes || '');
    } else if (isOpen && !initialData) {
      setType('expense');
      setDescription('');
      setAmount('');
      setCategory('Supermercado');
      setDate(new Date().toISOString().split('T')[0]);
      setDueDate('');
      setPaymentMethod('credit_card');
      setMemberId('family');
      setIsPending(false);
      setIsRecurring(false);
      setNotes('');
    }
  }, [initialData, isOpen]);

  // Sugestão de categorização automática em tempo real conforme digita o nome
  useEffect(() => {
    if (description.length > 2) {
      const pred = autoCategorizeByText(description);
      if (pred.category !== 'Outros' && pred.category !== category) {
        setSuggestedCat(pred.category);
      } else {
        setSuggestedCat(null);
      }
    } else {
      setSuggestedCat(null);
    }
  }, [description, category]);

  const applySuggestedCategory = () => {
    if (suggestedCat) {
      setCategory(suggestedCat as TransactionCategory);
      setSuggestedCat(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!description.trim() || isNaN(parsedAmount) || parsedAmount <= 0) return;

    const txData = {
      description: description.trim(),
      amount: parsedAmount,
      type,
      category,
      date,
      dueDate: isPending ? (dueDate || date) : undefined,
      paymentMethod,
      memberId,
      status: (isPending ? 'pending' : 'completed') as 'pending' | 'completed',
      isRecurring,
      notes: notes.trim() || undefined,
    };

    if (initialData && onEdit) {
      onEdit(initialData.id, txData);
    } else {
      onSave(txData);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-150 my-8">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            {initialData ? (
              <Edit2 className="w-5 h-5 text-emerald-600" />
            ) : (
              <PlusCircle className="w-5 h-5 text-emerald-600" />
            )}
            <span>{initialData ? 'Editar Lançamento' : 'Novo Lançamento Financeiro'}</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Segmented Tipo (Receita vs Despesa) */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                type === 'expense'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Despesa
            </button>
            <button
              type="button"
              onClick={() => {
                setType('income');
                setCategory('Salário');
              }}
              className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                type === 'income'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Receita
            </button>
          </div>

          {/* Valor */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Valor (R$)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-base">
                R$
              </span>
              <input
                type="number"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0,00"
                autoFocus
                className="w-full pl-12 pr-4 py-2.5 text-lg font-bold font-mono rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Descrição
            </label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Supermercado Pão de Açúcar, Salário, iFood, Conta de Luz"
              className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {suggestedCat && (
              <button
                type="button"
                onClick={applySuggestedCategory}
                className="mt-1.5 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-medium cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>
                  Sugerir categoria: <strong>{suggestedCat}</strong> (clique para aplicar)
                </span>
              </button>
            )}
          </div>

            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Categoria
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TransactionCategory)}
                className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

          {/* Responsável & Método de Pagamento */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Responsável
              </label>
              <select
                value={memberId}
                onChange={(e) => setMemberId(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="family">Família Toda (Compartilhado)</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Forma de Pagamento
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="credit_card">Cartão de Crédito</option>
                <option value="pix">PIX</option>
                <option value="debit_card">Cartão de Débito</option>
                <option value="boleto">Boleto Bancário</option>
                <option value="transfer">Transferência / TED</option>
                <option value="cash">Dinheiro em Espécie</option>
              </select>
            </div>
          </div>

          {/* Data & Status Pendente */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Data do Registro
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {isPending ? (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Data de Vencimento
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            ) : (
              <div className="flex items-center pt-6">
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isRecurring}
                    onChange={(e) => setIsRecurring(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <span>Despesa Recorrente / Mensal</span>
                </label>
              </div>
            )}
          </div>

          {/* Toggle Pendente / A Vencer */}
          <div className="pt-1">
            <label className="flex items-center gap-2 text-xs font-medium text-amber-700 dark:text-amber-400 cursor-pointer">
              <input
                type="checkbox"
                checked={isPending}
                onChange={(e) => {
                  setIsPending(e.target.checked);
                  if (!dueDate) setDueDate(date);
                }}
                className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
              />
              <span>Esta é uma conta pendente a pagar (gera alerta de vencimento)</span>
            </label>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Notas Adicionais (Opcional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Parcela 2/6, compras de Páscoa, abatimento de imposto..."
              className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
            >
              {initialData ? 'Salvar Alterações' : 'Adicionar Lançamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
