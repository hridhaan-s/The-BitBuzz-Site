-- ─────────────────────────────────────────────────────────────────────────────
-- Ambassador safety reports ("Speak up")
--
-- Students can anonymously report bullying, harassment and other safety
-- concerns to a publication's school. Design rules:
--   • Report text is readable ONLY by the publication's designated safety
--     contacts (trusted adults: counsellor / teacher), signed in with that email.
--     Platform admins, org admins and student ambassadors CANNOT read reports.
--   • Org admins (and platform admins) can manage who the safety contacts are.
--     Every change is logged and emailed to all contacts, so nobody can quietly
--     add themselves.
--   • Student team members only see aggregate counts.
--   • Reports are submitted through an RPC (no direct table access), are
--     anonymous by default, and the student gets a tracking code. Only a hash
--     of the code is stored.
--   • Reporting is only possible when at least one safety contact exists, so a
--     report never lands in an inbox nobody reads.
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.bitbuzz_safety_contacts (
  id uuid primary key default gen_random_uuid(),
  publication_id uuid not null references public.bitbuzz_publications(id) on delete cascade,
  email text not null check (email ~* '^[^\s@]+@[^\s@]+\.[^\s@]+$'),
  name text check (name is null or char_length(name) <= 120),
  added_by_email text,
  created_at timestamptz not null default now()
);
create unique index if not exists bitbuzz_safety_contacts_pub_email_key
  on public.bitbuzz_safety_contacts (publication_id, lower(email));

create table if not exists public.bitbuzz_safety_contact_log (
  id uuid primary key default gen_random_uuid(),
  publication_id uuid not null references public.bitbuzz_publications(id) on delete cascade,
  action text not null check (action in ('added','removed')),
  contact_email text not null,
  contact_name text,
  actor_email text,
  created_at timestamptz not null default now(),
  notified_at timestamptz
);
create index if not exists bitbuzz_safety_contact_log_pub_idx on public.bitbuzz_safety_contact_log (publication_id, created_at desc);

create table if not exists public.bitbuzz_safety_reports (
  id uuid primary key default gen_random_uuid(),
  publication_id uuid not null references public.bitbuzz_publications(id) on delete cascade,
  category text not null check (category in ('bullying','cyberbullying','harassment','discrimination','threat_or_violence','self_harm_concern','substance','other')),
  details text not null check (char_length(details) between 20 and 5000),
  location text check (location is null or char_length(location) <= 200),
  happened_when text check (happened_when is null or char_length(happened_when) <= 120),
  is_ongoing boolean not null default false,
  is_urgent boolean not null default false,
  reporter_contact text check (reporter_contact is null or char_length(reporter_contact) <= 200),
  tracking_hash text not null unique,
  status text not null default 'new' check (status in ('new','reviewing','action_taken','closed')),
  staff_notes text check (staff_notes is null or char_length(staff_notes) <= 5000),
  reporter_message text check (reporter_message is null or char_length(reporter_message) <= 1000),
  handled_by_email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  notified_at timestamptz
);
create index if not exists bitbuzz_safety_reports_pub_idx on public.bitbuzz_safety_reports (publication_id, created_at desc);

-- Lock the tables down completely: everything goes through the functions below.
alter table public.bitbuzz_safety_contacts enable row level security;
alter table public.bitbuzz_safety_contact_log enable row level security;
alter table public.bitbuzz_safety_reports enable row level security;
revoke all on public.bitbuzz_safety_contacts from anon, authenticated;
revoke all on public.bitbuzz_safety_contact_log from anon, authenticated;
revoke all on public.bitbuzz_safety_reports from anon, authenticated;

-- ── permission helpers ──────────────────────────────────────────────────────

create or replace function public.bitbuzz_safety_my_email()
returns text language sql stable set search_path=''
as $$ select case when (select auth.uid()) is null then '' else lower(coalesce((select auth.jwt()->>'email'),'')) end $$;

create or replace function public.bitbuzz_safety_is_contact(target_publication uuid)
returns boolean language sql stable security definer set search_path=''
as $$
  select public.bitbuzz_safety_my_email() <> ''
     and exists (select 1 from public.bitbuzz_safety_contacts c
                 where c.publication_id = target_publication
                   and lower(c.email) = public.bitbuzz_safety_my_email());
$$;

