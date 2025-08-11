-- 0019_learner_ux_polish.sql
-- Sprint 23: Learner Surfaces Polish (Modern UI Phase 2) + Quiz/Exam Player v2 + Seat-Time Integrity

-- Add profile fields for learner engagement and preferences
alter table public.profiles add column if not exists last_seen_tip timestamptz;
alter table public.profiles add column if not exists last_seen_celebration_at timestamptz;
alter table public.profiles add column if not exists allow_confetti boolean not null default true;

-- Add index for engagement tracking queries
create index if not exists profiles_last_seen_tip_idx on public.profiles(last_seen_tip);
create index if not exists profiles_last_seen_celebration_at_idx on public.profiles(last_seen_celebration_at);

-- Add comment for documentation
comment on column public.profiles.last_seen_tip is 'Timestamp of last tip shown to user';
comment on column public.profiles.last_seen_celebration_at is 'Timestamp of last celebration shown to user';
comment on column public.profiles.allow_confetti is 'User preference for confetti animations';
