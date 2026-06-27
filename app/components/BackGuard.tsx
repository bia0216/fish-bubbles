"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function BackGuard() {
  const router = useRouter();

  useEffect(() => {
    // Add a history entry so hardware/gesture back has somewhere to land
    window.history.pushState(null, "", window.location.href);

    const onPopState = () => {
      router.push("/");
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [router]);

  return null;
}