-- Migration: Create Community Forum Schema
-- Description: Complete forum schema with anonymous profiles, groups, posts, comments, and messaging system
-- This creates a comprehensive community forum with privacy-focused anonymous interactions

-- 1. SCHEMA & ENUMS
create schema if not exists forum;
create type forum.status_enum as enum ('pending','approved','rejected');
create type forum.group_type_enum as enum ('public','private');

-- 2. PERFIL ANÔNIMO
create table forum.anonymous_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  nickname text not null unique,
  created_at timestamptz default now()
);

-- 3. CATEGORIAS & TAGS
create table forum.categories(
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text
);

create table forum.tags(
  id uuid primary key default gen_random_uuid(),
  name text not null unique
);

-- 4. GRUPOS & MEMBROS
create table forum.groups(
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  group_type forum.group_type_enum default 'public',
  owner_anon_id uuid not null references forum.anonymous_profiles(id),
  created_at timestamptz default now()
);

create table forum.group_members(
  anon_profile_id uuid references forum.anonymous_profiles(id) on delete cascade,
  group_id uuid references forum.groups(id) on delete cascade,
  is_approved boolean default false,
  role text default 'member',
  primary key(anon_profile_id, group_id)
);

-- 5. POSTS (diretamente no grupo ou fórum geral)
create table forum.posts(
  id uuid primary key default gen_random_uuid(),
  group_id uuid references forum.groups(id), -- null = fórum geral
  author_anon_id uuid not null references forum.anonymous_profiles(id),
  category_id uuid references forum.categories(id),
  title text, -- opcional: para posts que funcionam como threads
  content text not null,
  status forum.status_enum default 'pending',
  created_at timestamptz default now()
);

create table forum.post_tags(
  post_id uuid references forum.posts(id) on delete cascade,
  tag_id uuid references forum.tags(id) on delete cascade,
  primary key(post_id, tag_id)
);

-- 6. LIKES
create table forum.likes(
  post_id uuid references forum.posts(id) on delete cascade,
  anon_profile_id uuid references forum.anonymous_profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key(post_id, anon_profile_id)
);

-- 7. COMMENTS
create table forum.comments(
  id uuid primary key default gen_random_uuid(),
  post_id uuid references forum.posts(id) on delete cascade,
  author_anon_id uuid references forum.anonymous_profiles(id),
  parent_comment_id uuid references forum.comments(id),
  content text not null,
  status forum.status_enum default 'approved',
  created_at timestamptz default now()
);

-- 8. DMs (mensagens diretas entre perfis anônimos)
create table forum.messages(
  id uuid primary key default gen_random_uuid(),
  sender_anon_id uuid references forum.anonymous_profiles(id),
  receiver_anon_id uuid references forum.anonymous_profiles(id),
  content text not null,
  status forum.status_enum default 'approved',
  created_at timestamptz default now(),
  seen_at timestamptz
);

-- 9. LOG DE MODERAÇÃO
create table forum.moderation_log(
  id bigserial primary key,
  resource_type text not null, -- 'post', 'comment', 'message'
  resource_id uuid not null,
  action forum.status_enum,
  reviewer_anon_id uuid references forum.anonymous_profiles(id),
  reason text,
  created_at timestamptz default now()
);

-- 10. RLS — Row Level Security

-- PERFIL ANÔNIMO
alter table forum.anonymous_profiles enable row level security;
create policy "Self select/update" on forum.anonymous_profiles
  for select using (user_id = auth.uid());
create policy "Self insert" on forum.anonymous_profiles
  for insert with check (user_id = auth.uid());
create policy "Self update" on forum.anonymous_profiles
  for update using (user_id = auth.uid());

-- POSTS
alter table forum.posts enable row level security;
create policy "Read approved or own posts" on forum.posts
  for select using (
    status='approved' or
    author_anon_id = (select id from forum.anonymous_profiles where user_id=auth.uid())
  );
create policy "Insert if member or general forum" on forum.posts
  for insert with check (
    -- General forum (group_id = null) - any authenticated user
    group_id is null or
    -- Group posts - must be approved member
    exists(
      select 1 from forum.group_members gm
      where gm.anon_profile_id = (select id from forum.anonymous_profiles where user_id=auth.uid())
        and gm.group_id = forum.posts.group_id 
        and gm.is_approved = true
    )
  );
create policy "Update own posts" on forum.posts
  for update using (author_anon_id = (select id from forum.anonymous_profiles where user_id=auth.uid()));
create policy "Delete own posts" on forum.posts
  for delete using (author_anon_id = (select id from forum.anonymous_profiles where user_id=auth.uid()));

-- COMMENTS
alter table forum.comments enable row level security;
create policy "Read approved or own comments" on forum.comments
  for select using (
    status='approved' or
    author_anon_id = (select id from forum.anonymous_profiles where user_id=auth.uid())
  );
