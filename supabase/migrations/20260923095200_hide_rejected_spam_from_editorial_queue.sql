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
    and s.status <> 'rejected'
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