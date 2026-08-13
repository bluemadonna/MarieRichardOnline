-- ===================================================
-- supabase_setup.sql
-- Выполнить целиком в Supabase → SQL Editor → New query
-- ===================================================

-- Таблица голосов в опросах
create table poll_votes (
  id bigint generated always as identity primary key,
  poll_id text not null,
  option_label text not null,
  created_at timestamptz not null default now()
);

-- Таблица записей гостевой книги
create table guestbook_entries (
  id bigint generated always as identity primary key,
  name text,
  message text not null,
  created_at timestamptz not null default now()
);

-- Включаем Row Level Security (без неё таблицы вообще
-- недоступны через публичный API — это обязательный шаг)
alter table poll_votes enable row level security;
alter table guestbook_entries enable row level security;

-- Разрешаем всем читать и добавлять записи...
create policy "Публичное чтение голосов" on poll_votes
  for select using (true);
create policy "Публичное добавление голосов" on poll_votes
  for insert with check (true);

create policy "Публичное чтение гостевой" on guestbook_entries
  for select using (true);
create policy "Публичное добавление в гостевую" on guestbook_entries
  for insert with check (true);

-- ...но НЕ разрешаем удаление/изменение с публичным ключом.
-- Значит удалить спам-записи можно только тебе — зайдя в
-- Supabase Dashboard → Table Editor под своим логином.
