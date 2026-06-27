"use client";

import { useState } from "react";
import { signOut } from "../auth/actions";

export default function LogoutButton() {
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <span className="flex items-center gap-2 text-sm">
        <button
          onClick={() => signOut()}
          className="text-coral font-medium hover:underline whitespace-nowrap"
        >
          Swim away?
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-aqua/70 hover:text-aqua whitespace-nowrap"
        >
          Stay
        </button>
      </span>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      title="Swim away"
      aria-label="Swim away"
      className="group flex items-center gap-1.5 hover:text-coral transition"
    >
      <svg width="22" height="22" viewBox="0 0 28 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 12 Q15 5 21 12 Q15 19 9 12 Z" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round"/>
        <path d="M9 12 L4 8.5 L4 15.5 Z" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round"/>
        <circle cx="17" cy="10.5" r="1.3" fill="currentColor"/>
        <path d="M23 12 h4 M24 7.5 h3.5 M24 16.5 h3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.55"/>
      </svg>
      <span className="hidden group-hover:inline text-sm whitespace-nowrap">Swim away</span>
    </button>
  );
}