import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type Wish = { id: string; created_at: string; name: string; message: string; attending: boolean };
export type WishInput = { name: string; message: string; attending: boolean; guests?: number };

export type WishStore = {
  list(limit?: number): Promise<Wish[]>;
  submit(input: WishInput): Promise<Wish>;
  /** returns an unsubscribe function */
  subscribe(onInsert: (w: Wish) => void, onDelete: (id: string) => void): () => void;
};

export class WishError extends Error {
  constructor(public code: "too_many_requests" | "duplicate" | "invalid" | "network") {
    super(code);
  }
}

export const LIMITS = { name: 60, message: 300, guests: 10 } as const;

/* ---------- Supabase ---------- */
function supabaseStore(client: SupabaseClient): WishStore {
  return {
    async list(limit = 200) {
      const { data, error } = await client
        .from("wishes")
        .select("id, created_at, name, message, attending")
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw new WishError("network");
      return data as Wish[];
    },
    async submit({ name, message, attending, guests }) {
      const { data, error } = await client.rpc("submit_wish", {
        p_name: name,
        p_message: message,
        p_attending: attending,
        p_guests: attending ? guests ?? null : null,
      });
      if (error) {
        if (error.message.includes("too_many_requests")) throw new WishError("too_many_requests");
        if (error.message.includes("duplicate")) throw new WishError("duplicate");
        if (error.code === "23514") throw new WishError("invalid");
        throw new WishError("network");
      }
      return data as Wish;
    },
    subscribe(onInsert, onDelete) {
      const ch = client
        .channel("wishes-feed")
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "wishes" }, (p) => onInsert(p.new as Wish))
        .on("postgres_changes", { event: "DELETE", schema: "public", table: "wishes" }, (p) => onDelete((p.old as { id: string }).id))
        .subscribe();
      return () => { client.removeChannel(ch); };
    },
  };
}

/* ---------- Demo (no backend): example wishes kept in memory, nothing is saved ---------- */
function demoStore(): WishStore {
  const ago = (min: number) => new Date(Date.now() - min * 60_000).toISOString();
  let rows: Wish[] = [
    { id: "d1", created_at: ago(4), name: "Contoh: Rina", message: "Barakallahu lakuma wa baraka 'alaikuma wa jama'a bainakuma fi khair. Selamat ya!", attending: true },
    { id: "d2", created_at: ago(95), name: "Contoh: Pak Hendra & Keluarga", message: "Semoga menjadi keluarga yang sakinah, mawaddah, warahmah.", attending: true },
    { id: "d3", created_at: ago(60 * 26), name: "Contoh: Dimas", message: "Mohon maaf belum bisa hadir. Doa terbaik untuk kalian berdua!", attending: false },
  ];
  const subs = new Set<(w: Wish) => void>();
  return {
    async list() { return [...rows]; },
    async submit(input) {
      await new Promise((r) => setTimeout(r, 500));
      const w: Wish = { id: `d${Date.now()}`, created_at: new Date().toISOString(), name: input.name, message: input.message, attending: input.attending };
      rows = [w, ...rows];
      subs.forEach((fn) => fn(w));
      return w;
    },
    subscribe(onInsert) { subs.add(onInsert); return () => { subs.delete(onInsert); }; },
  };
}

let cached: WishStore | null | undefined;

/** The configured store, or null when Supabase env vars are missing (and demo mode is off). */
export function getWishStore(): WishStore | null {
  if (cached !== undefined) return cached;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (url && key) cached = supabaseStore(createClient(url, key, { auth: { persistSession: false } }));
  else if (process.env.NEXT_PUBLIC_WISHES_DEMO === "1") cached = demoStore();
  else cached = null;
  return cached;
}
