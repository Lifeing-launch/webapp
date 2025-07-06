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
}

const AnonymousProfileContext = createContext<
  AnonymousProfileContextType | undefined
>(undefined);

/**
 * Provider para gerenciar o perfil anônimo do usuário
 * Agora usa React Query para gerenciar cache e estado
 */
export const AnonymousProfileProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const queryClient = useQueryClient();

  // Query para o usuário autenticado
  const {
    data: user,
    isLoading: userLoading,
    error: userError,
  } = useQuery({
    queryKey: ["auth-user"],
    queryFn: async () => {
      const { data } = await forumClient.auth.getUser();
      return data.user;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchInterval: 10 * 60 * 1000, // Verificar a cada 10 minutos
  });

  // Query para o perfil anônimo
  const {
    data: profile,
    isLoading: profileLoading,
    error: profileError,
    refetch: refetchProfile,
  } = useQuery({
    queryKey: ["anonymous-profile", user?.id],
    queryFn: async () => {
      if (!user) return null;

      try {
        const fetchedProfile = await profileService.getCurrentProfile();

        // Atualizar localStorage com o perfil
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
        // Se retornar 406 (não encontrado), retornar null sem erro
        if (error instanceof Error && error.message.includes("406")) {
          localStorage.removeItem(ANONYMOUS_PROFILE_STORAGE_KEY);
          return null;
        }
        throw error;
      }
    },
    enabled: !!user && !userLoading,
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: (failureCount, error) => {
      // Não fazer retry se for erro 406 (perfil não encontrado)
      if (error instanceof Error && error.message.includes("406")) {
        return false;
      }
      return failureCount < 2;
    },
    // Não usar initialData ou placeholderData para forçar sempre verificar na base
    // quando não houver cache do React Query
  });

  // Mutation para criar perfil
  const createProfileMutation = useMutation({
    mutationFn: async (nickname: string) => {
      const newProfile = await profileService.createProfile(nickname);
      return newProfile;
    },
    onSuccess: (newProfile) => {
      // Atualizar cache do React Query
      queryClient.setQueryData(["anonymous-profile", user?.id], newProfile);

      // Atualizar localStorage
      localStorage.setItem(
        ANONYMOUS_PROFILE_STORAGE_KEY,
        JSON.stringify(newProfile)
      );
    },
    onError: (error) => {
      console.error("Failed to create profile:", error);
    },
  });

  // Mutation para atualizar perfil
  const updateProfileMutation = useMutation({
    mutationFn: async (nickname: string) => {
      const updatedProfile = await profileService.updateProfile(nickname);
      return updatedProfile;
    },
    onSuccess: (updatedProfile) => {
      // Atualizar cache do React Query
      queryClient.setQueryData(["anonymous-profile", user?.id], updatedProfile);

      // Atualizar localStorage
      localStorage.setItem(
        ANONYMOUS_PROFILE_STORAGE_KEY,
        JSON.stringify(updatedProfile)
      );
    },
    onError: (error) => {
      console.error("Failed to update profile:", error);
    },
  });

  // Effect para monitorar mudanças de autenticação
  useEffect(() => {
    const {
      data: { subscription },
    } = forumClient.auth.onAuthStateChange(async (event) => {
      // Invalidar query do usuário quando auth state mudar
      queryClient.invalidateQueries({ queryKey: ["auth-user"] });

      if (event === "SIGNED_OUT") {
        // Limpar localStorage quando usuário deslogar
        localStorage.removeItem(ANONYMOUS_PROFILE_STORAGE_KEY);
        // Limpar cache do perfil
        queryClient.setQueryData(["anonymous-profile"], null);
      }
    });

    return () => subscription.unsubscribe();
  }, [queryClient]);

  /**
   * Funções wrapper para manter compatibilidade com a API anterior
   */
  const createProfile = async (nickname: string): Promise<AnonymousProfile> => {
    return createProfileMutation.mutateAsync(nickname);
  };

  const updateProfile = async (nickname: string): Promise<AnonymousProfile> => {
    return updateProfileMutation.mutateAsync(nickname);
  };

  const isNicknameAvailable = async (nickname: string): Promise<boolean> => {
    return profileService.isNicknameAvailable(nickname);
  };

  const refreshProfile = async (): Promise<void> => {
    await refetchProfile();
  };

  // Estados combinados
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
    user: user ?? null,
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

  // Só considera que precisa de setup se não estiver loading e tiver user mas não tiver profile
  const needsSetup = !loading && !!user && !profile;
  const isReady = !loading && !!profile;

  return {
    needsSetup,
    isReady,
    loading,
  };
};
