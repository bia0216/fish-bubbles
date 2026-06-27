"use client";

import { useState, useTransition } from "react";
import { deleteBubble } from "../actions/interactions";

export default function DeleteBubble({ bubbleId }: { bubbleId: string }) {
  const [confirming, setConfirming] = useState(false);
  const [, startTransition] = useTransition();

  if (confirming) {
    return (
      <span className="flex items-center gap-2 text-sm">
        <button
          onClick={() => startTransition(() => { deleteBubble(bubbleId); })}
          className="text-coral font-medium hover:underline flex items-center gap-1"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="11" cy="13" r="6.5" stroke="currentColor" strokeWidth="2" strokeDasharray="3 2.5"/>
            <path d="M19 5l1.5-1.5M20 8l2-0.5M17 3l0.5-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Pop this bubble
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-teal hover:underline"
        >
          Cancel
        </button>
      </span>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      title="Pop this bubble"
      className="text-teal hover:text-coral transition"
      aria-label="Pop this bubble"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="11" cy="13" r="6.5" stroke="currentColor" strokeWidth="2" strokeDasharray="3 2.5"/>
        <path d="M19 5l1.5-1.5M20 8l2-0.5M17 3l0.5-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    </button>
  );
}