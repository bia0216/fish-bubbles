"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function notify(
  supabase: any,
  actorId: string,
  bubbleId: string,
  type: "fish" | "ripple" | "reply"
) {
  const { data: bubble } = await supabase
    .from("bubbles")
    .select("author_id")
    .eq("id", bubbleId)
    .single();

  if (bubble && bubble.author_id !== actorId) {
    await supabase.from("nibbles").insert({
      recipient_id: bubble.author_id,
      actor_id: actorId,
      type,
      bubble_id: bubbleId,
    });
  }
}

export async function toggleFish(bubbleId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not logged in" };

  const { data: existing } = await supabase
    .from("fish")
    .select("bubble_id")
    .eq("bubble_id", bubbleId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    await supabase.from("fish").delete()
      .eq("bubble_id", bubbleId).eq("user_id", user.id);
  } else {
    await supabase.from("fish").insert({ bubble_id: bubbleId, user_id: user.id });
    await notify(supabase, user.id, bubbleId, "fish");
  }

  revalidatePath("/");
  return { ok: true };
}

export async function toggleRipple(bubbleId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not logged in" };

  const { data: existing } = await supabase
    .from("ripples")
    .select("bubble_id")
    .eq("bubble_id", bubbleId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    await supabase.from("ripples").delete()
      .eq("bubble_id", bubbleId).eq("user_id", user.id);
  } else {
    await supabase.from("ripples").insert({ bubble_id: bubbleId, user_id: user.id });
    await notify(supabase, user.id, bubbleId, "ripple");
  }

  revalidatePath("/");
  return { ok: true };
}

export async function toggleFollow(targetId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not logged in" };
  if (user.id === targetId) return { error: "Can't follow yourself" };

  const { data: existing } = await supabase
    .from("school")
    .select("followed_id")
    .eq("follower_id", user.id)
    .eq("followed_id", targetId)
    .maybeSingle();

  if (existing) {
    await supabase.from("school").delete()
      .eq("follower_id", user.id).eq("followed_id", targetId);
  } else {
    await supabase.from("school").insert({ follower_id: user.id, followed_id: targetId });
  }

  revalidatePath("/");
  return { ok: true };
}

export async function postReply(parentId: string, text: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not logged in" };
  if (!text.trim()) return { error: "Empty reply" };

  const { error } = await supabase.from("bubbles").insert({
    author_id: user.id,
    text: text.trim(),
    parent_id: parentId,
  });

  if (error) return { error: error.message };
  await notify(supabase, user.id, parentId, "reply");
  revalidatePath("/");
  return { ok: true };
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not logged in" };

  const display_name = (formData.get("display_name") as string)?.trim();
  const bio = (formData.get("bio") as string)?.trim();
  const avatar_url = formData.get("avatar_url") as string;

  const updates: Record<string, string | null> = {
    display_name: display_name || null,
    bio: bio || null,
  };
  if (avatar_url) updates.avatar_url = avatar_url;

  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function deleteBubble(bubbleId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not logged in" };

  // RLS already ensures you can only delete your own, but we check too
  const { error } = await supabase
    .from("bubbles")
    .delete()
    .eq("id", bubbleId)
    .eq("author_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function markNibblesRead() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase
    .from("nibbles")
    .update({ read: true })
    .eq("recipient_id", user.id)
    .eq("read", false);
  revalidatePath("/", "layout");
}