create or replace function public.bitbuzz_safety_can_manage(target_publication uuid)
returns boolean language sql stable security definer set search_path=''
as $$
  select (select auth.uid()) is not null and (
    public.bitbuzz_is_platform_admin()
    or exists (select 1 from public.bitbuzz_publication_admins a
               where a.publication_id = target_publication and lower(a.email) = public.bitbuzz_safety_my_email())
    or exists (select 1 from public.bitbuzz_publication_members m
               where m.publication_id = target_publication and m.is_active = true
                 and m.user_id = (select auth.uid()) and m.role in ('Super Admin','Admin'))
  );
$$;

create or replace function public.bitbuzz_safety_is_team(target_publication uuid)
returns boolean language sql stable security definer set search_path=''
as $$
  select public.bitbuzz_safety_can_manage(target_publication)
      or public.bitbuzz_safety_is_contact(target_publication)
      or exists (select 1 from public.bitbuzz_publication_members m
                 where m.publication_id = target_publication and m.is_active = true
                   and m.user_id = (select auth.uid()));
$$;

-- ── public: is reporting available for this publication? ────────────────────

create or replace function public.bitbuzz_safety_reporting_status(p_slug text)
returns table(publication_id uuid, profile_name text, school_name text, enabled boolean)
language sql stable security definer set search_path=''
as $$
  select p.id, p.profile_name, p.school_name,
         exists (select 1 from public.bitbuzz_safety_contacts c where c.publication_id = p.id)
  from public.bitbuzz_publications p
  where p.slug = p_slug and p.status = 'active';
$$;

-- ── public: submit a report ─────────────────────────────────────────────────

create or replace function public.bitbuzz_submit_safety_report(
  p_slug text,
  p_category text,
  p_details text,
  p_location text default null,
  p_when text default null,
  p_ongoing boolean default false,
  p_urgent boolean default false,
  p_contact text default null
)
returns table(report_id uuid, tracking_code text)
language plpgsql volatile security definer set search_path=''
as $$
declare
  pub uuid;
  code text;
  new_id uuid;
begin
  select p.id into pub from public.bitbuzz_publications p where p.slug = p_slug and p.status = 'active';
  if pub is null then raise exception 'Publication not found'; end if;
  if not exists (select 1 from public.bitbuzz_safety_contacts c where c.publication_id = pub) then
    raise exception 'Reporting is not set up for this school yet';
  end if;
  if p_category is null or p_category not in ('bullying','cyberbullying','harassment','discrimination','threat_or_violence','self_harm_concern','substance','other') then
    raise exception 'Choose what kind of concern this is';
  end if;
  if char_length(trim(coalesce(p_details,''))) < 20 then
    raise exception 'Please describe what happened in at least 20 characters';
  end if;
  -- Flood protection: max 30 reports per publication per hour.
  if (select count(*) from public.bitbuzz_safety_reports r
      where r.publication_id = pub and r.created_at > now() - interval '1 hour') >= 30 then
    raise exception 'Too many reports right now. Please try again in a little while, or speak to a trusted adult directly.';
  end if;

  code := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12));
  code := substr(code,1,4) || '-' || substr(code,5,4) || '-' || substr(code,9,4);

  insert into public.bitbuzz_safety_reports
    (publication_id, category, details, location, happened_when, is_ongoing, is_urgent, reporter_contact, tracking_hash)
  values
    (pub, p_category, trim(p_details), nullif(trim(coalesce(p_location,'')),''), nullif(trim(coalesce(p_when,'')),''),
     coalesce(p_ongoing,false), coalesce(p_urgent,false), nullif(trim(coalesce(p_contact,'')),''),
     encode(sha256(convert_to(code,'UTF8')),'hex'))
  returning id into new_id;

  return query select new_id, code;
end;
$$;

-- ── public: check status with the tracking code ─────────────────────────────

create or replace function public.bitbuzz_safety_report_status(p_code text)
returns table(status text, reporter_message text, created_at timestamptz, updated_at timestamptz, publication_name text)
language sql stable security definer set search_path=''
as $$
  select r.status, r.reporter_message, r.created_at, r.updated_at, p.profile_name
  from public.bitbuzz_safety_reports r
  join public.bitbuzz_publications p on p.id = r.publication_id
  where r.tracking_hash = encode(sha256(convert_to(upper(trim(coalesce(p_code,''))),'UTF8')),'hex');
$$;

-- ── safety contacts: read + update reports ─────────────────────────────────

create or replace function public.bitbuzz_list_safety_reports(p_publication_id uuid)
returns table(id uuid, category text, details text, location text, happened_when text, is_ongoing boolean, is_urgent boolean,
              reporter_contact text, status text, staff_notes text, reporter_message text, handled_by_email text,
              created_at timestamptz, updated_at timestamptz)
