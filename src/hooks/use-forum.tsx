"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { groupService, profileService, messageService } from "@/services/forum";
import { getQueryClient } from "@/components/providers/query-provider";

/**
 * Hook to fetch all pending join requests for groups owned by current user
 */
export function usePendingJoinRequests() {
  return useQuery({
    queryKey: ["pending-join-requests"],
    queryFn: async () => {
      return await groupService.getAllPendingJoinRequests();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes to keep data fresh
  });
}

/**
 * Hook to manage group member operations with proper cache invalidation
 */
export function useGroupMemberActions() {
  const queryClient = getQueryClient();

  const approveGroupMember = async (groupId: string, memberId: string) => {
    await groupService.approveGroupMember(groupId, memberId);

    // Invalidate cache to refresh data
    queryClient.invalidateQueries({
      queryKey: ["pending-join-requests"],
    });

    // Also invalidate groups cache if needed
    queryClient.invalidateQueries({
      queryKey: ["groups"],
    });
  };

  const removeGroupMember = async (groupId: string, memberId: string) => {
    await groupService.removeGroupMember(groupId, memberId);

    // Invalidate cache to refresh data
    queryClient.invalidateQueries({
      queryKey: ["pending-join-requests"],
    });

    // Also invalidate groups cache if needed
    queryClient.invalidateQueries({
      queryKey: ["groups"],
    });
  };

  return {
    approveGroupMember,
    removeGroupMember,
  };
}

/**
 * Hook for direct messages functionality
 */
export function useDirectMessages() {
  const queryClient = useQueryClient();
  const [selectedContactId, setSelectedContactId] = React.useState<
    string | null
  >(null);

  // Fetch contacts (users with message history)
  const contacts = useQuery({
    queryKey: ["dm-contacts"],
    queryFn: () => messageService.getContacts(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch messages for selected contact
  const messages = useQuery({
    queryKey: ["dm-messages", selectedContactId],
    queryFn: () =>
      selectedContactId ? messageService.getMessages(selectedContactId) : [],
    enabled: !!selectedContactId,
    staleTime: 30 * 1000, // 30 seconds
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: (data: { receiverProfileId: string; content: string }) =>
      messageService.sendMessage(data),
    onSuccess: () => {
      // Invalidate and refetch messages
      queryClient.invalidateQueries({ queryKey: ["dm-messages"] });
      queryClient.invalidateQueries({ queryKey: ["dm-contacts"] });
    },
  });

  // Mark messages as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (senderProfileId: string) =>
      messageService.markMessagesAsRead(senderProfileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dm-contacts"] });
    },
  });

  // Get total unread count
  const totalUnreadCount = useQuery({
    queryKey: ["dm-total-unread"],
    queryFn: () => messageService.getTotalUnreadCount(),
    staleTime: 30 * 1000,
  });

  // Auto-refresh messages periodically for selected contact
  React.useEffect(() => {
    if (!selectedContactId) return;

    const interval = setInterval(() => {
      queryClient.invalidateQueries({
        queryKey: ["dm-messages", selectedContactId],
      });
      queryClient.invalidateQueries({
        queryKey: ["dm-contacts"],
      });
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, [selectedContactId, queryClient]);

  const handleContactSelect = (contactId: string) => {
    setSelectedContactId(contactId);
    // Mark messages from this contact as read
    markAsReadMutation.mutate(contactId);
  };

  const handleSendMessage = async (content: string) => {
    if (!selectedContactId || !content.trim()) return;

    try {
      await sendMessageMutation.mutateAsync({
        receiverProfileId: selectedContactId,
        content: content.trim(),
      });
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return {
    contacts: contacts.data || [],
    messages: messages.data || [],
    selectedContactId,
    isLoading: contacts.isLoading || messages.isLoading,
    isContactsLoading: contacts.isLoading,
    isMessagesLoading: messages.isLoading,
    isSending: sendMessageMutation.isPending,
    sendError: sendMessageMutation.error,
    totalUnreadCount: totalUnreadCount.data || 0,
    handleContactSelect,
    handleSendMessage,
  };
}

/**
 * Hook to search and find anonymous profiles for starting new conversations
 */
export function useAnonymousProfiles(searchQuery?: string) {
  return useQuery({
    queryKey: ["anonymous-profiles", searchQuery],
    queryFn: () => profileService.searchProfiles(searchQuery || ""),
    enabled: !!searchQuery && searchQuery.length >= 2,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to get unread count for a specific contact
 */
export function useUnreadCount(senderProfileId?: string) {
  return useQuery({
    queryKey: ["dm-unread-count", senderProfileId],
    queryFn: () =>
      senderProfileId ? messageService.getUnreadCount(senderProfileId) : 0,
    enabled: !!senderProfileId,
    staleTime: 30 * 1000,
  });
}
