"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { forumClient } from "@/utils/supabase/forum";
import { AnonymousProfile } from "@/typing/forum";
import { User } from "@supabase/supabase-js";
import { profileService } from "@/services/forum/profile-service";

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
}

const AnonymousProfileContext = createContext<
  AnonymousProfileContextType | undefined
>(undefined);

/**
 * Provider para gerenciar o perfil anônimo do usuário
 * Agora usa ProfileService para operações de dados, mantendo apenas
 * o estado React e lifecycle aqui
 */
export const AnonymousProfileProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [profile, setProfile] = useState<AnonymousProfile | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }
    try {
      const item = window.localStorage.getItem(ANONYMOUS_PROFILE_STORAGE_KEY);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(
        "Error reading anonymous profile from local storage:",
        error
      );
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const supabase = forumClient;

  /**
   * Cria um novo perfil anônimo usando ProfileService
   */
  const createProfile = async (nickname: string): Promise<AnonymousProfile> => {
    setLoading(true);
    setError(null);

    try {
      const newProfile = await profileService.createProfile(nickname);
      setProfile(newProfile);
      window.localStorage.setItem(
        ANONYMOUS_PROFILE_STORAGE_KEY,
        JSON.stringify(newProfile)
      );
      return newProfile;
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create profile";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Atualiza o perfil anônimo usando ProfileService
   */
  const updateProfile = async (nickname: string): Promise<AnonymousProfile> => {
    setLoading(true);
    setError(null);

    try {
      const updatedProfile = await profileService.updateProfile(nickname);
      setProfile(updatedProfile);
      window.localStorage.setItem(
        ANONYMOUS_PROFILE_STORAGE_KEY,
        JSON.stringify(updatedProfile)
      );
      return updatedProfile;
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update profile";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Verifica se nickname está disponível usando ProfileService
   */
  const isNicknameAvailable = async (nickname: string): Promise<boolean> => {
    return profileService.isNicknameAvailable(nickname);
  };

  /**
   * Atualiza o perfil anônimo usando ProfileService
   */
  const refreshProfile = async (): Promise<void> => {
    if (!user) {
      setProfile(null);
      window.localStorage.removeItem(ANONYMOUS_PROFILE_STORAGE_KEY);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const fetchedProfile = await profileService.getCurrentProfile();
      setProfile(fetchedProfile);
      if (fetchedProfile) {
        window.localStorage.setItem(
          ANONYMOUS_PROFILE_STORAGE_KEY,
          JSON.stringify(fetchedProfile)
        );
      } else {
        window.localStorage.removeItem(ANONYMOUS_PROFILE_STORAGE_KEY);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to fetch profile");
      setProfile(null);
      window.localStorage.removeItem(ANONYMOUS_PROFILE_STORAGE_KEY);
    } finally {
      setLoading(false);
    }
  };

  // Effect para monitorar mudanças de autenticação
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Effect para buscar perfil quando usuário muda
  useEffect(() => {
    if (user) {
      refreshProfile();
    } else {
      setProfile(null);
      window.localStorage.removeItem(ANONYMOUS_PROFILE_STORAGE_KEY);
      setLoading(false);
    }
  }, [user]);

  const value: AnonymousProfileContextType = {
    profile,
    loading,
    error,
    user,
    refreshProfile,
    createProfile,
    updateProfile,
    isNicknameAvailable,
  };

  return (
    <AnonymousProfileContext.Provider value={value}>
      {children}
    </AnonymousProfileContext.Provider>
  );
};

/**
 * Hook to use the anonymous profile context
 */
export const useAnonymousProfile = (): AnonymousProfileContextType => {
  const context = useContext(AnonymousProfileContext);
  if (context === undefined) {
    throw new Error(
      "useAnonymousProfile must be used within an AnonymousProfileProvider"
    );
  }
  return context;
};

/**
 * Hook to check if the profile needs setup
 */
export const useProfileSetup = () => {
  const { profile, loading, user } = useAnonymousProfile();

  const needsSetup = !loading && user && !profile;
  const isReady = !loading && !!profile;

  return {
    needsSetup,
    isReady,
    loading,
  };
};
