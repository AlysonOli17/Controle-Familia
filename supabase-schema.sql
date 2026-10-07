-- Tabela de Responsáveis (Membros da Família)
CREATE TABLE family_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  monthly_budget_limit NUMERIC,
  avatar_color TEXT,
  avatar_initials TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Contas Bancárias
CREATE TABLE bank_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  institution_name TEXT NOT NULL,
  institution_code TEXT,
  account_type TEXT NOT NULL,
  account_number TEXT,
  balance NUMERIC NOT NULL DEFAULT 0,
  credit_limit NUMERIC,
  current_invoice NUMERIC,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  color TEXT,
  sync_status TEXT,
  auto_sync BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Transações (Lançamentos)
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  type TEXT NOT NULL, -- 'income' ou 'expense'
  category TEXT NOT NULL,
  date DATE NOT NULL,
  due_date DATE,
  payment_method TEXT,
  account_id UUID REFERENCES bank_accounts(id) ON DELETE CASCADE,
  member_id UUID REFERENCES family_members(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'completed',
  is_recurring BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Metas
CREATE TABLE savings_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  target_amount NUMERIC NOT NULL,
  current_amount NUMERIC DEFAULT 0,
  deadline DATE,
  assigned_to UUID REFERENCES family_members(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Histórico de Metas
CREATE TABLE savings_goal_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  goal_id UUID REFERENCES savings_goals(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  date DATE NOT NULL,
  member_id UUID REFERENCES family_members(id) ON DELETE SET NULL,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Investimentos
CREATE TABLE investment_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  institution TEXT NOT NULL,
  invested_amount NUMERIC NOT NULL,
  current_value NUMERIC NOT NULL,
  profitability_percent NUMERIC,
  benchmark TEXT,
  last_update TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar leitura/escrita anônima provisoriamente para testes (RLS - Row Level Security)
-- ATENÇÃO: Em produção é recomendado adicionar regras de segurança reais vinculadas aos usuários logados.
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_goal_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE investment_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all public operations" ON family_members FOR ALL USING (true);
CREATE POLICY "Allow all public operations" ON bank_accounts FOR ALL USING (true);
CREATE POLICY "Allow all public operations" ON transactions FOR ALL USING (true);
CREATE POLICY "Allow all public operations" ON savings_goals FOR ALL USING (true);
CREATE POLICY "Allow all public operations" ON savings_goal_history FOR ALL USING (true);
CREATE POLICY "Allow all public operations" ON investment_assets FOR ALL USING (true);
