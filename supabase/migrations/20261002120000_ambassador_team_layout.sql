-- Ambassador team presentation controls: visibility + manual ordering.
alter table public.bitbuzz_publication_members
  add column if not exists display_order integer not null default 0;

with ranked as (
  select id,
         row_number() over (
           partition by publication_id
           order by created_at asc, id asc
         ) - 1 as rn
  from public.bitbuzz_publication_members
)
update public.bitbuzz_publication_members m
set display_order = r.rn
from ranked r
where m.id = r.id;

drop function if exists public.bitbuzz_public_ambassadors(uuid);

create function public.bitbuzz_public_ambassadors(target_publication uuid)
returns table(
  id uuid,
  name text,
  role text,
  photo_url text,
  bio text,
  instagram_url text,
  linkedin_url text,
  website_url text
)
language sql
stable
security definer
set search_path=''
as $$
  select
    m.id,
    m.name,
    m.role,
    m.photo_url,
    m.bio,
    m.instagram_url,
    m.linkedin_url,
    m.website_url
  from public.bitbuzz_publication_members m
  join public.bitbuzz_publications p on p.id=m.publication_id
  where m.publication_id=target_publication
    and m.is_active=true
    and p.status='active'
  order by m.display_order asc, m.created_at asc;
$$;
