-- Drop existing policies (safe to re-run)
do $$ begin
  drop policy if exists "Profiles viewable by everyone" on public.profiles;
  drop policy if exists "Users can insert own profile" on public.profiles;
  drop policy if exists "Users can update own profile" on public.profiles;
  drop policy if exists "Entries viewable by everyone" on public.entries;
  drop policy if exists "Users can insert own entries" on public.entries;
  drop policy if exists "Users can update own entries" on public.entries;
  drop policy if exists "Users can delete own entries" on public.entries;
  drop policy if exists "Likes viewable by everyone" on public.likes;
  drop policy if exists "Users can like" on public.likes;
  drop policy if exists "Users can unlike" on public.likes;
  drop policy if exists "Follows viewable by everyone" on public.follows;
  drop policy if exists "Users can follow" on public.follows;
  drop policy if exists "Users can unfollow" on public.follows;
  drop policy if exists "Users can view own notifications" on public.notifications;
  drop policy if exists "Authenticated users can insert notifications" on public.notifications;
  drop policy if exists "Users can update own notifications" on public.notifications;
exception when others then null;
end $$;

drop trigger if exists on_auth_user_created on auth.users;

-- Tables
create table if not exists public.profiles (
  id uuid references auth.users primary key,
  username text unique not null,
  display_name text,
  bio text,
  avatar_letter text default 'U',
  avatar_color text default '#E84830',
  created_at timestamptz default now()
);

create table if not exists public.entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  type text not null check (type in ('movie', 'tv')),
  year int,
  genre text,
  status text,
  rating int check (rating between 1 and 5),
  review text,
  word_summary text[],
  poster_path text,
  tmdb_id int,
  created_at timestamptz default now()
);

create table if not exists public.likes (
  user_id uuid references public.profiles(id) on delete cascade,
  entry_id uuid references public.entries(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, entry_id)
);

create table if not exists public.follows (
  follower_id uuid references public.profiles(id) on delete cascade,
  following_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (follower_id, following_id)
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  from_user_id uuid references public.profiles(id) on delete cascade,
  type text not null,
  entry_id uuid references public.entries(id) on delete cascade,
  read boolean default false,
  created_at timestamptz default now()
);

-- RLS
alter table public.profiles enable row level security;
alter table public.entries enable row level security;
alter table public.likes enable row level security;
alter table public.follows enable row level security;
alter table public.notifications enable row level security;

-- Profiles policies
create policy "Profiles viewable by everyone" on public.profiles for select using (true);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Entries policies
create policy "Entries viewable by everyone" on public.entries for select using (true);
create policy "Users can insert own entries" on public.entries for insert with check (auth.uid() = user_id);
create policy "Users can update own entries" on public.entries for update using (auth.uid() = user_id);
create policy "Users can delete own entries" on public.entries for delete using (auth.uid() = user_id);

-- Likes policies
create policy "Likes viewable by everyone" on public.likes for select using (true);
create policy "Users can like" on public.likes for insert with check (auth.uid() = user_id);
create policy "Users can unlike" on public.likes for delete using (auth.uid() = user_id);

-- Follows policies
create policy "Follows viewable by everyone" on public.follows for select using (true);
create policy "Users can follow" on public.follows for insert with check (auth.uid() = follower_id);
create policy "Users can unfollow" on public.follows for delete using (auth.uid() = follower_id);

-- Notifications policies
create policy "Users can view own notifications" on public.notifications for select using (auth.uid() = user_id);
create policy "Authenticated users can insert notifications" on public.notifications for insert with check (auth.role() = 'authenticated');
create policy "Users can update own notifications" on public.notifications for update using (auth.uid() = user_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
declare
  uname text;
begin
  uname := coalesce(
    new.raw_user_meta_data->>'username',
    split_part(new.email, '@', 1)
  );
  insert into public.profiles (id, username, display_name, avatar_letter, avatar_color)
  values (
    new.id,
    uname,
    uname,
    upper(substring(uname, 1, 1)),
    '#E84830'
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
