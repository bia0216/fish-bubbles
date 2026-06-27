import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Avatar from "./Avatar";

export default async function ProfileLink() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, avatar_url")
    .eq("id", user.id)
    .single();

  if (!profile) return null;

  return (
    <Link
      href={`/u/${profile.username}`}
      className="hover:opacity-80 transition shrink-0"
      aria-label="My profile"
      title="My profile"
    >
      <Avatar avatarUrl={profile.avatar_url} size={32} />
    </Link>
  );
}