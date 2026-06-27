"use client";

import { useState, useTransition } from "react";
import { toggleFollow } from "../actions/interactions";

export default function FollowButton({
  targetId,
  initiallyFollowing,
}: {
  targetId: string;
  initiallyFollowing: boolean;
}) {
  const [following, setFollowing] = useState(initiallyFollowing);
  const [, startTransition] = useTransition();

  function handle() {
    setFollowing(!following);
    startTransition(() => { toggleFollow(targetId); });
  }

  return (
    <button
      onClick={handle}
      className={`rounded-full px-5 py-1.5 text-sm font-medium transition ${
        following
          ? "bg-transparent border border-teal text-teal hover:border-coral hover:text-coral"
          : "bg-coral text-white hover:opacity-90"
      }`}
    >
      {following ? "In your school" : "Join school"}
    </button>
  );
}