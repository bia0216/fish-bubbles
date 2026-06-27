import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Avatar from "../components/Avatar";
import { timeAgo } from "../lib/timeAgo";

export default async function NibblesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: nibbles } = await supabase
    .from("nibbles")
    .select("*, actor:profiles!nibbles_actor_id_fkey(username, display_name, avatar_url)")
    .eq("recipient_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  // Mark them read on view
  await supabase
    .from("nibbles")
    .update({ read: true })
    .eq("recipient_id", user.id)
    .eq("read", false);

  const label = (type: string) => {
    if (type === "fish") return "fished your bubble";
    if (type === "ripple") return "rippled your bubble";
    return "bubbled back at you";
  };

  return (
    <main className="min-h-screen bg-aqua">
      <header className="bg-navy text-aqua sticky top-0 z-10">
        <div className="max-w-xl mx-auto flex items-center gap-4 px-4 py-3">
          <Link href="/" className="hover:text-coral transition">←</Link>
          <span className="font-semibold">Nibbles</span>
        </div>
      </header>

      <div className="max-w-xl mx-auto px-4 py-4 flex flex-col gap-2">
        {nibbles?.map((n) => (
          <Link
            key={n.id}
            href={n.bubble_id ? `/bubble/${n.bubble_id}` : `/u/${n.actor?.username}`}
            className={`flex items-center gap-3 rounded-2xl p-3 border transition hover:opacity-90 ${
              n.read ? "bg-offwhite border-teal/20" : "bg-white border-coral/40"
            }`}
          >
            <Avatar avatarUrl={n.actor?.avatar_url} size={40} />
            <div className="flex-1">
              <span className="text-navy">
                <strong>{n.actor?.display_name || n.actor?.username}</strong>{" "}
                {label(n.type)}
              </span>
              <div className="text-teal text-sm">{timeAgo(n.created_at)}</div>
            </div>
          </Link>
        ))}

        {nibbles?.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-10 text-teal">
            <svg width="46" height="30" viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg">
              <path d="M40 65 Q90 25 135 65 Q90 105 40 65 Z" fill="none" stroke="#7FA8B0" strokeWidth="11" strokeLinejoin="round" strokeLinecap="round"/>
              <path d="M135 65 L175 40 L175 90 Z" fill="none" stroke="#7FA8B0" strokeWidth="11" strokeLinejoin="round" strokeLinecap="round"/>
              <circle cx="68" cy="56" r="6" fill="#7FA8B0"/>
            </svg>
            <p className="text-center">No nibbles yet</p>
          </div>
        )}
      </div>
    </main>
  );
}