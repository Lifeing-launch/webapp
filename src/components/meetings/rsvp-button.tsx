"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Clock } from "lucide-react";
import { createClient } from "@/utils/supabase/browser";

interface RsvpButtonProps {
  meetingId: string;
  hasRsvped?: boolean;
}

export default function RsvpButton({ meetingId, hasRsvped }: RsvpButtonProps) {
  const [isRsvped, setIsRsvped] = useState(hasRsvped);
  const [isLoading, setIsLoading] = useState(false);

  const handleRsvp = async () => {
    setIsLoading(true);
    const supabase = createClient();

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from("rsvps").insert({
        meeting_id: meetingId,
        user_id: user.id,
      });

      if (error) {
        throw new Error(error?.message);
      }

      setIsRsvped(true);
    } catch (err) {
      //  TODO: Integrate toast here
      console.error("Unexpected error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isRsvped) {
    return (
      <Button variant="secondary" className="flex-1" disabled>
        <Check /> RSVPed
      </Button>
    );
  }

  return (
    <Button
      variant="secondary"
      className="flex-1"
      onClick={handleRsvp}
      disabled={isLoading}
    >
      <Clock /> {isLoading ? "RSVPing..." : "RSVP"}
    </Button>
  );
}
