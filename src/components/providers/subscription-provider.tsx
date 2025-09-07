"use client";

import React, { createContext, useContext } from "react";
import { createClient } from "@/utils/supabase/browser";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useUser } from "./user-provider";
import { SubscriptionRecord } from "@/typing/supabase";
import { SubscriptionPlan } from "@/typing/strapi";

interface SubscriptionContextType {
  subscription: SubscriptionRecord | null;
  loading: boolean;
  error: string | null;
  plan: SubscriptionPlan | null;
  planLoading: boolean;
  planError: string | null;
  refetchSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(
  undefined
);

export const SubscriptionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const supabase = createClient();

  // Query for user subscription data
  const {
    data: subscription,
    isLoading: loading,
    error,
    refetch: refetchSubscription,
  } = useQuery({
    queryKey: ["user-subscription", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from("active_subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) {
        // If no subscription found, return null instead of throwing error
        if (error.code === "PGRST116") {
          return null;
        }
        throw new Error(error.message);
      }

      return data as SubscriptionRecord;
    },
    enabled: !!user?.id,
    staleTime: 10 * 60 * 1000, // 10 minutes - subscription data changes less frequently
    retry: (failureCount, error) => {
      // Don't retry if no subscription found
      if (error?.message?.includes("PGRST116")) {
        return false;
      }
      return failureCount < 2;
    },
  });

  const {
    data: plan,
    isLoading: planLoading,
    error: planError,
  } = useQuery({
    queryKey: ["subscription-plan", subscription?.plan_id],
    queryFn: async () => {
      if (!subscription?.plan_id) return null;

      const response = await fetch(
        `/api/payment/plans/${subscription.plan_id}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch plan");
      }

      const data: { data?: SubscriptionPlan[] } = await response.json();
      return data.data?.[0] || null;
    },
    enabled: !!subscription?.plan_id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Listen to user changes to refetch subscription
  React.useEffect(() => {
    if (user?.id) {
      queryClient.invalidateQueries({
        queryKey: ["user-subscription", user.id],
      });
    } else {
      // Clear subscription data when user logs out
      queryClient.setQueryData(["user-subscription"], null);
      queryClient.removeQueries({ queryKey: ["user-subscription"] });
    }
  }, [user?.id, queryClient]);

  const value: SubscriptionContextType = {
    subscription: subscription ?? null,
    loading,
    error: error?.message || null,
    plan: plan ?? null,
    planLoading,
    planError: planError?.message || null,
    refetchSubscription: async () => {
      await refetchSubscription();
    },
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = (): SubscriptionContextType => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error(
      "useSubscription must be used within a SubscriptionProvider"
    );
  }
  return context;
};
