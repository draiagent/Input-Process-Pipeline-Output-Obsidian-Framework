-- VAE 雙卡對齊：agent_runs → agent_audit_logs，並加入任務狀態機
-- Pending → Sanitized → Executed → Verify → Human Review → Done（另有 Failed）

alter table public.agent_runs rename to agent_audit_logs;
alter policy runs_read on public.agent_audit_logs rename to audit_read;

create type public.agent_task_status as enum
  ('pending','sanitized','executed','verify','human_review','done','failed');

alter table public.agent_audit_logs
  add column skill text,                                  -- 例：skill-glucose-analyzer
  add column status public.agent_task_status not null default 'pending',
  add column verify_result jsonb,                         -- 紅線檢核結果（觸發規則、引文）
  add column reviewed_by uuid references public.profiles(id),
  add column reviewed_at timestamptz,
  add column reuse_written boolean not null default false, -- 是否已寫回知識庫／SKILL 規則
  add column updated_at timestamptz not null default now();

create index on public.agent_audit_logs (status, created_at desc);

-- 合法狀態轉移
create or replace function public.agent_status_allowed(old_s public.agent_task_status, new_s public.agent_task_status)
returns boolean language sql immutable as $$
  select old_s = new_s or new_s = 'failed' or (old_s, new_s) in (
    ('pending','sanitized'), ('sanitized','executed'), ('executed','verify'),
    ('verify','done'), ('verify','human_review'),
    ('human_review','done'), ('human_review','executed')  -- 人工退回重跑
  );
$$;

-- 狀態歷史（稽核軌跡）
create table public.agent_status_history (
  id bigint generated always as identity primary key,
  log_id bigint not null references public.agent_audit_logs(id) on delete cascade,
  from_status public.agent_task_status,
  to_status public.agent_task_status not null,
  changed_by uuid default auth.uid(),
  changed_at timestamptz not null default now()
);
create index on public.agent_status_history (log_id, changed_at);

create or replace function public.agent_status_guard() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'UPDATE' then
    if not agent_status_allowed(old.status, new.status) then
      raise exception 'illegal agent status transition: % -> %', old.status, new.status;
    end if;
    if new.status = 'done' and old.status = 'human_review' and new.reviewed_by is null then
      raise exception 'human_review -> done requires reviewed_by';
    end if;
    new.updated_at := now();
    if new.status is distinct from old.status then
      insert into agent_status_history (log_id, from_status, to_status) values (new.id, old.status, new.status);
    end if;
  else
    insert into agent_status_history (log_id, from_status, to_status) values (new.id, null, new.status);
  end if;
  return new;
end $$;

create trigger agent_status_guard_upd before update on public.agent_audit_logs
  for each row execute function public.agent_status_guard();
create trigger agent_status_guard_ins after insert on public.agent_audit_logs
  for each row execute function public.agent_status_guard();

-- RLS：歷史表僅 admin 與當事會員可讀；寫入只走 trigger / service role
alter table public.agent_status_history enable row level security;
create policy history_read on public.agent_status_history for select using (
  is_admin() or exists (select 1 from agent_audit_logs l where l.id = log_id and l.user_id = auth.uid())
);

-- Exception Dashboard：admin 可審批（更新 human_review 的任務）
create policy audit_admin_review on public.agent_audit_logs for update
  using (is_admin() and status = 'human_review')
  with check (is_admin() and status in ('human_review','done','executed','failed'));

-- 例外審批中心用的檢視
create or replace view public.exception_queue with (security_invoker = true) as
  select id, agent, skill, user_id, verify_result, created_at
  from public.agent_audit_logs where status = 'human_review'
  order by created_at;
