import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Composer from "./components/Composer";
import LogoutButton from "./components/LogoutButton";
import BubbleActions from "./components/BubbleActions";
import Avatar from "./components/Avatar";
import { timeAgo } from "./lib/timeAgo";
import DeleteBubble from "./components/DeleteBubble";
import SearchBar from "./components/SearchBar";
import NibbleBell from "./components/NibbleBell";
import RealtimeFeed from "./components/RealtimeFeed";
import ProfileLink from "./components/ProfileLink";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ feed?: string }>;
}) {
  const { feed } = await searchParams;
  const schoolOnly = feed === "school";

  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [
    { data: bubbles },
    { data: stats },
    { data: myFish },
    { data: myRipples },
    { data: replies },
    { data: mySchool },
  ] = await Promise.all([
    supabase
      .from("bubbles")
      .select("*, author:profiles!bubbles_author_id_fkey(username, display_name, avatar_url)")
      .is("parent_id", null)
      .order("created_at", { ascending: false })
      .limit(50),
    supabase.from("bubble_stats").select("*"),
    supabase.from("fish").select("bubble_id").eq("user_id", user.id),
    supabase.from("ripples").select("bubble_id").eq("user_id", user.id),
    supabase
      .from("bubbles")
      .select("id, text, parent_id, created_at, author:profiles!bubbles_author_id_fkey(username, display_name)")
      .not("parent_id", "is", null)
      .order("created_at", { ascending: true }),
    supabase.from("school").select("followed_id").eq("follower_id", user.id),
  ]);

  const replyMap = new Map<string, any[]>();
  replies?.forEach((r) => {
    const list = replyMap.get(r.parent_id) || [];
    list.push(r);
    replyMap.set(r.parent_id, list);
  });

  const statMap = new Map(stats?.map((s) => [s.bubble_id, s]));
  const likedSet = new Set(myFish?.map((f) => f.bubble_id));
  const rippledSet = new Set(myRipples?.map((r) => r.bubble_id));

  const followedIds = new Set(mySchool?.map((s) => s.followed_id));

  // A school-only bubble is visible if you're the author or you follow the author
  const canSee = (b: any) =>
    b.audience !== "school" ||
    b.author_id === user.id ||
    followedIds.has(b.author_id);

  const visibleBubbles = (schoolOnly
    ? bubbles?.filter((b) => followedIds.has(b.author_id))
    : bubbles
  )?.filter(canSee);

  return (
    <main className="min-h-screen bg-aqua">
      <header className="bg-navy text-aqua sticky top-0 z-10">
        <div className="max-w-xl mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <svg width="28" height="28" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <path d="M50 110 Q105 50 155 110 Q105 170 50 110 Z" fill="none" stroke="#FF6B35" strokeWidth="11" strokeLinejoin="round" strokeLinecap="round"/>
              <path d="M155 110 L200 78 L200 142 Z" fill="none" stroke="#FF6B35" strokeWidth="11" strokeLinejoin="round" strokeLinecap="round"/>
              <circle cx="82" cy="100" r="7" fill="#d3edf0"/>
            </svg>
            <span className="font-semibold text-lg">Fish Bubbles</span>
          </div>
          <div className="flex items-center gap-3">
            <ProfileLink />
            <div className="hidden sm:block w-44">
              <SearchBar />
            </div>
            <Link href="/search" className="sm:hidden hover:text-coral transition" aria-label="Search">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2"/>
                <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </Link>
            <NibbleBell />
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="max-w-xl mx-auto px-4 pt-3">
        <div className="flex gap-1 bg-offwhite rounded-full p-1 border border-teal/20 w-fit">
          <Link
            href="/"
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
              !schoolOnly ? "bg-coral text-white" : "text-teal hover:text-coral"
            }`}
          >
            The Stream
          </Link>
          <Link
            href="/?feed=school"
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
              schoolOnly ? "bg-coral text-white" : "text-teal hover:text-coral"
            }`}
          >
            My School
          </Link>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 py-4 flex flex-col gap-4">
        <RealtimeFeed />
        <Composer userId={user.id} />

        <div className="flex flex-col gap-3">
          {visibleBubbles?.map((b) => {
            const s = statMap.get(b.id);
            return (
              <article key={b.id} className="bg-offwhite rounded-2xl p-4 border border-teal/20">
                <div className="flex items-start justify-between mb-2">
                  <Link href={`/u/${b.author?.username}`} className="flex items-center gap-2 hover:opacity-80 transition w-fit">
                    <Avatar avatarUrl={b.author?.avatar_url} size={40} />
                    <div className="flex flex-col">
                      <span className="font-medium text-navy leading-tight">
                        {b.audience === "school" && (
                  <span className="text-xs text-teal mb-1 flex items-center gap-1">
                    <svg width="14" height="9" viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg">
                      <path d="M40 65 Q90 25 135 65 Q90 105 40 65 Z" fill="none" stroke="currentColor" strokeWidth="13" strokeLinejoin="round" strokeLinecap="round"/>
                      <path d="M135 65 L175 40 L175 90 Z" fill="none" stroke="currentColor" strokeWidth="13" strokeLinejoin="round" strokeLinecap="round"/>
                      <circle cx="68" cy="56" r="7" fill="currentColor"/>
                    </svg>
                    My School only
                  </span>
                )}
                      </span>
                      <span className="text-teal text-sm leading-tight">
                        @{b.author?.username} · {timeAgo(b.created_at)}
                      </span>
                    </div>
                  </Link>
                  {b.author_id === user.id && <DeleteBubble bubbleId={b.id} />}
                </div>
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
                  replies={replyMap.get(b.id) || []}
                />
              </article>
            );
          })}

          {visibleBubbles?.length === 0 && (
            <div className="flex flex-col items-center gap-3 py-10 text-teal">
              <svg width="46" height="30" viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg">
                <path d="M40 65 Q90 25 135 65 Q90 105 40 65 Z" fill="none" stroke="#7FA8B0" strokeWidth="11" strokeLinejoin="round" strokeLinecap="round"/>
                <path d="M135 65 L175 40 L175 90 Z" fill="none" stroke="#7FA8B0" strokeWidth="11" strokeLinejoin="round" strokeLinecap="round"/>
                <circle cx="68" cy="56" r="6" fill="#7FA8B0"/>
              </svg>
              <p className="text-center">
                {schoolOnly
                  ? "Your school is quiet. Follow some fish to see their bubbles!"
                  : "No bubbles yet. Be the first to blow one!"}
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}