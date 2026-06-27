import { createClient } from "@/lib/supabase/server";
import NibbleBellLive from "./NibbleBellLive";

export default async function NibbleBell() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { count } = await supabase
    .from("nibbles")
    .select("*", { count: "exact", head: true })
    .eq("recipient_id", user.id)
    .eq("read", false);

  return <NibbleBellLive userId={user.id} initialCount={count || 0} />;
}