-- VAE · 2026 AI to Agent 工作流：Supabase Schema + RLS
-- 原則：每張表開 RLS、預設拒絕；Agent 以使用者 JWT 呼叫；service role 僅限 Edge Function。

create extension if not exists vector;

-- ========== 會員與角色 ==========
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  role text not null default 'member' check (role in ('member','coach','admin')),
  line_id text,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin');
$$;

-- 新使用者自動建立 profile
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, name) values (new.id, new.raw_user_meta_data->>'name');
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ========== 血糖 ==========
create table public.coach_links (
  coach_id uuid not null references profiles(id) on delete cascade,
  member_id uuid not null references profiles(id) on delete cascade,
  consent_at timestamptz not null default now(),
  primary key (coach_id, member_id)
);

create or replace function public.is_coach_of(member uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from coach_links where coach_id = auth.uid() and member_id = member);
$$;

create table public.cgm_readings (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references profiles(id) on delete cascade,
  ts timestamptz not null,
  glucose_mgdl numeric(5,1) not null check (glucose_mgdl between 20 and 600),
  source text default 'cgm'
);
create index on public.cgm_readings (user_id, ts desc);

create table public.meal_logs (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references profiles(id) on delete cascade,
  ts timestamptz not null default now(),
  photo_path text,
  carbs_g numeric(6,1),
  note text
);
create index on public.meal_logs (user_id, ts desc);

-- ========== 寵物新零售 ==========
create table public.pets (
  id bigint generated always as identity primary key,
  owner_id uuid not null default auth.uid() references profiles(id) on delete cascade,
  name text,
  species text not null,
  age_years numeric(4,1),
  weight_kg numeric(5,2),
  allergies text[] default '{}'
);

create table public.menu_items (
  id bigint generated always as identity primary key,
  name text not null,
  audience text not null check (audience in ('human','pet')),
  nutrition jsonb default '{}',
  price integer not null check (price >= 0),
  active boolean not null default true
);

create table public.orders (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references profiles(id) on delete cascade,
  kind text not null default 'order' check (kind in ('order','booking')),
  items jsonb not null default '[]',
  booking_at timestamptz,
  status text not null default 'pending' check (status in ('pending','paid','cancelled','done')),
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

-- ========== 課程 ==========
create table public.courses (
  id bigint generated always as identity primary key,
  title text not null,
  description text,
  published boolean not null default false
);

create table public.enrollments (
  course_id bigint not null references courses(id) on delete cascade,
  user_id uuid not null default auth.uid() references profiles(id) on delete cascade,
  progress numeric(5,2) not null default 0,
  score numeric(5,2),
  cert_url text,
  primary key (course_id, user_id)
);

-- ========== Agent 運作 ==========
create table public.content_drafts (
  id bigint generated always as identity primary key,
  agent text not null,
  script text not null,
  status text not null default 'draft' check (status in ('draft','approved','posted','rejected')),
  created_at timestamptz not null default now()
);

create table public.agent_runs (
  id bigint generated always as identity primary key,
  agent text not null,
  user_id uuid references profiles(id) on delete set null,
  input jsonb,
  tools_used text[] default '{}',
  output jsonb,
  needs_review boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.kb_documents (
  id bigint generated always as identity primary key,
  domain text not null check (domain in ('glucose','pet','course')),
  chunk text not null,
  embedding vector(1536)
);
create index on public.kb_documents using hnsw (embedding vector_cosine_ops);

-- RAG 檢索
create or replace function public.match_kb(query_embedding vector(1536), match_domain text, match_count int default 5)
returns table (id bigint, chunk text, similarity float)
language sql stable as $$
  select id, chunk, 1 - (embedding <=> query_embedding)
  from kb_documents where domain = match_domain
  order by embedding <=> query_embedding limit match_count;
$$;

-- ========== RLS ==========
alter table public.profiles       enable row level security;
alter table public.coach_links    enable row level security;
alter table public.cgm_readings   enable row level security;
alter table public.meal_logs      enable row level security;
alter table public.pets           enable row level security;
alter table public.menu_items     enable row level security;
alter table public.orders         enable row level security;
alter table public.courses        enable row level security;
alter table public.enrollments    enable row level security;
alter table public.content_drafts enable row level security;
alter table public.agent_runs     enable row level security;
alter table public.kb_documents   enable row level security;

-- profiles：本人讀寫（不可自改 role），admin 全讀
create policy profiles_self_read on profiles for select using (id = auth.uid() or is_admin());
create policy profiles_self_update on profiles for update using (id = auth.uid())
  with check (id = auth.uid() and role = (select p.role from profiles p where p.id = auth.uid()));

-- coach_links：雙方可讀，僅會員可新增/撤銷
create policy links_read on coach_links for select using (auth.uid() in (coach_id, member_id));
create policy links_member_insert on coach_links for insert with check (member_id = auth.uid());
create policy links_member_delete on coach_links for delete using (member_id = auth.uid());

-- cgm_readings / meal_logs：本人讀寫，綁定教練唯讀
create policy cgm_own on cgm_readings for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy cgm_coach_read on cgm_readings for select using (is_coach_of(user_id));
create policy meals_own on meal_logs for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy meals_coach_read on meal_logs for select using (is_coach_of(user_id));

-- pets：主人讀寫
create policy pets_own on pets for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- menu_items：公開讀上架品，admin 寫
create policy menu_read on menu_items for select using (active or is_admin());
create policy menu_admin on menu_items for all using (is_admin()) with check (is_admin());

-- orders：本人讀、本人建立 pending；狀態只由 Edge Function（service role）更新
create policy orders_read on orders for select using (user_id = auth.uid() or is_admin());
create policy orders_insert on orders for insert with check (user_id = auth.uid() and status = 'pending' and paid_at is null);

-- courses / enrollments
create policy courses_read on courses for select using (published or is_admin());
create policy courses_admin on courses for all using (is_admin()) with check (is_admin());
create policy enroll_own_read on enrollments for select using (user_id = auth.uid() or is_admin());
create policy enroll_own_insert on enrollments for insert with check (user_id = auth.uid() and progress = 0 and score is null and cert_url is null);
-- progress / score / cert_url 由 Edge Function 更新，防止自行竄改成績

-- content_drafts：僅 admin（Agent 透過 service role 寫入）
create policy drafts_admin on content_drafts for all using (is_admin()) with check (is_admin());

-- agent_runs：本人讀自己的，admin 全讀；寫入走 service role
create policy runs_read on agent_runs for select using (user_id = auth.uid() or is_admin());

-- kb_documents：登入者可讀，admin 寫
create policy kb_read on kb_documents for select to authenticated using (true);
create policy kb_admin on kb_documents for all using (is_admin()) with check (is_admin());

-- ========== Storage：餐點照片 ==========
insert into storage.buckets (id, name, public) values ('meal-photos', 'meal-photos', false)
  on conflict (id) do nothing;
create policy meal_photos_own on storage.objects for all
  using (bucket_id = 'meal-photos' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'meal-photos' and (storage.foldername(name))[1] = auth.uid()::text);
