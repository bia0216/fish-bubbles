"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SearchBar({ initial = "" }: { initial?: string }) {
  const [q, setQ] = useState(initial);
  const router = useRouter();

  function go() {
    if (q.trim()) router.push(`/search?q=${encodeURIComponent(q.trim())}`);
  }

  return (
    <input
      value={q}
      onChange={(e) => setQ(e.target.value)}
      onKeyDown={(e) => e.key === "Enter" && go()}
      placeholder="Search fish & bubbles..."
      className="w-full bg-aqua/90 text-navy rounded-full px-4 py-1.5 text-sm outline-none focus:bg-white transition placeholder:text-teal"
    />
  );
}