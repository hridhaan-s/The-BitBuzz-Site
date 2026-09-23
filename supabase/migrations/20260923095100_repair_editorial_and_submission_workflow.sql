create or replace function public.bitbuzz_can_manage_article(target_category uuid)
returns boolean
language sql
stable
security definer
set search_path to ''
as $function$
  select public.bitbuzz_is_platform_admin()
  or exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role in ('admin','editor')
  )
  or exists (
    select 1 from public.bitbuzz_editorial_board_access a
    where a.category_id = target_category
      and lower(a.email) = lower(coalesce((select auth.jwt()->>'email'), ''))
  );
$function$;

create or replace function public.bitbuzz_can_manage_submission(target_publication uuid, target_media jsonb)
returns boolean
language sql
stable
security definer
set search_path to ''
as $function$
  select public.bitbuzz_is_platform_admin()
  or exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role in ('admin','editor')
  )
  or public.bitbuzz_is_publication_admin(target_publication)
  or exists (
    select 1
    from public.bitbuzz_editorial_board_access a
    join public.categories c on c.id = a.category_id
    where lower(a.email) = lower(coalesce((select auth.jwt()->>'email'), ''))
      and lower(c.slug) = lower(coalesce(target_media ->> 'category', ''))
  );
$function$;

create or replace function public.bitbuzz_list_main_submissions()
returns table(
  id uuid, author_name text, class_name text, section text,
  headline text, body text, status text, created_at timestamptz
)
language sql
stable
security definer
set search_path to ''
as $function$
  select s.id,s.author_name,s.class_name,s.section,s.headline,s.body,s.status,s.created_at
  from public.bitbuzz_submissions s
  where s.publication_id is null
    and length(trim(coalesce(s.author_name,''))) between 2 and 80
    and length(trim(coalesce(s.headline,''))) between 3 and 200
    and length(trim(coalesce(s.body,''))) >= 20
    and (
      s.author_email is null
      or lower(trim(s.author_email)) ~ '^[^@[:space:]]+@[^@[:space:]]+\\.[^@[:space:]]+$'
    )
    and (
      public.bitbuzz_is_platform_admin()
      or exists (
        select 1 from public.profiles p
        where p.id = (select auth.uid()) and p.role in ('admin','editor')
      )
    )
  order by s.created_at desc;
$function$;

revoke execute on function public.bitbuzz_list_main_submissions() from public, anon;
grant execute on function public.bitbuzz_list_main_submissions() to authenticated;

drop policy if exists "bitbuzz_submissions_insert" on public.bitbuzz_submissions;
create policy "bitbuzz_submissions_insert"
on public.bitbuzz_submissions
for insert
to anon, authenticated
with check (
  status = 'pending'
  and length(trim(coalesce(author_name,''))) between 2 and 80
  and length(trim(coalesce(headline,''))) between 3 and 200
  and length(trim(coalesce(body,''))) >= 20
  and (
    author_email is null
    or lower(trim(author_email)) ~ '^[^@[:space:]]+@[^@[:space:]]+\\.[^@[:space:]]+$'
  )
  and (
    publication_id is null
    or exists (
      select 1 from public.bitbuzz_publications p
      where p.id = bitbuzz_submissions.publication_id and p.status = 'active'
    )
  )
);

update public.bitbuzz_submissions
set status='rejected',
    reviewed_by=null,
    reviewed_at=coalesce(reviewed_at,now())
where publication_id is null
  and status='pending'
  and (
    length(trim(coalesce(author_name,''))) < 2
    or length(trim(coalesce(author_name,''))) > 80
    or length(trim(coalesce(headline,''))) < 3
    or length(trim(coalesce(headline,''))) > 200
    or length(trim(coalesce(body,''))) < 20
    or (
      author_email is not null
      and lower(trim(author_email)) !~ '^[^@[:space:]]+@[^@[:space:]]+\\.[^@[:space:]]+$'
    )
  );