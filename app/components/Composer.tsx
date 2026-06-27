"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function Composer({ userId }: { userId: string }) {
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);
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

      <div className="flex items-center justify-between mt-3">
        <label className="text-teal hover:text-coral cursor-pointer transition text-sm">
          📷 Catch
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            onChange={pickFile}
            className="hidden"
          />
        </label>
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