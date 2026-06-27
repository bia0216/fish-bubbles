"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function BackGuard() {
  const router = useRouter();

  useEffect(() => {
    window.history.pushState(null, "", window.location.href);

    const onPopState = () => {
      router.push("/");
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [router]);

  return null;
}