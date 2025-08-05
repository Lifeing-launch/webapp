"use client";

import React, { createContext, useContext, useEffect } from "react";
import { createClient } from "@/utils/supabase/browser";
import { forumClient } from "@/utils/supabase/forum";
import { User, AuthChangeEvent } from "@supabase/supabase-js";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { UserProfile } from "@/typing/supabase";
import { AnonymousProfile } from "@/typing/forum";

interface UserContextType {
  user: User | null;
  profile: UserProfile | null;
  anonymousProfile: AnonymousProfile | null;
  currentDisplayName: string;
  loading: boolean;
  error: string | null;
  refetchUser: () => Promise<void>;
  refetchProfile: () => Promise<void>;
  refetchAnonymousProfile: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const queryClient = useQueryClient();
  const supabase = createClient();

  // Query for user authentication state
  const {
    data: user,
    isLoading: userLoading,
    error: userError,
    refetch: refetchUser,
  } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      // First try to get from session (no network request)
      const { data: sessionData } = await supabase.auth.getSession();

      if (sessionData.session?.user) {
        return sessionData.session.user;
      }

      // Fallback to getUser() if no session
      const { data: userData, error } = await supabase.auth.getUser();

      if (error) {
        throw new Error(error.message);
      }

      return userData.user;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry if it's an auth error
      if (
        error?.message?.includes("Invalid JWT") ||
        error?.message?.includes("JWT expired")
      ) {
        return false;
      }
      return failureCount < 2;
    },
  });

  // Query for user profile data
  const {
    data: profile,
    isLoading: profileLoading,
    error: profileError,
    refetch: refetchProfile,
  } = useQuery({
    queryKey: ["user-profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from("user_profiles")
        .select(
          "id, first_name, last_name, email, avatar_url, dashboard_cover_img"
        )
        .eq("id", user.id)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data as UserProfile;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Query for anonymous profile data
  const {
    data: anonymousProfile,
    isLoading: anonymousProfileLoading,
    error: anonymousProfileError,
    refetch: refetchAnonymousProfile,
  } = useQuery({
    queryKey: ["anonymous-profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await forumClient
        .from("anonymous_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        // Don't throw error if profile doesn't exist yet
        console.warn("Anonymous profile not found:", error);
        return null;
      }

      return data as AnonymousProfile;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry if profile doesn't exist
      if (error?.message?.includes("PGRST116")) {
        return false;
      }
      return failureCount < 2;
    },
  });

  // Listen to auth state changes
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent) => {
      if (event === "SIGNED_OUT") {
        // Clear all user-related queries
        queryClient.setQueryData(["user"], null);
        queryClient.setQueryData(["user-profile"], null);
        queryClient.setQueryData(["anonymous-profile"], null);
        queryClient.removeQueries({ queryKey: ["user"] });
        queryClient.removeQueries({ queryKey: ["user-profile"] });
        queryClient.removeQueries({ queryKey: ["anonymous-profile"] });
      } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        // Refetch user data on sign in or token refresh
        queryClient.invalidateQueries({ queryKey: ["user"] });
        queryClient.invalidateQueries({ queryKey: ["user-profile"] });
        queryClient.invalidateQueries({ queryKey: ["anonymous-profile"] });
      }
    });

    return () => subscription.unsubscribe();
  }, [queryClient, supabase]);

  const value: UserContextType = {
    user: user ?? null,
    profile: profile ?? null,
    anonymousProfile: anonymousProfile ?? null,
    currentDisplayName: anonymousProfile?.nickname || "",
    loading: userLoading || profileLoading || anonymousProfileLoading,
    error:
      userError?.message ||
      profileError?.message ||
      anonymousProfileError?.message ||
      null,
    refetchUser: async () => {
      await refetchUser();
    },
    refetchProfile: async () => {
      await refetchProfile();
    },
    refetchAnonymousProfile: async () => {
      await refetchAnonymousProfile();
    },
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
