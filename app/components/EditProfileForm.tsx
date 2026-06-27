"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { updateProfile } from "../actions/interactions";
import Avatar from "./Avatar";

export default function EditProfileForm({
  userId, username, displayName, bio, avatarUrl,
}: {
  userId: string;
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string | null;
}) {
  const [name, setName] = useState(displayName);
  const [bioText, setBioText] = useState(bio);
  const [currentAvatar, setCurrentAvatar] = useState(avatarUrl);
  const [uploadedUrl, setUploadedUrl] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const supabase = createClient();

  async function pickAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const ext = f.name.split(".").pop();
    const path = `${userId}/avatar-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("media").upload(path, f);
    if (error) { alert("Upload failed: " + error.message); return; }
    const { data } = supabase.storage.from("media").getPublicUrl(path);
    setUploadedUrl(data.publicUrl);
    setCurrentAvatar(data.publicUrl);
  }

  async function save() {
    setSaving(true);
    const fd = new FormData();
    fd.set("display_name", name);
    fd.set("bio", bioText);
    if (uploadedUrl) fd.set("avatar_url", uploadedUrl);
    const result = await updateProfile(fd);
    setSaving(false);
    if (result?.error) { alert(result.error); return; }
    setDone(true);
    router.refresh();
    setTimeout(() => router.push(`/u/${username}`), 600);
  }

  return (
    <div className="bg-offwhite rounded-2xl p-6 border border-teal/20 flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <Avatar avatarUrl={currentAvatar} size={72} />
        <label className="text-coral text-sm cursor-pointer hover:underline">
          Change picture
          <input ref={fileInput} type="file" accept="image/*" onChange={pickAvatar} className="hidden" />
        </label>
      </div>

      <div>
        <label className="text-navy text-sm font-medium">Display name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-teal/40 rounded-lg px-3 py-2 mt-1 outline-none focus:border-coral text-navy"
        />
      </div>

      <div>
        <label className="text-navy text-sm font-medium">Bio</label>
        <textarea
          value={bioText}
          onChange={(e) => setBioText(e.target.value)}
          rows={3}
          placeholder="Tell the school about yourself..."
          className="w-full border border-teal/40 rounded-lg px-3 py-2 mt-1 outline-none focus:border-coral text-navy resize-none"
        />
      </div>

      <button
        onClick={save}
        disabled={saving}
        className="bg-coral text-white rounded-full py-2 font-medium hover:opacity-90 disabled:opacity-40 transition flex items-center justify-center gap-2"
      >
        {saving ? (
          "Saving..."
        ) : done ? (
          <>
            Saved!
            <svg width="18" height="18" viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg">
              <path d="M40 65 Q90 25 135 65 Q90 105 40 65 Z" fill="none" stroke="white" strokeWidth="13" strokeLinejoin="round" strokeLinecap="round"/>
              <path d="M135 65 L175 40 L175 90 Z" fill="none" stroke="white" strokeWidth="13" strokeLinejoin="round" strokeLinecap="round"/>
              <circle cx="68" cy="56" r="7" fill="white"/>
            </svg>
          </>
        ) : (
          "Save changes"
        )}
      </button>
    </div>
  );
}