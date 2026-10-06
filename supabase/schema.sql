-- Ucapan & doa tamu untuk undangan Annisa & Agung.
-- Jalankan sekali di Supabase: Dashboard → SQL Editor → New query → tempel → Run.

create extension if not exists pgcrypto;

-- Ucapan yang tampil untuk semua tamu
create table if not exists public.wishes (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name       text not null check (char_length(btrim(name)) between 1 and 60),
  message    text not null check (char_length(btrim(message)) between 1 and 300),
  attending  boolean not null
);

-- Jumlah tamu: disimpan terpisah supaya TIDAK bisa dibaca tamu lain
create table if not exists public.wish_guests (
  wish_id uuid primary key references public.wishes(id) on delete cascade,
  guests  smallint not null check (guests between 1 and 10)
);

alter table public.wishes      enable row level security;
alter table public.wish_guests enable row level security;

-- Semua orang boleh MEMBACA ucapan. Tidak ada policy insert/update/delete:
-- tamu hanya bisa mengirim lewat fungsi submit_wish di bawah.
drop policy if exists "wishes are public" on public.wishes;
create policy "wishes are public" on public.wishes for select to anon, authenticated using (true);
-- wish_guests sengaja tanpa policy apa pun → tidak bisa dibaca/ditulis langsung dari browser.

create or replace function public.submit_wish(
  p_name text, p_message text, p_attending boolean, p_guests smallint default null
) returns public.wishes
language plpgsql security definer set search_path = public as $$
declare w public.wishes;
begin
  -- rem kasar terhadap spam: maksimal 30 ucapan per menit untuk seluruh undangan
  if (select count(*) from wishes where created_at > now() - interval '1 minute') >= 30 then
    raise exception 'too_many_requests';
  end if;
  -- tolak kiriman ganda (nama + pesan sama dalam 10 menit)
  if exists (select 1 from wishes where name = btrim(p_name) and message = btrim(p_message)
             and created_at > now() - interval '10 minutes') then
    raise exception 'duplicate';
  end if;

  insert into wishes (name, message, attending)
  values (btrim(p_name), btrim(p_message), p_attending)
  returning * into w;

  if p_attending and p_guests is not null then
    insert into wish_guests (wish_id, guests) values (w.id, p_guests);
  end if;
  return w;
end $$;

revoke all on function public.submit_wish(text, text, boolean, smallint) from public;
grant execute on function public.submit_wish(text, text, boolean, smallint) to anon, authenticated;

-- Supaya ucapan baru langsung muncul di HP tamu lain (realtime)
do $$ begin
  alter publication supabase_realtime add table public.wishes;
exception when duplicate_object then null; end $$;

-- ───────────────────────────────────────────────────────────────
-- Untuk Anda (jalankan di SQL Editor kapan saja, tidak terlihat oleh tamu):
--
-- Rekap kehadiran:
--   select w.created_at, w.name, w.attending, g.guests, w.message
--   from wishes w left join wish_guests g on g.wish_id = w.id
--   order by w.created_at desc;
--
-- Total tamu yang akan hadir:
--   select count(*) as konfirmasi, coalesce(sum(g.guests), 0) as total_orang
--   from wishes w join wish_guests g on g.wish_id = w.id where w.attending;
--
-- Hapus ucapan yang tidak pantas (atau lewat Table Editor → wishes → hapus baris):
--   delete from wishes where id = '...';
