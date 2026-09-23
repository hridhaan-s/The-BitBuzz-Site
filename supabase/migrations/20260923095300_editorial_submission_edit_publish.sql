-- Editorial submission editing and publishing helpers
create or replace function public.bitbuzz_list_main_submissions_v2()
returns table(id uuid,author_name text,class_name text,section text,headline text,body text,media jsonb,status text,created_at timestamptz)
language sql stable security definer set search_path to ''
as $$
 select s.id,s.author_name,s.class_name,s.section,s.headline,s.body,s.media,s.status,s.created_at
 from public.bitbuzz_submissions s
 where s.publication_id is null and s.status <> 'rejected'
 and length(trim(coalesce(s.author_name,''))) between 2 and 80
 and length(trim(coalesce(s.headline,''))) between 3 and 200
 and length(trim(coalesce(s.body,''))) >= 20
 and (public.bitbuzz_is_platform_admin() or exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.role in ('admin','editor')))
 order by s.created_at desc;
$$;

create or replace function public.bitbuzz_admin_edit_submission(p_submission_id uuid,p_headline text,p_body text,p_section text default null,p_media jsonb default '[]'::jsonb)
returns boolean language plpgsql security definer set search_path to ''
as $$
begin
 if not (public.bitbuzz_is_platform_admin() or exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.role in ('admin','editor')) or public.bitbuzz_can_access_ambassador_submissions()) then raise exception 'Not authorized'; end if;
 if length(trim(coalesce(p_headline,'')))<3 or length(trim(coalesce(p_body,'')))<20 then raise exception 'Headline and body are too short'; end if;
 update public.bitbuzz_submissions set headline=trim(p_headline),body=trim(p_body),section=nullif(trim(coalesce(p_section,'')),''),media=case when jsonb_typeof(coalesce(p_media,'[]'::jsonb))='array' then p_media else '[]'::jsonb end where id=p_submission_id;
 return found;
end; $$;

create or replace function public.bitbuzz_admin_publish_ambassador_submission(p_submission_id uuid,p_headline text,p_body text,p_description text default null,p_category text default 'News',p_cover_url text default null)
returns uuid language plpgsql security definer set search_path to ''
as $$
declare s public.bitbuzz_submissions%rowtype; article_id uuid;
begin
 if not public.bitbuzz_can_access_ambassador_submissions() and not public.bitbuzz_is_platform_admin() then raise exception 'Not authorized'; end if;
 select * into s from public.bitbuzz_submissions where id=p_submission_id and publication_id is not null;
 if not found then raise exception 'Submission not found'; end if;
 insert into public.bitbuzz_articles(publication_id,slug,headline,description,body,author_name,category,reading_time,cover_url,status,published_at,created_by)
 values(s.publication_id,lower(regexp_replace(trim(p_headline),'[^a-zA-Z0-9]+','-','g'))||'-'||substr(replace(gen_random_uuid()::text,'-',''),1,8),trim(p_headline),nullif(trim(coalesce(p_description,'')),''),trim(p_body),s.author_name,nullif(trim(coalesce(p_category,'News')),''),greatest(1,ceil(array_length(regexp_split_to_array(trim(p_body),'\\s+'),1)::numeric/220)::int),nullif(trim(coalesce(p_cover_url,'')),''),'published',now(),auth.uid()) returning id into article_id;
 update public.bitbuzz_submissions set headline=trim(p_headline),body=trim(p_body),status='approved',reviewed_by=auth.uid(),reviewed_at=now() where id=p_submission_id;
 return article_id;
end; $$;

create or replace function public.bitbuzz_admin_publish_main_submission(p_submission_id uuid,p_headline text,p_body text,p_standfirst text default null,p_category_id uuid default null,p_cover_url text default null,p_cover_alt text default null)
returns uuid language plpgsql security definer set search_path to ''
as $$
declare s public.bitbuzz_submissions%rowtype; article_id uuid;
begin
 if not public.bitbuzz_is_platform_admin() and not exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.role in ('admin','editor')) then raise exception 'Not authorized'; end if;
 select * into s from public.bitbuzz_submissions where id=p_submission_id and publication_id is null;
 if not found then raise exception 'Submission not found'; end if;
 insert into public.articles(slug,title,standfirst,body_md,category_id,author_id,cover_image_url,cover_alt,read_minutes,status,published_at,is_lead,submission_id)
 values(lower(regexp_replace(trim(p_headline),'[^a-zA-Z0-9]+','-','g'))||'-'||substr(replace(gen_random_uuid()::text,'-',''),1,8),trim(p_headline),nullif(trim(coalesce(p_standfirst,'')),''),trim(p_body),p_category_id,coalesce(s.author_id,auth.uid()),nullif(trim(coalesce(p_cover_url,'')),''),nullif(trim(coalesce(p_cover_alt,'')),''),greatest(1,ceil(array_length(regexp_split_to_array(trim(p_body),'\\s+'),1)::numeric/220)::int),'published',now(),false,s.id) returning id into article_id;
 update public.bitbuzz_submissions set headline=trim(p_headline),body=trim(p_body),status='approved',reviewed_by=auth.uid(),reviewed_at=now() where id=s.id;
 return article_id;
end; $$;

revoke all on function public.bitbuzz_list_main_submissions_v2() from public;
grant execute on function public.bitbuzz_list_main_submissions_v2() to authenticated;
revoke all on function public.bitbuzz_admin_edit_submission(uuid,text,text,text,jsonb) from public;
grant execute on function public.bitbuzz_admin_edit_submission(uuid,text,text,text,jsonb) to authenticated;
revoke all on function public.bitbuzz_admin_publish_ambassador_submission(uuid,text,text,text,text,text) from public;
grant execute on function public.bitbuzz_admin_publish_ambassador_submission(uuid,text,text,text,text,text) to authenticated;
revoke all on function public.bitbuzz_admin_publish_main_submission(uuid,text,text,text,uuid,text,text) from public;
grant execute on function public.bitbuzz_admin_publish_main_submission(uuid,text,text,text,uuid,text,text) to authenticated;


create or replace function public.bitbuzz_admin_delete_ambassador_submission(p_submission_id uuid)
returns boolean language plpgsql security definer set search_path to ''
as $$
begin
 if not public.bitbuzz_can_access_ambassador_submissions() and not public.bitbuzz_is_platform_admin() then raise exception 'Not authorized'; end if;
 delete from public.bitbuzz_submissions
 where id=p_submission_id and publication_id is not null and status='approved';
 return found;
end; $$;

revoke all on function public.bitbuzz_admin_delete_ambassador_submission(uuid) from public;
grant execute on function public.bitbuzz_admin_delete_ambassador_submission(uuid) to authenticated;
