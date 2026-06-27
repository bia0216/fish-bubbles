"use client";

import { useState, useTransition } from "react";
import { toggleFish, toggleRipple, postReply } from "../actions/interactions";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Reply = {
  id: string;
  text: string | null;
  author?: { username: string; display_name: string | null } | null;
};

type Props = {
  bubbleId: string;
  fishCount: number;
  rippleCount: number;
  replyCount: number;
  likedByMe: boolean;
  rippledByMe: boolean;
  replies?: Reply[];
};

function FishIcon({ active }: { active: boolean }) {
  const c = active ? "#FF6B35" : "currentColor";
  return (
    <svg width="20" height="20" viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg">
      <path d="M40 65 Q90 25 135 65 Q90 105 40 65 Z" fill="none" stroke={c} strokeWidth="11" strokeLinejoin="round" strokeLinecap="round"/>
      <path d="M135 65 L175 40 L175 90 Z" fill="none" stroke={c} strokeWidth="11" strokeLinejoin="round" strokeLinecap="round"/>
      <circle cx="68" cy="56" r="6" fill={c}/>
    </svg>
  );
}

function BubbleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="14" r="7" stroke="currentColor" strokeWidth="2"/>
      <circle cx="18.5" cy="5.5" r="2.5" stroke="currentColor" strokeWidth="2"/>
      <circle cx="7.5" cy="11" r="2" fill="currentColor" opacity="0.5"/>
    </svg>
  );
}
function RippleIcon({ active }: { active: boolean }) {
  const c = active ? "#FF6B35" : "currentColor";
  return (
    <svg width="20" height="20" viewBox="0 0 120 70" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 22 Q60 -2 110 22" fill="none" stroke={c} strokeWidth="9" strokeLinecap="round"/>
      <path d="M18 38 Q60 16 102 38" fill="none" stroke={c} strokeWidth="8" strokeLinecap="round" opacity="0.7"/>
      <path d="M26 54 Q60 36 94 54" fill="none" stroke={c} strokeWidth="7" strokeLinecap="round" opacity="0.45"/>
    </svg>
  );
}

const PREVIEW = 3;

export default function BubbleActions({
  bubbleId, fishCount, rippleCount, replyCount, likedByMe, rippledByMe, replies = [],
}: Props) {
  const [, startTransition] = useTransition();
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);

  async function sendReply() {
    if (!replyText.trim()) return;
    setSending(true);
    await postReply(bubbleId, replyText);
    setReplyText("");
    setSending(false);
    router.refresh();
  }

  const visibleReplies = showAll ? replies : replies.slice(0, PREVIEW);

  return (
    <div className="mt-3">
      <div className="flex items-center gap-6 text-sm text-teal">
        <button
          onClick={() => setExpanded(!expanded)}
          title="Bubble"
          className="group flex items-center gap-1.5 hover:text-coral transition"
        >
          <BubbleIcon />
          <span className="hidden group-hover:inline">Bubble</span>
          {replyCount > 0 && <span>{replyCount}</span>}
        </button>

        <button
          onClick={() => startTransition(() => { toggleRipple(bubbleId); })}
          title="Ripple"
          className={`group flex items-center gap-1.5 transition hover:text-coral ${rippledByMe ? "text-coral" : ""}`}
        >
          <RippleIcon active={rippledByMe} />
          <span className="hidden group-hover:inline">Ripple</span>
          {rippleCount > 0 && <span>{rippleCount}</span>}
        </button>

        <button
          onClick={() => startTransition(() => { toggleFish(bubbleId); })}
          title="Fish"
          className={`group flex items-center gap-1.5 transition hover:text-coral ${likedByMe ? "text-coral" : ""}`}
        >
          <FishIcon active={likedByMe} />
          <span className="hidden group-hover:inline">Fish</span>
          {fishCount > 0 && <span>{fishCount}</span>}
        </button>
      </div>

      {expanded && (
        <div className="mt-3">
          <div className="flex gap-2">
            <input
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Bubble back..."
              className="flex-1 border border-teal/40 rounded-full px-4 py-1.5 text-sm outline-none focus:border-coral text-navy"
              onKeyDown={(e) => e.key === "Enter" && sendReply()}
            />
            <button
              onClick={sendReply}
              disabled={sending || !replyText.trim()}
              className="bg-coral text-white rounded-full px-4 py-1.5 text-sm disabled:opacity-40"
            >
              {sending ? "..." : "Bubble back"}
            </button>
          </div>

          {replies.length > 0 && (
            <div className="mt-3 flex flex-col gap-2 border-l-2 border-teal/20 pl-3">
              {visibleReplies.map((r) => (
                <Link
                  key={r.id}
                  href={`/bubble/${bubbleId}`}
                  className="text-sm block hover:opacity-80 transition"
                >
                  <span className="font-medium text-navy">
                    {r.author?.display_name || "A fish"}
                  </span>{" "}
                  <span className="text-teal">@{r.author?.username}</span>
                  <p className="text-navy">{r.text}</p>
                </Link>
              ))}

              <Link
                href={`/bubble/${bubbleId}`}
                className="text-coral text-sm hover:underline mt-1"
              >
                Dive deeper →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}