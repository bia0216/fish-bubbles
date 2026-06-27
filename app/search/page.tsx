import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Avatar from "../components/Avatar";
import BubbleActions from "../components/BubbleActions";
import { timeAgo } from "../lib/timeAgo";
import SearchBar from "../components/SearchBar";
import { getMutualIds, canSeeBubble } from "../lib/visibility";
export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q || "").trim();
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  let people: any[] = [];
  let bubbles: any[] = [];

  if (query) {
    const [{ data: p }, { data: b }] = await Promise.all([
      supabase
        .from("profiles")
        .select("*")
        .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
        .limit(10),
      supabase
        .from("bubbles")
        .select("*, author:profiles!bubbles_author_id_fkey(username, display_name, avatar_url)")
        .is("parent_id", null)
        .ilike("text", `%${query}%`)
        .order("created_at", { ascending: false })
        .limit(20),
    ]);
    people = p || [];
    bubbles = b || [];
  }

  const [{ data: stats }, { data: myFish }, { data: myRipples }] = await Promise.all([
    supabase.from("bubble_stats").select("*"),
    supabase.from("fish").select("bubble_id").eq("user_id", user.id),
    supabase.from("ripples").select("bubble_id").eq("user_id", user.id),
  ]);

  const statMap = new Map(stats?.map((s) => [s.bubble_id, s]));
  const likedSet = new Set(myFish?.map((f) => f.bubble_id));
  const rippledSet = new Set(myRipples?.map((r) => r.bubble_id));
  const mutualIds = await getMutualIds(supabase, user.id);
  const visibleSearchBubbles = bubbles.filter((b) => canSeeBubble(b, user.id, mutualIds));
  
  return (
    <main className="min-h-screen bg-aqua">
      <header className="bg-navy text-aqua sticky top-0 z-10">
        <div className="max-w-xl mx-auto flex items-center gap-3 px-4 py-3">
          <Link href="/" className="hover:text-coral transition shrink-0">←</Link>
          <SearchBar initial={query} />
        </div>
      </header>

      <div className="max-w-xl mx-auto px-4 py-4 flex flex-col gap-4">
        {!query && (
          <p className="text-center text-teal py-8">Search for fish or bubbles 🔎</p>
        )}

        {query && people.length > 0 && (
          <div className="bg-offwhite rounded-2xl p-4 border border-teal/20">
            <h2 className="text-navy font-semibold mb-2">Fish</h2>
            <div className="flex flex-col gap-2">
              {people.map((p) => (
                <Link
                  key={p.id}
                  href={`/u/${p.username}`}
                  className="flex items-center gap-2 hover:opacity-80 transition"
                >
                  <Avatar avatarUrl={p.avatar_url} size={36} />
                  <div className="flex flex-col">
                    <span className="font-medium text-navy leading-tight">{p.display_name || p.username}</span>
                    <span className="text-teal text-sm leading-tight">@{p.username}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {query && bubbles.length > 0 && (
          <div className="flex flex-col gap-3">
            <h2 className="text-navy font-semibold px-1">Bubbles</h2>
            {bubbles.map((b) => {
              const s = statMap.get(b.id);
              return (
                <article key={b.id} className="bg-offwhite rounded-2xl p-4 border border-teal/20">
                  <Link href={`/u/${b.author?.username}`} className="flex items-center gap-2 mb-2 hover:opacity-80 transition w-fit">
                    <Avatar avatarUrl={b.author?.avatar_url} size={40} />
                    <div className="flex flex-col">
                      <span className="font-medium text-navy leading-tight">{b.author?.display_name || "A fish"}</span>
                      <span className="text-teal text-sm leading-tight">@{b.author?.username} · {timeAgo(b.created_at)}</span>
                    </div>
                  </Link>
                  {b.text && <p className="text-navy whitespace-pre-wrap mb-2">{b.text}</p>}
                  {b.media_url && b.media_type === "image" && (
                    <img src={b.media_url} alt="" className="rounded-xl max-h-60 w-auto object-cover" />
                  )}
                  <BubbleActions
                    bubbleId={b.id}
                    fishCount={s?.fish_count || 0}
                    rippleCount={s?.ripple_count || 0}
                    replyCount={s?.reply_count || 0}
                    likedByMe={likedSet.has(b.id)}
                    rippledByMe={rippledSet.has(b.id)}
                  />
                </article>
              );
            })}
          </div>
        )}

        {query && people.length === 0 && bubbles.length === 0 && (
          <p className="text-center text-teal py-8">Nothing found for &quot;{query}&quot; 🐟</p>
        )}
      </div>
    </main>
  );
}