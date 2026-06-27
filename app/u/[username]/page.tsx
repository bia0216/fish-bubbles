import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import FollowButton from "../../components/FollowButton";
import BubbleActions from "../../components/BubbleActions";
import Avatar from "../../components/Avatar";
import { timeAgo } from "../../lib/timeAgo";
import { getMutualIds, canSeeBubble } from "../../lib/visibility";
import BackGuard from "../../components/BackGuard"; // u/[username], bubble/[id]

export default async function ProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { username } = await params;
  const { tab } = await searchParams;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .maybeSingle();

  if (!profile) notFound();

  const activeTab = tab === "fished" || tab === "rippled" ? tab : "bubbles";

  const [{ count: followers }, { count: followingCount }] = await Promise.all([
    supabase.from("school").select("*", { count: "exact", head: true }).eq("followed_id", profile.id),
    supabase.from("school").select("*", { count: "exact", head: true }).eq("follower_id", profile.id),
  ]);

  const { data: amIFollowing } = await supabase
    .from("school")
    .select("followed_id")
    .eq("follower_id", user.id)
    .eq("followed_id", profile.id)
    .maybeSingle();

  // Fetch bubbles based on the active tab
  let bubbles: any[] = [];

  if (activeTab === "bubbles") {
    const { data } = await supabase
      .from("bubbles")
      .select("*, author:profiles!bubbles_author_id_fkey(username, display_name, avatar_url)")
      .eq("author_id", profile.id)
      .is("parent_id", null)
      .order("created_at", { ascending: false });
    bubbles = data || [];
  } else {
    const table = activeTab === "fished" ? "fish" : "ripples";
    const { data: refs } = await supabase
      .from(table)
      .select("bubble_id")
      .eq("user_id", profile.id);

    const ids = refs?.map((r) => r.bubble_id) || [];
    if (ids.length > 0) {
      const { data } = await supabase
        .from("bubbles")
        .select("*, author:profiles!bubbles_author_id_fkey(username, display_name, avatar_url)")
        .in("id", ids)
        .order("created_at", { ascending: false });
      bubbles = data || [];
    }
  }

  // Stats and my interactions (for the action bar state)
  const [{ data: stats }, { data: myFish }, { data: myRipples }] = await Promise.all([
    supabase.from("bubble_stats").select("*"),
    supabase.from("fish").select("bubble_id").eq("user_id", user.id),
    supabase.from("ripples").select("bubble_id").eq("user_id", user.id),
  ]);

  const statMap = new Map(stats?.map((s) => [s.bubble_id, s]));
  const likedSet = new Set(myFish?.map((f) => f.bubble_id));
  const rippledSet = new Set(myRipples?.map((r) => r.bubble_id));
  const mutualIds = await getMutualIds(supabase, user.id);
  const visibleProfileBubbles = bubbles.filter((b) => canSeeBubble(b, user.id, mutualIds));

  const isMe = user.id === profile.id;

  return (
    <main className="min-h-screen bg-aqua">
      <header className="bg-navy text-aqua sticky top-0 z-10">
        <div className="max-w-xl mx-auto flex items-center gap-4 px-4 py-3">
          <Link href="/" className="hover:text-coral transition">← Back to stream</Link>
        </div>
      </header>

      <div className="max-w-xl mx-auto px-4 py-4 flex flex-col gap-4">
        <div className="bg-navy rounded-2xl p-5 text-aqua">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <Avatar avatarUrl={profile.avatar_url} size={56} />
              <div className="min-w-0">
                <h1 className="text-xl font-semibold truncate">
                  {profile.display_name || profile.username}
                </h1>
                <p className="text-teal truncate">@{profile.username}</p>
              </div>
            </div>
            {!isMe ? (
              <FollowButton targetId={profile.id} initiallyFollowing={!!amIFollowing} />
            ) : (
              <Link href="/settings" className="shrink-0 rounded-full px-4 py-1.5 text-sm font-medium border border-teal text-aqua hover:border-coral hover:text-coral transition whitespace-nowrap">
                Edit fish
              </Link>
            )}
          </div>
          {profile.bio && <p className="mt-3 text-aqua/90">{profile.bio}</p>}
          <div className="flex gap-5 mt-4 text-sm">
            <span><strong>{followers || 0}</strong> <span className="text-teal">in school</span></span>
            <span><strong>{followingCount || 0}</strong> <span className="text-teal">schooling</span></span>
          </div>
        </div>

        <div className="flex gap-1 bg-offwhite rounded-full p-1 border border-teal/20 w-fit">
          <Link
            href={`/u/${username}`}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
              activeTab === "bubbles" ? "bg-coral text-white" : "text-teal hover:text-coral"
            }`}
          >
            Bubbles
          </Link>
          <Link
            href={`/u/${username}?tab=fished`}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
              activeTab === "fished" ? "bg-coral text-white" : "text-teal hover:text-coral"
            }`}
          >
            Fished
          </Link>
          <Link
            href={`/u/${username}?tab=rippled`}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
              activeTab === "rippled" ? "bg-coral text-white" : "text-teal hover:text-coral"
            }`}
          >
            Rippled
          </Link>
        </div>

        <div className="flex flex-col gap-3">
          {visibleProfileBubbles.map((b) => {
            const s = statMap.get(b.id);
            return (
              <article key={b.id} className="bg-offwhite rounded-2xl p-4 border border-teal/20">
                <Link href={`/u/${b.author?.username}`} className="flex items-center gap-2 mb-2 hover:opacity-80 transition w-fit">
                  <Avatar avatarUrl={b.author?.avatar_url} size={40} />
                  <div className="flex flex-col">
                    <span className="font-medium text-navy leading-tight">{b.author?.display_name || "A fish"}</span>
                    <span className="text-teal text-sm leading-tight">
                      @{b.author?.username} · {timeAgo(b.created_at)}
                    </span>
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

          {visibleProfileBubbles.length === 0 && (
            <div className="flex flex-col items-center gap-3 py-10 text-teal">
              {activeTab === "rippled" ? (
                <svg width="40" height="24" viewBox="0 0 120 70" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 22 Q60 -2 110 22" fill="none" stroke="#7FA8B0" strokeWidth="9" strokeLinecap="round"/>
                  <path d="M18 38 Q60 16 102 38" fill="none" stroke="#7FA8B0" strokeWidth="8" strokeLinecap="round" opacity="0.7"/>
                  <path d="M26 54 Q60 36 94 54" fill="none" stroke="#7FA8B0" strokeWidth="7" strokeLinecap="round" opacity="0.45"/>
                </svg>
              ) : (
                <svg width="46" height="30" viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg">
                  <path d="M40 65 Q90 25 135 65 Q90 105 40 65 Z" fill="none" stroke="#7FA8B0" strokeWidth="11" strokeLinejoin="round" strokeLinecap="round"/>
                  <path d="M135 65 L175 40 L175 90 Z" fill="none" stroke="#7FA8B0" strokeWidth="11" strokeLinejoin="round" strokeLinecap="round"/>
                  <circle cx="68" cy="56" r="6" fill="#7FA8B0"/>
                </svg>
              )}
              <p className="text-center">
                {activeTab === "bubbles"
                  ? "No bubbles yet"
                  : activeTab === "fished"
                  ? "No fished bubbles yet"
                  : "No rippled bubbles yet"}
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}