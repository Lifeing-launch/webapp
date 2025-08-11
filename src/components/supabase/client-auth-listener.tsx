"use client";

import { createClient } from "@/utils/supabase/browser";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ClientAuthListener() {
  const queryClient = useQueryClient();
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (["SIGNED_IN", "SIGNED_OUT"].includes(event)) {
        // Invalidate all queries to refresh data after auth state changes
        queryClient.invalidateQueries();

        if (event === "SIGNED_OUT") {
          window.location.reload();
        }
      }
    });

    return () => listener.subscription.unsubscribe();
  }, [queryClient, router]);

  return null;
}
