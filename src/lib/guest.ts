/** Guest name from `?to=` (first value, trimmed, max 80 chars). */
export const guestFrom = (to?: string | string[]) => (Array.isArray(to) ? to[0] : to)?.trim().slice(0, 80) || undefined;

export type GuestSearchParams = Promise<{ to?: string | string[] }>;
