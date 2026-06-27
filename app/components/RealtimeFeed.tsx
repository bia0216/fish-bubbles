"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function RealtimeFeed() {
  const router = useRouter();
  const [newCount, setNewCount] = useState(0);
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase
      .channel("bubbles-feed")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "bubbles" },
        (payload) => {
          // Only count top-level PUBLIC bubbles (never alert for private ones)
          if (!payload.new.parent_id && payload.new.audience === "stream") {
            setNewCount((c) => c + 1);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  if (newCount === 0) return null;

  return (
    <button
      onClick={() => {
        setNewCount(0);
        router.refresh();
      }}
      className="sticky top-16 z-20 mx-auto bg-coral text-white rounded-full px-5 py-2 text-sm font-medium shadow-lg hover:opacity-90 transition flex items-center gap-2"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="11" cy="13" r="7" stroke="white" strokeWidth="2"/>
        <circle cx="18" cy="6" r="2.5" stroke="white" strokeWidth="2"/>
      </svg>
      {newCount} new {newCount === 1 ? "bubble" : "bubbles"} — tap to see
    </button>
  );
}