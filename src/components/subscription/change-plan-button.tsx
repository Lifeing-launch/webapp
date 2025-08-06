"use client";

import React, { useState } from "react";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { useSubscription } from "@/components/providers/subscription-provider";

interface IChangePlanButton {
  currentSubscriptionId: string;
  priceId: string;
}

const ChangePlanButton = ({
  currentSubscriptionId,
  priceId,
}: IChangePlanButton) => {
  const [loading, setLoading] = useState(false);
  const { refetchSubscription } = useSubscription();

  async function handleChangePlan() {
    setLoading(true);
    try {
      const res = await fetch("/api/payment/stripe/change", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscriptionId: currentSubscriptionId,
          newPriceId: priceId,
        }),
      });
      if (!res.ok) throw new Error();
      await refetchSubscription();
      toast.info("Your plan has been changed successfully!");
    } catch {
      toast.error("An error occurred while changing your plan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button disabled={loading} onClick={handleChangePlan}>
      {loading ? "Changing Plan..." : "Change Plan"}
    </Button>
  );
};

export default ChangePlanButton;
