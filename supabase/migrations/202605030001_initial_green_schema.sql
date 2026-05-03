create extension if not exists "pgcrypto";

create type public.gender as enum ('male', 'female');
create type public.account_status as enum ('pending', 'active', 'suspended', 'banned');
create type public.subscription_tier as enum ('free', 'basic', 'premium', 'vip');
create type public.match_status as enum ('pending', 'active', 'expired');
create type public.evaluation_flag_type as enum ('green', 'red');
create type public.report_status as enum ('open', 'reviewing', 'resolved', 'dismissed');
create type public.sanction_type as enum ('warning', 'suspension', 'ban');
create type public.app_role as enum ('member', 'operator', 'admin');

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  gender public.gender not null,
  role public.app_role not null default 'member',
  status public.account_status not null default 'pending',
  pass_verified boolean not null default false,
  green_flags_count integer not null default 0 check (green_flags_count >= 0),
  red_flags_count integer not null default 0 check (red_flags_count >= 0),
  subscription_tier public.subscription_tier not null default 'free',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profiles (
  user_id uuid primary key references public.users(id) on delete cascade,
  age integer not null check (age >= 19 and age <= 100),
  location text not null,
  bio text not null check (char_length(bio) <= 200),
  interests text[] not null default '{}',
  photos text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.flag_reason_options (
  id text primary key,
  flag_type public.evaluation_flag_type not null,
  label text not null,
  sort_order integer not null,
  active boolean not null default true,
  unique (flag_type, label)
);

create table public.green_flags (
  id uuid primary key default gen_random_uuid(),
  from_user_id uuid not null references public.users(id) on delete cascade,
  to_user_id uuid not null references public.users(id) on delete cascade,
  reasons text[] not null check (coalesce(array_length(reasons, 1), 0) between 1 and 3),
  created_at timestamptz not null default now(),
  constraint green_flags_no_self_review check (from_user_id <> to_user_id),
  constraint green_flags_one_per_pair unique (from_user_id, to_user_id)
);

create table public.review_passes (
  id uuid primary key default gen_random_uuid(),
  from_user_id uuid not null references public.users(id) on delete cascade,
  to_user_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint review_passes_no_self_review check (from_user_id <> to_user_id),
  constraint review_passes_one_per_pair unique (from_user_id, to_user_id)
);

create table public.matches (
  id uuid primary key default gen_random_uuid(),
  female_user_id uuid not null references public.users(id) on delete cascade,
  male_user_id uuid not null references public.users(id) on delete cascade,
  status public.match_status not null default 'pending',
  expires_at timestamptz not null default (now() + interval '24 hours'),
  created_at timestamptz not null default now(),
  constraint matches_no_self_match check (female_user_id <> male_user_id),
  constraint matches_one_active_pair unique (female_user_id, male_user_id)
);

create table public.evaluations (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  from_user_id uuid not null references public.users(id) on delete cascade,
  to_user_id uuid not null references public.users(id) on delete cascade,
  flag_type public.evaluation_flag_type not null,
  reasons text[] not null check (coalesce(array_length(reasons, 1), 0) between 1 and 3),
  created_at timestamptz not null default now(),
  constraint evaluations_no_self_review check (from_user_id <> to_user_id),
  constraint evaluations_one_per_match_user unique (match_id, from_user_id)
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_user_id uuid not null references public.users(id) on delete cascade,
  target_user_id uuid not null references public.users(id) on delete cascade,
  match_id uuid references public.matches(id) on delete set null,
  status public.report_status not null default 'open',
  reason text not null,
  memo text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint reports_no_self_report check (reporter_user_id <> target_user_id)
);

create table public.sanctions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  type public.sanction_type not null,
  reason text not null,
  report_id uuid references public.reports(id) on delete set null,
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.appeals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  report_id uuid references public.reports(id) on delete cascade,
  sanction_id uuid references public.sanctions(id) on delete cascade,
  status public.report_status not null default 'open',
  message text not null check (char_length(message) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint appeals_has_target check (report_id is not null or sanction_id is not null)
);

create index users_gender_status_idx on public.users (gender, status);
create index green_flags_to_user_idx on public.green_flags (to_user_id, created_at desc);
create index matches_female_status_idx on public.matches (female_user_id, status);
create index matches_male_status_idx on public.matches (male_user_id, status);
create index reports_status_created_idx on public.reports (status, created_at desc);
create index sanctions_user_created_idx on public.sanctions (user_id, created_at desc);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger users_touch_updated_at
before update on public.users
for each row execute function public.touch_updated_at();

create trigger profiles_touch_updated_at
before update on public.profiles
for each row execute function public.touch_updated_at();

create trigger reports_touch_updated_at
before update on public.reports
for each row execute function public.touch_updated_at();

create trigger appeals_touch_updated_at
before update on public.appeals
for each row execute function public.touch_updated_at();

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_gender public.gender;
begin
  requested_gender := case
    when new.raw_user_meta_data ->> 'gender' in ('male', 'female')
      then (new.raw_user_meta_data ->> 'gender')::public.gender
    else 'female'::public.gender
  end;

  insert into public.users (id, display_name, gender)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'display_name', ''), split_part(new.email, '@', 1), 'Green User'),
    requested_gender
  );

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

