import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function NibbleBell() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { count } = await supabase
    .from("nibbles")
    .select("*", { count: "exact", head: true })
    .eq("recipient_id", user.id)
    .eq("read", false);

  return (
    <Link href="/nibbles" className="relative hover:text-coral transition" aria-label="Nibbles">
      <svg width="22" height="22" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M17 9a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12.7 22a2 2 0 01-3.4 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M17 7 Q21 4 25 7 Q21 10 17 7 Z" fill="#FF6B35"/>
        <path d="M25 7 L28 5 L28 9 Z" fill="#FF6B35" transform="translate(-3,0)"/>
      </svg>
      {count ? (
        <span className="absolute -top-1.5 -right-1.5 bg-coral text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center">
          {count > 9 ? "9+" : count}
        </span>
      ) : null}
    </Link>
  );
}