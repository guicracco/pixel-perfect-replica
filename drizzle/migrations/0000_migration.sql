create type public.app_role as enum ('admin','member');

create table public.profiles (
  id uuid primary key,
  full_name text not null default '',
  email text not null default '',
  created_at timestamptz not null default now()
);
grant select, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "team reads profiles" on public.profiles for select to authenticated using (true);
create policy "own profile update" on public.profiles for update to authenticated using (auth.uid() = id);

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  role app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "read own roles" on public.user_roles for select to authenticated using (auth.uid() = user_id);

create or replace function public.has_role(_user_id uuid, _role app_role) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.has_any_user() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles)
$$;
grant execute on function public.has_any_user() to anon, authenticated;

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare first_user boolean;
begin
  select not exists (select 1 from public.profiles) into first_user;
  insert into public.profiles (id, full_name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)), new.email);
  insert into public.user_roles (user_id, role) values (new.id, case when first_user then 'admin'::app_role else 'member'::app_role end);
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create or replace function public.touch_updated_at() returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end $$;

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company text,
  document text,
  email text,
  phone text,
  instagram text,
  website text,
  segment text,
  city text,
  state text,
  address text,
  notes text,
  lead_source text,
  entry_date date not null default current_date,
  status text not null default 'lead',
  contract_value numeric(12,2) not null default 0,
  payment_method text,
  payment_status text not null default 'pendente',
  responsible_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  client_id uuid not null references public.clients(id) on delete cascade,
  type text not null default 'site_institucional',
  description text,
  start_date date,
  due_date date,
  value numeric(12,2) not null default 0,
  status text not null default 'briefing',
  priority text not null default 'media',
  responsible_id uuid references public.profiles(id) on delete set null,
  project_url text,
  domain text,
  hosting text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  client_id uuid references public.clients(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  responsible_id uuid references public.profiles(id) on delete set null,
  priority text not null default 'media',
  due_date date,
  status text not null default 'a_fazer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  amount numeric(12,2) not null default 0,
  due_date date not null default current_date,
  paid_date date,
  method text not null default 'pix',
  status text not null default 'pendente',
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric(12,2) not null default 0,
  estimated_days integer,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.client_events (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  kind text not null default 'evento',
  title text not null,
  description text,
  happened_at timestamptz not null default now(),
  author_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

do $$ declare t text; begin
  foreach t in array array['clients','projects','tasks','payments','services','client_events'] loop
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
    execute format('grant all on public.%I to service_role', t);
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy "team access" on public.%I for all to authenticated using (true) with check (true)', t);
  end loop;
  foreach t in array array['clients','projects','tasks','payments','services'] loop
    execute format('create trigger touch_%1$s before update on public.%1$I for each row execute function public.touch_updated_at()', t);
  end loop;
end $$;

-- Dados de exemplo (fictícios)
insert into public.clients (id, name, company, email, phone, segment, city, state, lead_source, entry_date, status, contract_value, payment_method, payment_status) values
('11111111-1111-1111-1111-111111111111','João Silva','Silva Fotografia','joao@silvafoto.exemplo','(11) 90000-0001','Fotografia','São Paulo','SP','Instagram', current_date - 60,'projeto_andamento',3500,'pix','parcial'),
('22222222-2222-2222-2222-222222222222','Marcos Oliveira','Oliveira Móveis','marcos@oliveiramoveis.exemplo','(41) 90000-0002','Móveis','Curitiba','PR','Indicação', current_date - 30,'cliente_ativo',1800,'cartao','pago'),
('33333333-3333-3333-3333-333333333333','Ana Martins','Studio Ana','ana@studioana.exemplo','(51) 90000-0003','Estética','Porto Alegre','RS','Google', current_date - 5,'em_negociacao',2400,'transferencia','pendente');

insert into public.projects (id, name, client_id, type, start_date, due_date, value, status, priority) values
('aaaaaaa1-0000-0000-0000-000000000001','Site institucional Silva Fotografia','11111111-1111-1111-1111-111111111111','site_institucional', current_date - 40, current_date + 10, 3500,'em_desenvolvimento','alta'),
('aaaaaaa2-0000-0000-0000-000000000002','Landing Page Oliveira Móveis','22222222-2222-2222-2222-222222222222','landing_page', current_date - 25, current_date - 2, 1800,'concluido','media'),
('aaaaaaa3-0000-0000-0000-000000000003','Redesign Studio Ana','33333333-3333-3333-3333-333333333333','redesign', current_date - 3, current_date + 25, 2400,'briefing','media');

insert into public.tasks (title, client_id, project_id, priority, due_date, status) values
('Enviar layout da home para aprovação','11111111-1111-1111-1111-111111111111','aaaaaaa1-0000-0000-0000-000000000001','alta', current_date + 2,'em_andamento'),
('Coletar fotos do portfólio','11111111-1111-1111-1111-111111111111','aaaaaaa1-0000-0000-0000-000000000001','media', current_date - 1,'a_fazer'),
('Reunião de briefing','33333333-3333-3333-3333-333333333333','aaaaaaa3-0000-0000-0000-000000000003','urgente', current_date + 1,'a_fazer');

insert into public.payments (client_id, project_id, amount, due_date, paid_date, method, status, description) values
('11111111-1111-1111-1111-111111111111','aaaaaaa1-0000-0000-0000-000000000001',1750, current_date - 35, current_date - 35,'pix','pago','Entrada 50%'),
('11111111-1111-1111-1111-111111111111','aaaaaaa1-0000-0000-0000-000000000001',1750, current_date + 10, null,'pix','pendente','Saldo final'),
('22222222-2222-2222-2222-222222222222','aaaaaaa2-0000-0000-0000-000000000002',1800, current_date - 3, current_date - 3,'cartao','pago','Pagamento integral'),
('33333333-3333-3333-3333-333333333333','aaaaaaa3-0000-0000-0000-000000000003',1200, current_date - 2, null,'transferencia','pendente','Entrada 50%');

insert into public.services (name, description, price, estimated_days) values
('Landing Page','Página única focada em conversão',1500,10),
('Site institucional','Site completo com até 6 páginas',3500,25),
('E-commerce','Loja virtual com catálogo e pagamentos',7000,45),
('Redesign de site','Nova identidade para site existente',2400,20),
('Manutenção mensal','Atualizações e suporte contínuo',300,30),
('Hospedagem','Hospedagem anual gerenciada',400,1),
('Domínio','Registro de domínio anual',80,1);

insert into public.client_events (client_id, kind, title, happened_at) values
('11111111-1111-1111-1111-111111111111','evento','Cliente cadastrado', now() - interval '60 days'),
('11111111-1111-1111-1111-111111111111','evento','Proposta enviada', now() - interval '50 days'),
('11111111-1111-1111-1111-111111111111','pagamento','Pagamento recebido', now() - interval '35 days'),
('11111111-1111-1111-1111-111111111111','evento','Projeto iniciado', now() - interval '34 days'),
('22222222-2222-2222-2222-222222222222','evento','Cliente cadastrado', now() - interval '30 days'),
('22222222-2222-2222-2222-222222222222','evento','Projeto concluído', now() - interval '2 days'),
('33333333-3333-3333-3333-333333333333','evento','Cliente cadastrado', now() - interval '5 days');