create or replace function public.sync_green_flag_count()
returns trigger
language plpgsql
as $$
begin
  update public.users
  set
    green_flags_count = (
      select count(*)::integer
      from public.green_flags
      where to_user_id = coalesce(new.to_user_id, old.to_user_id)
    ),
    status = case
      when gender = 'male'
        and status = 'pending'
        and (
          select count(*)::integer
          from public.green_flags
          where to_user_id = coalesce(new.to_user_id, old.to_user_id)
        ) >= 3
      then 'active'::public.account_status
      else status
    end
  where id = coalesce(new.to_user_id, old.to_user_id);

  return coalesce(new, old);
end;
$$;

create trigger green_flags_sync_count
after insert or delete on public.green_flags
for each row execute function public.sync_green_flag_count();

create or replace function public.sync_red_flag_count()
returns trigger
language plpgsql
as $$
begin
  if new.flag_type = 'red' then
    update public.users
    set
      red_flags_count = red_flags_count + 1,
      status = case
        when gender = 'male' and red_flags_count + 1 >= 3 then 'suspended'::public.account_status
        else status
      end
    where id = new.to_user_id;
  end if;

  return new;
end;
$$;

create trigger evaluations_sync_red_count
after insert on public.evaluations
for each row execute function public.sync_red_flag_count();

insert into public.flag_reason_options (id, flag_type, label, sort_order) values
  ('green_polite_tone', 'green', '말투가 정중함', 10),
  ('green_honest_profile', 'green', '프로필이 진솔함', 20),
  ('green_natural_photos', 'green', '사진이 자연스러움', 30),
  ('green_specific_bio', 'green', '자기소개가 구체적', 40),
  ('green_trustworthy_job', 'green', '직업 정보 신뢰감', 50),
  ('green_interesting_hobbies', 'green', '취미가 흥미로움', 60),
  ('green_time_management', 'green', '시간 관리 잘할 듯', 70),
  ('green_healthy_lifestyle', 'green', '건강한 라이프스타일', 80),
  ('green_intellectual_curiosity', 'green', '지적 호기심 보임', 90),
  ('green_family_values', 'green', '가족 가치관 좋음', 100),
  ('green_conversation_manners', 'green', '대화 매너가 좋을 듯', 110),
  ('green_clear_intent', 'green', '관계 의도가 분명함', 120),
  ('green_stable_routine', 'green', '생활 패턴이 안정적', 130),
  ('green_friend_recommendation', 'green', '친구 추천 신뢰감', 140),
  ('green_keeps_promises', 'green', '약속을 잘 지킬 듯', 150),
  ('green_mature_emotion', 'green', '감정 표현이 성숙함', 160),
  ('green_money_sense', 'green', '경제 관념이 건전함', 170),
  ('green_self_care', 'green', '자기 관리가 꾸준함', 180),
  ('green_calm_conflict', 'green', '갈등 대처가 차분할 듯', 190),
  ('green_long_term', 'green', '장기 관계 지향', 200),
  ('red_rude_expression', 'red', '무례한 표현', 10),
  ('red_profile_mismatch', 'red', '프로필 정보 불일치', 20),
  ('red_pressure', 'red', '원치 않는 만남 압박', 30),
  ('red_no_show', 'red', '약속 미준수', 40),
  ('red_inappropriate_photo_request', 'red', '부적절한 사진 요청', 50),
  ('red_operator_review', 'red', '기타 운영 검토 필요', 60);

