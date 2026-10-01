alter table public.bitbuzz_publication_members
  add column if not exists bio text,
  add column if not exists instagram_url text,
  add column if not exists linkedin_url text,
  add column if not exists website_url text,
  add column if not exists second_pass_enabled boolean not null default false,
  add column if not exists second_pass_status text not null default 'locked',
  add column if not exists second_pass_submitted_at timestamptz,
  add column if not exists second_pass_reviewed_at timestamptz,
  add column if not exists second_pass_data jsonb not null default '{}'::jsonb;

alter table public.bitbuzz_publication_members drop constraint if exists bitbuzz_publication_members_second_pass_status_check;
alter table public.bitbuzz_publication_members add constraint bitbuzz_publication_members_second_pass_status_check check (second_pass_status in ('locked','open','submitted','approved','changes_requested'));

create or replace function public.bitbuzz_can_manage_second_pass(target_publication uuid)
returns boolean language sql stable security definer set search_path=''
as $$
 select public.bitbuzz_is_platform_admin()
 or exists (select 1 from public.bitbuzz_publication_admins a where a.publication_id=target_publication and lower(a.email)=lower(coalesce((select auth.jwt()->>'email'),'')) and (select auth.uid()) is not null)
 or exists (select 1 from public.bitbuzz_publication_members m where m.publication_id=target_publication and m.is_active=true and m.user_id=(select auth.uid()) and m.role in ('Super Admin','Admin','Editor'));
$$;

create or replace function public.bitbuzz_second_pass_access(target_member uuid)
returns table(member_id uuid,publication_id uuid,name text,role text,email text,photo_url text,bio text,instagram_url text,linkedin_url text,website_url text,second_pass_enabled boolean,second_pass_status text,second_pass_data jsonb)
language sql stable security definer set search_path=''
as $$
 select m.id,m.publication_id,m.name,m.role,m.email,m.photo_url,m.bio,m.instagram_url,m.linkedin_url,m.website_url,m.second_pass_enabled,m.second_pass_status,m.second_pass_data
 from public.bitbuzz_publication_members m
 where m.id=target_member and m.is_active=true and (public.bitbuzz_is_platform_admin() or m.user_id=(select auth.uid()) or lower(coalesce(m.email,''))=lower(coalesce((select auth.jwt()->>'email'),''))) and m.second_pass_enabled=true;
$$;

create or replace function public.bitbuzz_set_second_pass_access(p_member_id uuid,p_enabled boolean)
returns boolean language plpgsql security definer set search_path=''
as $$
declare pub uuid;
begin
 select publication_id into pub from public.bitbuzz_publication_members where id=p_member_id;
 if pub is null or not public.bitbuzz_can_manage_second_pass(pub) then raise exception 'Not authorized'; end if;
 update public.bitbuzz_publication_members set second_pass_enabled=p_enabled,second_pass_status=case when p_enabled then 'open' else 'locked' end,second_pass_reviewed_at=null,updated_at=now() where id=p_member_id and is_active=true;
 if not found then raise exception 'Ambassador not found'; end if;
 return true;
end;
$$;

create or replace function public.bitbuzz_save_second_pass(p_member_id uuid,p_data jsonb)
returns boolean language plpgsql security definer set search_path=''
as $$
begin
 if not exists (select 1 from public.bitbuzz_publication_members m where m.id=p_member_id and m.is_active=true and m.second_pass_enabled=true and (m.user_id=(select auth.uid()) or lower(coalesce(m.email,''))=lower(coalesce((select auth.jwt()->>'email'),'')) or public.bitbuzz_is_platform_admin())) then raise exception 'Second Pass access is not enabled for this Ambassador'; end if;
 update public.bitbuzz_publication_members set second_pass_data=jsonb_build_object('bio',left(trim(coalesce(p_data->>'bio','')),1000),'photo_url',left(trim(coalesce(p_data->>'photo_url','')),1000),'instagram_url',left(trim(coalesce(p_data->>'instagram_url','')),1000),'linkedin_url',left(trim(coalesce(p_data->>'linkedin_url','')),1000),'website_url',left(trim(coalesce(p_data->>'website_url','')),1000)),second_pass_status='submitted',second_pass_submitted_at=now(),updated_at=now() where id=p_member_id;
 return true;
end;
$$;

create or replace function public.bitbuzz_review_second_pass(p_member_id uuid,p_status text)
returns boolean language plpgsql security definer set search_path=''
as $$
declare pub uuid; d jsonb;
begin
 select publication_id into pub from public.bitbuzz_publication_members where id=p_member_id;
 if pub is null or not public.bitbuzz_can_manage_second_pass(pub) then raise exception 'Not authorized'; end if;
 if p_status not in ('approved','changes_requested') then raise exception 'Invalid review status'; end if;
 select second_pass_data into d from public.bitbuzz_publication_members where id=p_member_id;
 if not found then raise exception 'Ambassador not found'; end if;
 if p_status='approved' then
   update public.bitbuzz_publication_members set bio=nullif(left(trim(coalesce(d->>'bio','')),1000),''),photo_url=nullif(left(trim(coalesce(d->>'photo_url','')),1000),''),instagram_url=nullif(left(trim(coalesce(d->>'instagram_url','')),1000),''),linkedin_url=nullif(left(trim(coalesce(d->>'linkedin_url','')),1000),''),website_url=nullif(left(trim(coalesce(d->>'website_url','')),1000),''),second_pass_status='approved',second_pass_reviewed_at=now(),updated_at=now() where id=p_member_id;
 else update public.bitbuzz_publication_members set second_pass_status='changes_requested',second_pass_reviewed_at=now(),updated_at=now() where id=p_member_id;
 end if;
 return true;
end;
$$;

revoke all on function public.bitbuzz_can_manage_second_pass(uuid) from public, anon;
revoke all on function public.bitbuzz_second_pass_access(uuid) from public, anon;
revoke all on function public.bitbuzz_set_second_pass_access(uuid,boolean) from public, anon;
revoke all on function public.bitbuzz_save_second_pass(uuid,jsonb) from public, anon;
revoke all on function public.bitbuzz_review_second_pass(uuid,text) from public, anon;
grant execute on function public.bitbuzz_can_manage_second_pass(uuid) to authenticated;
grant execute on function public.bitbuzz_second_pass_access(uuid) to authenticated;
grant execute on function public.bitbuzz_set_second_pass_access(uuid,boolean) to authenticated;
grant execute on function public.bitbuzz_save_second_pass(uuid,jsonb) to authenticated;
grant execute on function public.bitbuzz_review_second_pass(uuid,text) to authenticated;

drop function public.bitbuzz_public_ambassadors(uuid);
create function public.bitbuzz_public_ambassadors(target_publication uuid)
returns table(id uuid,name text,role text,photo_url text,bio text,instagram_url text,linkedin_url text,website_url text)
language sql stable security definer set search_path=''
as $$
 select m.id,m.name,m.role,m.photo_url,m.bio,m.instagram_url,m.linkedin_url,m.website_url
 from public.bitbuzz_publication_members m join public.bitbuzz_publications p on p.id=m.publication_id
 where m.publication_id=target_publication and m.is_active=true and p.status='active'
 order by m.created_at asc;
$$;