import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import Avatar from "../../components/Avatar";
import BubbleActions from "../../components/BubbleActions";
import { timeAgo } from "../../lib/timeAgo";
import { getMutualIds, canSeeBubble } from "../../lib/visibility";

export default async function BubblePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch the bubble that was opened
  const { data: opened } = await supabase
    .from("bubbles")
    .select("*, author:profiles!bubbles_author_id_fkey(username, display_name, avatar_url)")
    .eq("id", id)
    .maybeSingle();

  if (!opened) notFound();

  // Walk up to the root of the thread
  let bubble = opened;
  while (bubble.parent_id) {
    const { data: parent } = await supabase
      .from("bubbles")
      .select("*, author:profiles!bubbles_author_id_fkey(username, display_name, avatar_url)")
      .eq("id", bubble.parent_id)
      .maybeSingle();
    if (!parent) break;
    bubble = parent;
  }

  const mutualIds = await getMutualIds(supabase, user.id);
  if (!canSeeBubble(bubble, user.id, mutualIds)) notFound();

  // Gather ALL descendants of the root, however deep, starting from the root bubble
  const allReplies: any[] = [];
  let frontier = [bubble.id];

  while (frontier.length > 0) {
    const { data: level } = await supabase
      .from("bubbles")
      .select("*, author:profiles!bubbles_author_id_fkey(username, display_name, avatar_url)")
      .in("parent_id", frontier)
      .order("created_at", { ascending: true });

    if (!level || level.length === 0) break;
    allReplies.push(...level);
    frontier = level.map((r) => r.id);
  }

  // Map each bubble id → its author's username, to show "bubbling back to"
  const authorById = new Map<string, string>();
  authorById.set(bubble.id, bubble.author?.username);
  allReplies.forEach((r) => authorById.set(r.id, r.author?.username));

  const [{ data: stats }, { data: myFish }, { data: myRipples }] = await Promise.all([
    supabase.from("bubble_stats").select("*"),
    supabase.from("fish").select("bubble_id").eq("user_id", user.id),
    supabase.from("ripples").select("bubble_id").eq("user_id", user.id),
  ]);

  const statMap = new Map(stats?.map((s) => [s.bubble_id, s]));
  const likedSet = new Set(myFish?.map((f) => f.bubble_id));
  const rippledSet = new Set(myRipples?.map((r) => r.bubble_id));

  const renderBubble = (b: any, isMain: boolean, replyingTo?: string | null) => {
    const s = statMap.get(b.id);
    return (
      <article
        key={b.id}
        className={`bg-offwhite rounded-2xl p-4 border ${isMain ? "border-coral/30" : "border-teal/20"}`}
      >
        {replyingTo && (
          <p className="text-teal text-xs mb-1">↳ bubbling back to @{replyingTo}</p>
        )}
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
  };

  return (
    <main className="min-h-screen bg-aqua">
      <header className="bg-navy text-aqua sticky top-0 z-10">
        <div className="max-w-xl mx-auto flex items-center gap-4 px-4 py-3">
          <Link href="/" className="hover:text-coral transition">←</Link>
          <span className="font-semibold">Bubble</span>
        </div>
      </header>

      <div className="max-w-xl mx-auto px-4 py-4 flex flex-col gap-3">
        {renderBubble(bubble, true)}

        {allReplies.length > 0 ? (
          <div className="flex flex-col gap-3 pl-3 border-l-2 border-teal/20">
            {allReplies.map((r) =>
              renderBubble(
                r,
                false,
                r.parent_id === bubble.id ? null : authorById.get(r.parent_id)
              )
            )}
          </div>
        ) : (
          <p className="text-center text-teal py-4 text-sm">No bubble-backs yet</p>
        )}
      </div>
    </main>
  );
}