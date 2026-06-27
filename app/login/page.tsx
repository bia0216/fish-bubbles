"use client";

import { useState } from "react";
import { signIn, signUp } from "../auth/actions";

export default function LoginPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setError(null);
    const action = mode === "signin" ? signIn : signUp;
    const result = await action(formData);
    if (result?.error) setError(result.error);
  }

  return (
    <main className="min-h-screen bg-aqua flex items-center justify-center p-4">
      <div className="bg-offwhite rounded-2xl shadow-sm w-full max-w-sm p-8">
        <div className="flex items-center justify-center gap-2 mb-6">
          <svg width="36" height="36" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 110 Q105 50 155 110 Q105 170 50 110 Z" fill="none" stroke="#FF6B35" strokeWidth="11" strokeLinejoin="round" strokeLinecap="round"/>
            <path d="M155 110 L200 78 L200 142 Z" fill="none" stroke="#FF6B35" strokeWidth="11" strokeLinejoin="round" strokeLinecap="round"/>
            <circle cx="82" cy="100" r="7" fill="#1B2A4A"/>
          </svg>
          <h1 className="text-navy text-2xl font-semibold">Fish Bubbles</h1>
        </div>

        <form action={handleSubmit} className="flex flex-col gap-3">
          {mode === "signup" && (
            <input
              name="username"
              placeholder="Username"
              required
              className="border border-teal/40 rounded-lg px-3 py-2 outline-none focus:border-coral"
            />
          )}
          <input
            name="email"
            type="email"
            placeholder="Email"
            required
            className="border border-teal/40 rounded-lg px-3 py-2 outline-none focus:border-coral"
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            required
            minLength={6}
            className="border border-teal/40 rounded-lg px-3 py-2 outline-none focus:border-coral"
          />

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            className="bg-coral text-white rounded-full py-2 font-medium hover:opacity-90 transition"
          >
            {mode === "signin" ? "Dive in" : "Join the school"}
          </button>
        </form>

        <button
          onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(null); }}
          className="text-teal text-sm mt-4 w-full text-center hover:text-coral transition"
        >
          {mode === "signin"
            ? "New here? Create an account"
            : "Already have an account? Sign in"}
        </button>
      </div>
    </main>
  );
}