alter table public.users enable row level security;
alter table public.profiles enable row level security;
alter table public.flag_reason_options enable row level security;
alter table public.green_flags enable row level security;
alter table public.review_passes enable row level security;
alter table public.matches enable row level security;
alter table public.evaluations enable row level security;
alter table public.reports enable row level security;
alter table public.sanctions enable row level security;
alter table public.appeals enable row level security;

create or replace function public.is_operator()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.users
    where id = auth.uid()
      and role in ('operator', 'admin')
  );
$$;

create policy "users can read own account"
on public.users for select
using (id = auth.uid() or public.is_operator());

create policy "profiles are readable for review and matching"
on public.profiles for select
using (
  public.is_operator()
  or user_id = auth.uid()
  or exists (
    select 1
    from public.users reviewer
    join public.users target on target.id = profiles.user_id
    where reviewer.id = auth.uid()
      and reviewer.gender = 'female'
      and target.gender = 'male'
      and target.pass_verified = true
      and target.status in ('pending', 'active')
  )
);

create policy "users manage own profile"
on public.profiles for all
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "active reason options are public to signed in users"
on public.flag_reason_options for select
using (auth.uid() is not null and active = true);

create policy "female users can create green flags for men"
on public.green_flags for insert
with check (
  from_user_id = auth.uid()
  and exists (select 1 from public.users where id = from_user_id and gender = 'female' and status = 'active')
  and exists (select 1 from public.users where id = to_user_id and gender = 'male' and pass_verified = true and status in ('pending', 'active'))
);

create policy "green flags visible to participants and operators"
on public.green_flags for select
using (from_user_id = auth.uid() or to_user_id = auth.uid() or public.is_operator());

create policy "female users can pass review candidates"
on public.review_passes for insert
with check (
  from_user_id = auth.uid()
  and exists (select 1 from public.users where id = from_user_id and gender = 'female' and status = 'active')
  and exists (select 1 from public.users where id = to_user_id and gender = 'male' and pass_verified = true and status in ('pending', 'active'))
);

create policy "review passes visible to operators"
on public.review_passes for select
using (public.is_operator());

create policy "matches visible to participants and operators"
on public.matches for select
using (female_user_id = auth.uid() or male_user_id = auth.uid() or public.is_operator());

create policy "female users create matches with active men"
on public.matches for insert
with check (
  female_user_id = auth.uid()
  and exists (select 1 from public.users where id = female_user_id and gender = 'female' and status = 'active')
  and exists (select 1 from public.users where id = male_user_id and gender = 'male' and status = 'active')
);

create policy "participants create evaluations"
on public.evaluations for insert
with check (
  from_user_id = auth.uid()
  and exists (
    select 1
    from public.matches
    where id = match_id
      and status in ('active', 'expired')
      and auth.uid() in (female_user_id, male_user_id)
      and to_user_id in (female_user_id, male_user_id)
  )
);

create policy "evaluations visible to participants and operators"
on public.evaluations for select
using (from_user_id = auth.uid() or to_user_id = auth.uid() or public.is_operator());

create policy "users create reports"
on public.reports for insert
with check (reporter_user_id = auth.uid() and reporter_user_id <> target_user_id);

create policy "reports visible to reporter target and operators"
on public.reports for select
using (reporter_user_id = auth.uid() or target_user_id = auth.uid() or public.is_operator());

create policy "operators update reports"
on public.reports for update
using (public.is_operator())
with check (public.is_operator());

create policy "sanctions visible to sanctioned user and operators"
on public.sanctions for select
using (user_id = auth.uid() or public.is_operator());

create policy "operators create sanctions"
on public.sanctions for insert
with check (public.is_operator());

create policy "users create appeals"
on public.appeals for insert
with check (user_id = auth.uid());

create policy "appeals visible to owner and operators"
on public.appeals for select
using (user_id = auth.uid() or public.is_operator());

create policy "operators update appeals"
on public.appeals for update
using (public.is_operator())
with check (public.is_operator());

grant usage on schema public to anon, authenticated;
grant select on public.flag_reason_options to authenticated;
grant select on public.users, public.profiles, public.green_flags, public.matches, public.evaluations, public.reports, public.sanctions, public.appeals to authenticated;
grant insert on public.green_flags, public.review_passes, public.matches, public.evaluations, public.reports, public.appeals to authenticated;
grant insert, update on public.sanctions, public.reports, public.appeals to authenticated;
grant insert, update, delete on public.profiles to authenticated;
