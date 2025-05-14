"use client";

import { createClient } from "@/utils/supabase/browser";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ClientAuthListener() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (["SIGNED_IN", "SIGNED_OUT"].includes(event)) {
        router.refresh();
      }
    });

    return () => listener.subscription.unsubscribe();
  }, [router]);

  return null;
}
