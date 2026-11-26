-- 例外審批加固：管理員審批 human_review 任務時，reviewed_by 必須是自己，
-- 避免以他人名義簽核（稽核軌跡的「誰批的」才可信）。

drop policy if exists audit_admin_review on public.agent_audit_logs;

create policy audit_admin_review on public.agent_audit_logs for update
  using (is_admin() and status = 'human_review')
  with check (
    is_admin()
    and status in ('human_review','done','executed','failed')
    and reviewed_by = auth.uid()
  );

-- 審批離開 human_review 時自動補上 reviewed_at（若未填）
create or replace function public.agent_stamp_review() returns trigger
language plpgsql as $$
begin
  if old.status = 'human_review' and new.status <> 'human_review' and new.reviewed_at is null then
    new.reviewed_at := now();
  end if;
  return new;
end $$;

create trigger agent_stamp_review before update on public.agent_audit_logs
  for each row execute function public.agent_stamp_review();
