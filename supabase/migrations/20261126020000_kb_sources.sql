-- 衛教知識庫：加上出處（文件、頁碼）與去重雜湊，讓 Verify Gate 能核對引文

alter table public.kb_documents
  add column source text,          -- 來源代號，例：ada-soc-2026
  add column title text,           -- 文件名稱
  add column page int,             -- PDF 頁碼（從 1 起）
  add column lang text default 'zh',
  add column content_hash text,    -- sha256(source|chunk)，重跑匯入不會重複
  add column created_at timestamptz not null default now();

create unique index kb_documents_content_hash_key on public.kb_documents (content_hash);
create index on public.kb_documents (source);

-- 回傳出處的向量檢索（取代舊版 match_kb）
drop function if exists public.match_kb(vector, text, int);
create function public.match_kb(query_embedding vector(1536), match_domain text, match_count int default 5)
returns table (id bigint, chunk text, source text, title text, page int, similarity float)
language sql stable as $$
  select id, chunk, source, title, page, 1 - (embedding <=> query_embedding)
  from public.kb_documents
  where domain = match_domain and embedding is not null
  order by embedding <=> query_embedding
  limit match_count;
$$;
