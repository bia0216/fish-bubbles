import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import EditProfileForm from "../components/EditProfileForm";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <main className="min-h-screen bg-aqua">
      <header className="bg-navy text-aqua sticky top-0 z-10">
        <div className="max-w-xl mx-auto flex items-center gap-4 px-4 py-3">
          <Link href="/" className="hover:text-coral transition">← Back to stream</Link>
          <span className="font-semibold">Edit your fish</span>
        </div>
      </header>
      <div className="max-w-xl mx-auto px-4 py-6">
        <EditProfileForm
          userId={user.id}
          username={profile.username}
          displayName={profile.display_name || ""}
          bio={profile.bio || ""}
          avatarUrl={profile.avatar_url}
        />
      </div>
    </main>
  );
}