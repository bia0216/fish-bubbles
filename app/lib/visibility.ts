import { SupabaseClient } from "@supabase/supabase-js";

// Returns a Set of user IDs who are MUTUALS with the given user
// (they follow me AND I follow them)
export async function getMutualIds(
  supabase: SupabaseClient,
  userId: string
): Promise<Set<string>> {
  const [{ data: iFollow }, { data: followMe }] = await Promise.all([
    supabase.from("school").select("followed_id").eq("follower_id", userId),
    supabase.from("school").select("follower_id").eq("followed_id", userId),
  ]);

  const iFollowSet = new Set(iFollow?.map((r) => r.followed_id));
  const mutuals = new Set<string>();
  followMe?.forEach((r) => {
    if (iFollowSet.has(r.follower_id)) mutuals.add(r.follower_id);
  });
  return mutuals;
}

// Can the viewer see this bubble?
export function canSeeBubble(
  bubble: { audience?: string; author_id: string },
  viewerId: string,
  mutualIds: Set<string>
): boolean {
  if (bubble.audience !== "school") return true;      // public bubble
  if (bubble.author_id === viewerId) return true;     // your own
  return mutualIds.has(bubble.author_id);             // only mutuals
}