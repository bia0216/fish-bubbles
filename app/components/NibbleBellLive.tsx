"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function NibbleBellLive({
  userId,
  initialCount,
}: {
  userId: string;
  initialCount: number;
}) {
  const [count, setCount] = useState(initialCount);
  const supabase = createClient();

  // Keep in sync if the server count changes (e.g. after navigation)
  useEffect(() => {
    setCount(initialCount);
  }, [initialCount]);

  useEffect(() => {
    const channel = supabase
      .channel("nibbles-bell")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "nibbles",
          filter: `recipient_id=eq.${userId}`,
        },
        () => {
          setCount((c) => c + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, userId]);

  return (
    <Link href="/nibbles" className="relative hover:text-coral transition" aria-label="Nibbles">
      <svg width="22" height="22" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M17 9a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12.7 22a2 2 0 01-3.4 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M17 7 Q21 4 25 7 Q21 10 17 7 Z" fill="#FF6B35"/>
        <path d="M22 7 L25 5 L25 9 Z" fill="#FF6B35"/>
      </svg>
      {count > 0 && (
        <span className="absolute -top-1.5 -right-1.5 bg-coral text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  );
}