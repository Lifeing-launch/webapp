"use client";

import React, { createContext, useContext, useEffect } from "react";
import { forumClient } from "@/utils/supabase/forum";
import { AnonymousProfile } from "@/typing/forum";
import { User } from "@supabase/supabase-js";
import { profileService } from "@/services/forum/profile-service";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const ANONYMOUS_PROFILE_STORAGE_KEY = "anonymous_profile";

interface AnonymousProfileContextType {
  profile: AnonymousProfile | null;
  loading: boolean;
  error: string | null;
  user: User | null;
  refreshProfile: () => Promise<void>;
  createProfile: (nickname: string) => Promise<AnonymousProfile>;
  updateProfile: (nickname: string) => Promise<AnonymousProfile>;
  isNicknameAvailable: (nickname: string) => Promise<boolean>;
  validateNickname: (nickname: string) => Promise<boolean>;
}

const AnonymousProfileContext = createContext<
  AnonymousProfileContextType | undefined
>(undefined);

export const AnonymousProfileProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const queryClient = useQueryClient();

  // Use cached user from ProfileService to avoid redundant auth calls
  const {
    data: userData,
    isLoading: userLoading,
    error: userError,
  } = useQuery({
    queryKey: ["cached-user"],
    queryFn: async () => {
      // This will use the cached user from ProfileService, reducing auth calls
      const cachedProfile = await profileService.getCurrentProfile();

      // If we have a profile, we definitely have a user
      if (cachedProfile) {
        // Get user from session (no network request) or cache
        const { data } = await forumClient.auth.getSession();
        return data.session?.user || null;
      }

      // Fallback: profile service will handle caching
      const { data } = await forumClient.auth.getSession();
      return data.session?.user || null;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes - shorter than ProfileService cache
    refetchInterval: 5 * 60 * 1000, // 5 minutes
  });

  // Use ProfileService cached method for profile
  const {
    data: profile,
    isLoading: profileLoading,
    error: profileError,
    refetch: refetchProfile,
  } = useQuery({
    queryKey: ["cached-anonymous-profile", userData?.id],
    queryFn: async () => {
      if (!userData) return null;

      try {
        // This will use ProfileService cache, avoiding redundant calls
        const fetchedProfile = await profileService.getCurrentProfile();

        if (fetchedProfile) {
          localStorage.setItem(
            ANONYMOUS_PROFILE_STORAGE_KEY,
            JSON.stringify(fetchedProfile)
          );
        } else {
          localStorage.removeItem(ANONYMOUS_PROFILE_STORAGE_KEY);
        }

        return fetchedProfile;
      } catch (error) {
        if (error instanceof Error && error.message.includes("406")) {
          localStorage.removeItem(ANONYMOUS_PROFILE_STORAGE_KEY);
          return null;
        }
        throw error;
      }
    },
    enabled: !!userData && !userLoading,
    staleTime: 2 * 60 * 1000, // 2 minutes - matches ProfileService cache frequency
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes("406")) {
        return false;
      }
      return failureCount < 2;
    },
  });

  const createProfileMutation = useMutation({
    mutationFn: async (nickname: string) => {
      // First, moderate the nickname
      const moderationResponse = await fetch("/api/moderate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resource_type: "nickname",
          content: nickname,
        }),
      });

      if (!moderationResponse.ok) {
        throw new Error("Failed to moderate nickname");
      }

      const moderationResult = await moderationResponse.json();

      if (!moderationResult.isValid) {
        const error = new Error("NICKNAME_REJECTED");
        error.name = "NicknameRejectedError";
        throw error;
      }

      // ProfileService will handle cache invalidation automatically
      const newProfile = await profileService.createProfile(nickname);
      return newProfile;
    },
    onSuccess: (newProfile) => {
      // Update React Query cache
      queryClient.setQueryData(
        ["cached-anonymous-profile", userData?.id],
        newProfile
      );

      localStorage.setItem(
        ANONYMOUS_PROFILE_STORAGE_KEY,
        JSON.stringify(newProfile)
      );
    },
    onError: (error) => {
      console.error("Failed to create profile:", error);
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (nickname: string) => {
      // First, moderate the nickname
      const moderationResponse = await fetch("/api/moderate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resource_type: "nickname",
          content: nickname,
        }),
      });

      if (!moderationResponse.ok) {
        throw new Error("Failed to moderate nickname");
      }

      const moderationResult = await moderationResponse.json();

      if (!moderationResult.isValid) {
        const error = new Error("NICKNAME_REJECTED");
        error.name = "NicknameRejectedError";
        throw error;
      }

      // ProfileService will handle cache invalidation automatically
      const updatedProfile = await profileService.updateProfile(nickname);
      return updatedProfile;
    },
    onSuccess: (updatedProfile) => {
      // Update React Query cache
      queryClient.setQueryData(
        ["cached-anonymous-profile", userData?.id],
        updatedProfile
      );

      localStorage.setItem(
        ANONYMOUS_PROFILE_STORAGE_KEY,
        JSON.stringify(updatedProfile)
      );
    },
    onError: (error) => {
      console.error("Failed to update profile:", error);
    },
  });

  useEffect(() => {
    const {
      data: { subscription },
    } = forumClient.auth.onAuthStateChange(async (event) => {
      // Invalidate both React Query and ProfileService caches
      queryClient.invalidateQueries({ queryKey: ["cached-user"] });
      queryClient.invalidateQueries({ queryKey: ["cached-anonymous-profile"] });

      // Clear ProfileService cache on auth state change
      profileService.clearAllCaches();

      if (event === "SIGNED_OUT") {
        localStorage.removeItem(ANONYMOUS_PROFILE_STORAGE_KEY);
        queryClient.setQueryData(["cached-anonymous-profile"], null);
        queryClient.setQueryData(["cached-user"], null);
      }
    });

    return () => subscription.unsubscribe();
  }, [queryClient]);

  const createProfile = async (nickname: string): Promise<AnonymousProfile> => {
    return createProfileMutation.mutateAsync(nickname);
  };

  const updateProfile = async (nickname: string): Promise<AnonymousProfile> => {
    return updateProfileMutation.mutateAsync(nickname);
  };

  const isNicknameAvailable = async (nickname: string): Promise<boolean> => {
    return profileService.isNicknameAvailable(nickname);
  };

  const validateNickname = async (nickname: string): Promise<boolean> => {
    try {
      const response = await fetch("/api/moderate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resource_type: "nickname",
          content: nickname,
        }),
      });

      if (!response.ok) {
        return false;
      }

      const result = await response.json();
      return result.isValid;
    } catch (error) {
      console.error("Failed to validate nickname:", error);
      return false;
    }
  };

  const refreshProfile = async (): Promise<void> => {
    // Clear ProfileService cache before refetching
    profileService.invalidateProfileCache();
    await refetchProfile();
  };

  const loading =
    userLoading ||
    profileLoading ||
    createProfileMutation.isPending ||
    updateProfileMutation.isPending;

  const error =
    userError?.message ||
    profileError?.message ||
    createProfileMutation.error?.message ||
    updateProfileMutation.error?.message ||
    null;

  const value: AnonymousProfileContextType = {
    profile: profile ?? null,
    loading,
    error,
    user: userData ?? null,
    refreshProfile,
    createProfile,
    updateProfile,
    isNicknameAvailable,
    validateNickname,
  };

  return (
    <AnonymousProfileContext.Provider value={value}>
      {children}
    </AnonymousProfileContext.Provider>
  );
};

export const useAnonymousProfile = (): AnonymousProfileContextType => {
  const context = useContext(AnonymousProfileContext);
  if (context === undefined) {
    throw new Error(
      "useAnonymousProfile must be used within an AnonymousProfileProvider"
    );
  }
  return context;
};

export const useProfileSetup = () => {
  const { profile, loading, user } = useAnonymousProfile();

  const needsSetup = !loading && !!user && !profile;
  const isReady = !loading && !!profile;

  return {
    needsSetup,
    isReady,
    loading,
  };
};