language plpgsql stable security definer set search_path=''
as $$
begin
  if not public.bitbuzz_safety_is_contact(p_publication_id) then raise exception 'Not authorized'; end if;
  return query
    select r.id, r.category, r.details, r.location, r.happened_when, r.is_ongoing, r.is_urgent, r.reporter_contact,
           r.status, r.staff_notes, r.reporter_message, r.handled_by_email, r.created_at, r.updated_at
    from public.bitbuzz_safety_reports r
    where r.publication_id = p_publication_id
    order by (r.status in ('new','reviewing')) desc, r.is_urgent desc, r.created_at desc;
end;
$$;

create or replace function public.bitbuzz_update_safety_report(p_report_id uuid, p_status text, p_staff_notes text, p_reporter_message text)
returns boolean language plpgsql volatile security definer set search_path=''
as $$
declare pub uuid;
begin
  select r.publication_id into pub from public.bitbuzz_safety_reports r where r.id = p_report_id;
  if pub is null or not public.bitbuzz_safety_is_contact(pub) then raise exception 'Not authorized'; end if;
  update public.bitbuzz_safety_reports
     set status = p_status,
         staff_notes = nullif(trim(coalesce(p_staff_notes,'')),''),
         reporter_message = nullif(trim(coalesce(p_reporter_message,'')),''),
         handled_by_email = public.bitbuzz_safety_my_email(),
         updated_at = now()
   where id = p_report_id;
  return true;
end;
$$;

-- ── team: aggregate counts only ─────────────────────────────────────────────

create or replace function public.bitbuzz_safety_summary(p_publication_id uuid)
returns table(total bigint, open bigint, urgent_open bigint, last_30_days bigint, contacts bigint, is_contact boolean, can_manage boolean)
language plpgsql stable security definer set search_path=''
as $$
begin
  if not public.bitbuzz_safety_is_team(p_publication_id) then raise exception 'Not authorized'; end if;
  return query
    select count(r.id),
           count(r.id) filter (where r.status in ('new','reviewing')),
           count(r.id) filter (where r.status in ('new','reviewing') and r.is_urgent),
           count(r.id) filter (where r.created_at > now() - interval '30 days'),
           (select count(*) from public.bitbuzz_safety_contacts c where c.publication_id = p_publication_id),
           public.bitbuzz_safety_is_contact(p_publication_id),
           public.bitbuzz_safety_can_manage(p_publication_id)
    from public.bitbuzz_safety_reports r
    where r.publication_id = p_publication_id;
end;
$$;

-- ── contacts management (org admins + platform admin) ───────────────────────

create or replace function public.bitbuzz_list_safety_contacts(p_publication_id uuid)
returns table(id uuid, email text, name text, added_by_email text, created_at timestamptz)
language plpgsql stable security definer set search_path=''
as $$
begin
  if not (public.bitbuzz_safety_can_manage(p_publication_id) or public.bitbuzz_safety_is_contact(p_publication_id)) then
    raise exception 'Not authorized';
  end if;
  return query select c.id, c.email, c.name, c.added_by_email, c.created_at
               from public.bitbuzz_safety_contacts c where c.publication_id = p_publication_id order by c.created_at;
end;
$$;

create or replace function public.bitbuzz_safety_contact_history(p_publication_id uuid)
returns table(id uuid, action text, contact_email text, actor_email text, created_at timestamptz)
language plpgsql stable security definer set search_path=''
as $$
begin
  if not (public.bitbuzz_safety_can_manage(p_publication_id) or public.bitbuzz_safety_is_contact(p_publication_id)) then
    raise exception 'Not authorized';
  end if;
  return query select l.id, l.action, l.contact_email, l.actor_email, l.created_at
               from public.bitbuzz_safety_contact_log l where l.publication_id = p_publication_id
               order by l.created_at desc limit 50;
end;
$$;

create or replace function public.bitbuzz_add_safety_contact(p_publication_id uuid, p_email text, p_name text default null)
returns uuid language plpgsql volatile security definer set search_path=''
as $$
declare clean text := lower(trim(coalesce(p_email,''))); log_id uuid;
begin
  if not public.bitbuzz_safety_can_manage(p_publication_id) then raise exception 'Not authorized'; end if;
  if clean !~* '^[^\s@]+@[^\s@]+\.[^\s@]+$' then raise exception 'Enter a valid email address'; end if;
  if (select count(*) from public.bitbuzz_safety_contacts c where c.publication_id = p_publication_id) >= 5 then
    raise exception 'A school can have at most 5 safety contacts';
  end if;
  insert into public.bitbuzz_safety_contacts (publication_id, email, name, added_by_email)
  values (p_publication_id, clean, nullif(trim(coalesce(p_name,'')),''), public.bitbuzz_safety_my_email());
  insert into public.bitbuzz_safety_contact_log (publication_id, action, contact_email, contact_name, actor_email)
  values (p_publication_id, 'added', clean, nullif(trim(coalesce(p_name,'')),''), public.bitbuzz_safety_my_email())
  returning id into log_id;
  return log_id;
