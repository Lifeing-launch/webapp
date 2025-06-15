"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { toast } from "sonner";
import { Database } from "@/typing/supabase";
import { useRouter } from "next/navigation";

interface ICancelSubscription {
  currentSubscription: Database["public"]["Tables"]["subscriptions"]["Row"];
}

const CancelSubscription = ({ currentSubscription }: ICancelSubscription) => {
  const router = useRouter();
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const subscriptionId = currentSubscription.stripe_subscription_id;

  async function onConfirm() {
    setLoading(true);
    try {
      const res = await fetch("/api/payment/stripe/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptionId, reason }),
      });
      if (!res.ok) throw new Error();
      toast.info("Success. Your subscription will end at period end.");
      router.push("/subscriptions/manage");
    } catch {
      toast.error("An error occurred while canceling your subscription");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg flex flex-col gap-5">
      <section className="my-4">
        <h2 className="text-base mb-2 font-medium">
          We&apos;re sorry to see you go!
        </h2>
        <div className="text-muted-foreground text-xs">
          <p className="mb-5">
            Cancelling your subscription will result in loss of access to
            premium features at the end of your current billing cycle.
          </p>
          <p className="mb-5">
            This action will not delete your account, only end your current
            subscription. You can re-subscribe at any time.
          </p>
        </div>
      </section>
      <section>
        <Label htmlFor="reason" className="mb-3">
          Let us know why you&apos;re cancelling (Optional)
        </Label>
        <Textarea
          placeholder="Your feedback help us improve"
          id="reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </section>
      <section className="flex flex-col sm:flex-row justify-end gap-2">
        <Button variant={"ghost"}>
          <Link href="/subscription/manage"> Go back to my plans </Link>
        </Button>
        <Button variant="destructive" onClick={onConfirm}>
          {loading ? "Cancelling…" : "Confirm Cancellation"}
        </Button>
      </section>
    </div>
  );
};

export default CancelSubscription;
