import { supabase } from '../lib/supabase';
import {
  BankAccount,
  CategoryBudget,
  FamilyMember,
  InvestmentAsset,
  SavingsGoal,
  SmartNotification,
  Transaction,
} from '../types/finance';

export async function fetchAllData() {
  const [
    { data: members },
    { data: accounts },
    { data: transactions },
    { data: goals },
    { data: investments },
  ] = await Promise.all([
    supabase.from('family_members').select('*'),
    supabase.from('bank_accounts').select('*'),
    supabase.from('transactions').select('*').order('date', { ascending: false }),
    supabase.from('savings_goals').select('*'),
    supabase.from('investment_assets').select('*'),
  ]);

  // Convert snake_case from DB to camelCase for frontend
  return {
    members: members?.map(m => ({
      id: m.id,
      name: m.name,
      role: m.role,
      monthlyBudgetLimit: m.monthly_budget_limit,
      avatarColor: m.avatar_color,
      avatarInitials: m.avatar_initials,
      email: m.email,
    })) as FamilyMember[] || [],

    accounts: accounts?.map(a => ({
      id: a.id,
      institutionName: a.institution_name,
      institutionCode: a.institution_code,
      accountType: a.account_type,
      accountNumber: a.account_number,
      balance: Number(a.balance),
      creditLimit: a.credit_limit ? Number(a.credit_limit) : undefined,
      currentInvoice: a.current_invoice ? Number(a.current_invoice) : undefined,
      lastSyncAt: a.last_sync_at,
      color: a.color,
      syncStatus: a.sync_status,
      autoSync: a.auto_sync,
    })) as BankAccount[] || [],

    transactions: transactions?.map(t => ({
      id: t.id,
      description: t.description,
      amount: Number(t.amount),
      type: t.type,
      category: t.category,
      date: t.date,
      dueDate: t.due_date,
      paymentMethod: t.payment_method,
      accountId: t.account_id,
      memberId: t.member_id,
      status: t.status,
      isRecurring: t.is_recurring,
      notes: t.notes,
      createdAt: t.created_at,
    })) as Transaction[] || [],

    goals: goals?.map(g => ({
      id: g.id,
      title: g.title,
      category: g.category,
      targetAmount: Number(g.target_amount),
      currentAmount: Number(g.current_amount),
      deadline: g.deadline,
      assignedTo: g.assigned_to,
      notes: g.notes,
      createdAt: g.created_at,
      history: [], // We can fetch history separately if needed
    })) as SavingsGoal[] || [],

    investments: investments?.map(i => ({
      id: i.id,
      name: i.name,
      type: i.type,
      institution: i.institution,
      investedAmount: Number(i.invested_amount),
      currentValue: Number(i.current_value),
      profitabilityPercent: i.profitability_percent ? Number(i.profitability_percent) : undefined,
      benchmark: i.benchmark,
      lastUpdate: i.last_update,
    })) as InvestmentAsset[] || [],
  };
}

export async function insertTransaction(tx: Omit<Transaction, 'id' | 'createdAt'>) {
  const { data, error } = await supabase.from('transactions').insert({
    description: tx.description,
    amount: tx.amount,
    type: tx.type,
    category: tx.category,
    date: tx.date,
    due_date: tx.dueDate,
    payment_method: tx.paymentMethod,
    account_id: tx.accountId,
    member_id: tx.memberId,
    status: tx.status,
    is_recurring: tx.isRecurring,
    notes: tx.notes,
  }).select().single();
  
  if (error) throw error;
  return data;
}

export async function deleteTransaction(id: string) {
  const { error } = await supabase.from('transactions').delete().eq('id', id);
  if (error) throw error;
}

export async function updateTransactionStatus(id: string, status: string) {
  const { error } = await supabase.from('transactions').update({ status }).eq('id', id);
  if (error) throw error;
}

export async function insertBankAccount(acc: Omit<BankAccount, 'id' | 'lastSyncAt' | 'syncStatus'>) {
  const { data, error } = await supabase.from('bank_accounts').insert({
    institution_name: acc.institutionName,
    institution_code: acc.institutionCode,
    account_type: acc.accountType,
    account_number: acc.accountNumber,
    balance: acc.balance,
    credit_limit: acc.creditLimit,
    color: acc.color,
    auto_sync: acc.autoSync,
    sync_status: 'synced',
    last_sync_at: new Date().toISOString(),
  }).select().single();

  if (error) throw error;
  return data;
}

export async function updateBankAccountBalance(id: string, newBalance: number) {
  const { error } = await supabase.from('bank_accounts').update({ balance: newBalance }).eq('id', id);
  if (error) throw error;
}

export async function insertFamilyMember(member: Omit<FamilyMember, 'id'>) {
  const { data, error } = await supabase.from('family_members').insert({
    name: member.name,
    role: member.role,
    monthly_budget_limit: member.monthlyBudgetLimit,
    avatar_color: member.avatarColor,
    avatar_initials: member.avatarInitials,
    email: member.email,
  }).select().single();

  if (error) throw error;
  
  return {
    id: data.id,
    name: data.name,
    role: data.role,
    monthlyBudgetLimit: data.monthly_budget_limit,
    avatarColor: data.avatar_color,
    avatarInitials: data.avatar_initials,
    email: data.email,
  } as FamilyMember;
}

export async function deleteFamilyMember(id: string) {
  const { error } = await supabase.from('family_members').delete().eq('id', id);
  if (error) throw error;
}