create policy "Insert comment if post visible" on forum.comments
  for insert with check (
    exists(
      select 1 from forum.posts p
      where p.id = post_id and (
        p.status='approved' or
        p.author_anon_id = (select id from forum.anonymous_profiles where user_id=auth.uid())
      )
    )
  );
create policy "Update own comments" on forum.comments
  for update using (author_anon_id = (select id from forum.anonymous_profiles where user_id=auth.uid()));
create policy "Delete own comments" on forum.comments
  for delete using (author_anon_id = (select id from forum.anonymous_profiles where user_id=auth.uid()));

-- LIKES
alter table forum.likes enable row level security;
create policy "Like visible post" on forum.likes
  for insert with check (
    exists(select 1 from forum.posts p where p.id=post_id and p.status='approved')
    and anon_profile_id = (select id from forum.anonymous_profiles where user_id=auth.uid())
  );
create policy "Remove own like" on forum.likes
  for delete using (anon_profile_id = (select id from forum.anonymous_profiles where user_id=auth.uid()));
create policy "Read own likes" on forum.likes
  for select using (anon_profile_id = (select id from forum.anonymous_profiles where user_id=auth.uid()));

-- MESSAGES (DM)
alter table forum.messages enable row level security;
create policy "Sender or receiver can read" on forum.messages
  for select using (
    sender_anon_id = (select id from forum.anonymous_profiles where user_id=auth.uid()) or
    receiver_anon_id = (select id from forum.anonymous_profiles where user_id=auth.uid())
  );
create policy "Only sender inserts" on forum.messages
  for insert with check (sender_anon_id = (select id from forum.anonymous_profiles where user_id=auth.uid()));
create policy "Sender can delete own sent" on forum.messages
  for delete using (sender_anon_id = (select id from forum.anonymous_profiles where user_id=auth.uid()));

-- GRUPOS
alter table forum.groups enable row level security;
create policy "Group read all" on forum.groups for select using (true);
create policy "Owner can update" on forum.groups
  for update using (owner_anon_id = (select id from forum.anonymous_profiles where user_id=auth.uid()));
create policy "Owner can delete" on forum.groups
  for delete using (owner_anon_id = (select id from forum.anonymous_profiles where user_id=auth.uid()));
create policy "Any authenticated user can create groups" on forum.groups
  for insert with check (auth.role() = 'authenticated');

-- GROUP MEMBERS
alter table forum.group_members enable row level security;
create policy "Members can read group membership" on forum.group_members
  for select using (
    -- Users can see their own membership
    anon_profile_id IN (
      SELECT id FROM forum.anonymous_profiles WHERE user_id = auth.uid()
    )
    OR
    -- Group owners can see all memberships of their groups
    group_id IN (
      SELECT g.id FROM forum.groups g
      WHERE g.owner_anon_id IN (
        SELECT id FROM forum.anonymous_profiles WHERE user_id = auth.uid()
      )
    )
  );
create policy "Insert self" on forum.group_members
  for insert with check (anon_profile_id = (select id from forum.anonymous_profiles where user_id=auth.uid()));
create policy "Owner can update" on forum.group_members
  for update using (
    (select owner_anon_id from forum.groups g where g.id=group_id) =
    (select id from forum.anonymous_profiles where user_id=auth.uid())
  );
create policy "Self can leave group" on forum.group_members
  for delete using (anon_profile_id = (select id from forum.anonymous_profiles where user_id=auth.uid()));

-- CATEGORIAS & TAGS - Leitura pública, inserção apenas por authenticated users
alter table forum.categories enable row level security;
create policy "Categories read all" on forum.categories for select using (true);
create policy "Categories insert authenticated" on forum.categories
  for insert with check (auth.role() = 'authenticated');

alter table forum.tags enable row level security;
create policy "Tags read all" on forum.tags for select using (true);
create policy "Tags insert authenticated" on forum.tags
  for insert with check (auth.role() = 'authenticated');

-- POST_TAGS
alter table forum.post_tags enable row level security;
create policy "Post tags read all" on forum.post_tags for select using (true);
create policy "Post tags insert by post author" on forum.post_tags
  for insert with check (
    exists(
      select 1 from forum.posts p
      where p.id = post_id and p.author_anon_id = (select id from forum.anonymous_profiles where user_id=auth.uid())
    )
  );
create policy "Post tags delete by post author" on forum.post_tags
  for delete using (
    exists(
      select 1 from forum.posts p
      where p.id = post_id and p.author_anon_id = (select id from forum.anonymous_profiles where user_id=auth.uid())
    )
  );

-- MODERATION LOG
alter table forum.moderation_log enable row level security;
create policy "Moderation log read by reviewer" on forum.moderation_log
  for select using (reviewer_anon_id = (select id from forum.anonymous_profiles where user_id=auth.uid()));
create policy "Moderation log insert by authenticated" on forum.moderation_log
  for insert with check (auth.role() = 'authenticated'); 