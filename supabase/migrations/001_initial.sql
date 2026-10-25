create table public.admin_users (user_id uuid primary key references auth.users(id) on delete cascade);
alter table public.admin_users enable row level security;
create or replace function public.is_admin() returns boolean language sql stable security definer set search_path = '' as $$ select exists(select 1 from public.admin_users where user_id = auth.uid()); $$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;
create table public.curated_coins (
 id uuid primary key default gen_random_uuid(), chain text not null check(chain in ('solana','ethereum','robinhood')),
 address text not null, name text not null, symbol text not null, logo_url text,
 description text not null default '', category text not null default 'cult', featured boolean not null default false,
 priority integer not null default 0, active boolean not null default true,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(chain,address),
 check (case when chain = 'solana' then address ~ '^[1-9A-HJ-NP-Za-km-z]{32,44}$' else address ~ '^0x[0-9a-f]{40}$' end),
 check(logo_url is null or logo_url ~ '^https://')
);
create table public.curated_posts (
 id uuid primary key default gen_random_uuid(), kol_name text not null, handle text not null default '',
 url text not null check(url ~ '^https://'), summary text not null,
 published_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.post_tokens (post_id uuid references public.curated_posts(id) on delete cascade, token_id uuid references public.curated_coins(id) on delete cascade, primary key(post_id,token_id));
alter table public.curated_coins enable row level security;
alter table public.curated_posts enable row level security;
alter table public.post_tokens enable row level security;
create policy "public active coins" on public.curated_coins for select using(active or public.is_admin());
create policy "public linked posts" on public.curated_posts for select using(public.is_admin() or exists(select 1 from public.post_tokens pt join public.curated_coins c on c.id=pt.token_id where pt.post_id=curated_posts.id and c.active));
create policy "public active links" on public.post_tokens for select using(public.is_admin() or exists(select 1 from public.curated_coins c where c.id=token_id and c.active));
create policy "admin coins" on public.curated_coins for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy "admin posts" on public.curated_posts for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy "admin links" on public.post_tokens for all to authenticated using(public.is_admin()) with check(public.is_admin());
create or replace function public.touch_updated_at() returns trigger language plpgsql set search_path = '' as $$ begin new.updated_at = now(); return new; end; $$;
create trigger touch_coins before update on public.curated_coins for each row execute function public.touch_updated_at();
create trigger touch_posts before update on public.curated_posts for each row execute function public.touch_updated_at();
-- One transaction prevents a post being saved without its intended token associations.
create or replace function public.save_curated_post(p_id uuid, p_kol_name text, p_handle text, p_url text, p_summary text, p_published_at timestamptz, p_token_ids uuid[]) returns uuid language plpgsql security invoker set search_path = '' as $$
declare result_id uuid;
begin
 if not public.is_admin() then raise exception 'Administrator access required'; end if;
 if cardinality(p_token_ids) < 1 then raise exception 'Select at least one token'; end if;
 insert into public.curated_posts(id,kol_name,handle,url,summary,published_at) values(coalesce(p_id,gen_random_uuid()),p_kol_name,p_handle,p_url,p_summary,p_published_at)
 on conflict(id) do update set kol_name=excluded.kol_name,handle=excluded.handle,url=excluded.url,summary=excluded.summary,published_at=excluded.published_at returning id into result_id;
 delete from public.post_tokens where post_id=result_id;
 insert into public.post_tokens(post_id,token_id) select result_id,unnest(p_token_ids);
 return result_id;
end; $$;
revoke all on function public.save_curated_post(uuid,text,text,text,text,timestamptz,uuid[]) from public;
grant execute on function public.save_curated_post(uuid,text,text,text,text,timestamptz,uuid[]) to authenticated;
