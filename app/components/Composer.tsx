"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function Composer({ userId }: { userId: string }) {
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);
  const [audience, setAudience] = useState<"stream" | "school">("stream");
  const fileInput = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const supabase = createClient();

  function pickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
    }
  }

  async function postBubble() {
    if (!text.trim() && !file) return;
    setPosting(true);

    let media_url: string | null = null;
    let media_type: string | null = null;

    if (file) {
      const ext = file.name.split(".").pop();
      const path = `${userId}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("media")
        .upload(path, file);

      if (upErr) {
        alert("Upload failed: " + upErr.message);
        setPosting(false);
        return;
      }

      const { data } = supabase.storage.from("media").getPublicUrl(path);
      media_url = data.publicUrl;
      media_type = file.type.startsWith("video") ? "video" : "image";
    }

    const { error } = await supabase.from("bubbles").insert({
      author_id: userId,
      text: text.trim() || null,
      media_url,
      media_type,
      audience,
    });

    setPosting(false);

    if (error) {
      alert("Post failed: " + error.message);
      return;
    }

    setText("");
    setFile(null);
    setPreview(null);
    if (fileInput.current) fileInput.current.value = "";
    router.refresh();
  }

  return (
    <div className="bg-offwhite rounded-2xl p-4 border border-teal/20">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Blow a bubble..."
        rows={3}
        className="w-full resize-none outline-none bg-transparent text-navy placeholder:text-teal"
      />

      {preview && (
        <div className="relative mt-2">
          <img src={preview} alt="preview" className="rounded-xl max-h-64 w-auto" />
          <button
            onClick={() => { setFile(null); setPreview(null); if (fileInput.current) fileInput.current.value = ""; }}
            className="absolute top-2 right-2 bg-navy/70 text-white rounded-full w-7 h-7"
          >
            ✕
          </button>
        </div>
      )}

      <div className="flex items-center justify-between mt-3 gap-2">
        <div className="flex items-center gap-3">
          <label className="text-teal hover:text-coral cursor-pointer transition text-sm whitespace-nowrap flex items-center gap-1">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="2"/>
              <circle cx="8.5" cy="9" r="2" stroke="currentColor" strokeWidth="2"/>
              <path d="M5 17l4-4 3 3 3-4 4 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Catch
            <input
              ref={fileInput}
              type="file"
              accept="image/*"
              onChange={pickFile}
              className="hidden"
            />
          </label>

          <button
            type="button"
            onClick={() => setAudience(audience === "stream" ? "school" : "stream")}
            className="text-xs rounded-full border border-teal/40 px-3 py-1 text-teal hover:border-coral hover:text-coral transition whitespace-nowrap flex items-center gap-1.5"
          >
            {audience === "stream" ? (
              <>
                <svg width="16" height="11" viewBox="0 0 120 70" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 22 Q60 -2 110 22" fill="none" stroke="currentColor" strokeWidth="9" strokeLinecap="round"/>
                  <path d="M18 38 Q60 16 102 38" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" opacity="0.7"/>
                  <path d="M26 54 Q60 36 94 54" fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="round" opacity="0.45"/>
                </svg>
                The Stream
              </>
            ) : (
              <>
                <svg width="16" height="11" viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg">
                  <path d="M40 65 Q90 25 135 65 Q90 105 40 65 Z" fill="none" stroke="currentColor" strokeWidth="13" strokeLinejoin="round" strokeLinecap="round"/>
                  <path d="M135 65 L175 40 L175 90 Z" fill="none" stroke="currentColor" strokeWidth="13" strokeLinejoin="round" strokeLinecap="round"/>
                  <circle cx="68" cy="56" r="7" fill="currentColor"/>
                </svg>
                My School
              </>
            )}
          </button>
        </div>


        <button
          onClick={postBubble}
          disabled={posting || (!text.trim() && !file)}
          className="bg-coral text-white rounded-full px-6 py-2 font-medium hover:opacity-90 disabled:opacity-40 transition flex items-center gap-2"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="11" cy="13" r="7" stroke="white" strokeWidth="2"/>
            <circle cx="18" cy="6" r="2.5" stroke="white" strokeWidth="2"/>
            <circle cx="8.5" cy="10.5" r="2" fill="white" opacity="0.6"/>
          </svg>
          {posting ? "Bubbling..." : "Bubble"}
        </button>
      </div>
    </div>
  );
}