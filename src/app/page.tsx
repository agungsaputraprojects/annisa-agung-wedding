import { StoriesInvitation } from "@/invitation/StoriesInvitation";
import { fontVars } from "@/invitation/fonts";
import { guestFrom, type GuestSearchParams } from "@/lib/guest";

/** Guest name comes from the link: /?to=Bapak+Budi+dan+Keluarga */
export default async function Page({ searchParams }: { searchParams: GuestSearchParams }) {
  const { to } = await searchParams;
  return (
    <div className={fontVars}>
      <StoriesInvitation guest={guestFrom(to)} />
    </div>
  );
}