exception when unique_violation then
  raise exception 'That person is already a safety contact';
end;
$$;

create or replace function public.bitbuzz_remove_safety_contact(p_contact_id uuid)
returns uuid language plpgsql volatile security definer set search_path=''
as $$
declare c public.bitbuzz_safety_contacts; log_id uuid;
begin
  select * into c from public.bitbuzz_safety_contacts where id = p_contact_id;
  if c.id is null or not public.bitbuzz_safety_can_manage(c.publication_id) then raise exception 'Not authorized'; end if;
  delete from public.bitbuzz_safety_contacts where id = p_contact_id;
  insert into public.bitbuzz_safety_contact_log (publication_id, action, contact_email, contact_name, actor_email)
  values (c.publication_id, 'removed', c.email, c.name, public.bitbuzz_safety_my_email())
  returning id into log_id;
  return log_id;
end;
$$;

-- ── counsellor inbox: which publications am I a contact for? ────────────────

create or replace function public.bitbuzz_my_safety_publications()
returns table(id uuid, slug text, profile_name text, school_name text, open_reports bigint)
language sql stable security definer set search_path=''
as $$
  select p.id, p.slug, p.profile_name, p.school_name,
         (select count(*) from public.bitbuzz_safety_reports r where r.publication_id = p.id and r.status in ('new','reviewing'))
  from public.bitbuzz_publications p
  join public.bitbuzz_safety_contacts c on c.publication_id = p.id
  where public.bitbuzz_safety_my_email() <> '' and lower(c.email) = public.bitbuzz_safety_my_email()
  order by p.profile_name;
$$;

-- ── grants ──────────────────────────────────────────────────────────────────
-- Functions are executable by PUBLIC by default; be explicit.
revoke all on function public.bitbuzz_safety_my_email() from public;
revoke all on function public.bitbuzz_safety_is_contact(uuid) from public;
revoke all on function public.bitbuzz_safety_can_manage(uuid) from public;
revoke all on function public.bitbuzz_safety_is_team(uuid) from public;
revoke all on function public.bitbuzz_list_safety_reports(uuid) from public;
revoke all on function public.bitbuzz_update_safety_report(uuid,text,text,text) from public;
revoke all on function public.bitbuzz_safety_summary(uuid) from public;
revoke all on function public.bitbuzz_list_safety_contacts(uuid) from public;
revoke all on function public.bitbuzz_safety_contact_history(uuid) from public;
revoke all on function public.bitbuzz_add_safety_contact(uuid,text,text) from public;
revoke all on function public.bitbuzz_remove_safety_contact(uuid) from public;
revoke all on function public.bitbuzz_my_safety_publications() from public;

grant execute on function public.bitbuzz_safety_reporting_status(text) to anon, authenticated;
grant execute on function public.bitbuzz_submit_safety_report(text,text,text,text,text,boolean,boolean,text) to anon, authenticated;
grant execute on function public.bitbuzz_safety_report_status(text) to anon, authenticated;

grant execute on function public.bitbuzz_safety_my_email() to authenticated;
grant execute on function public.bitbuzz_safety_is_contact(uuid) to authenticated;
grant execute on function public.bitbuzz_safety_can_manage(uuid) to authenticated;
grant execute on function public.bitbuzz_safety_is_team(uuid) to authenticated;
grant execute on function public.bitbuzz_list_safety_reports(uuid) to authenticated;
grant execute on function public.bitbuzz_update_safety_report(uuid,text,text,text) to authenticated;
grant execute on function public.bitbuzz_safety_summary(uuid) to authenticated;
grant execute on function public.bitbuzz_list_safety_contacts(uuid) to authenticated;
grant execute on function public.bitbuzz_safety_contact_history(uuid) to authenticated;
grant execute on function public.bitbuzz_add_safety_contact(uuid,text,text) to authenticated;
grant execute on function public.bitbuzz_remove_safety_contact(uuid) to authenticated;
grant execute on function public.bitbuzz_my_safety_publications() to authenticated;