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
    staleTime: 30 * 1000, // 30 seconds - shorter stale time to show new contacts/messages
    refetchInterval: 10 * 1000, // Refetch every 10 seconds to catch new conversations
  });

  // Fetch messages for selected contact
  const messages = useQuery({
    queryKey: ["dm-messages", selectedContactId],
    queryFn: () =>
      selectedContactId ? messageService.getMessages(selectedContactId) : [],
    enabled: !!selectedContactId,
    staleTime: 5 * 1000, // 5 seconds - shorter stale time for active chat
    refetchInterval: selectedContactId ? 3 * 1000 : false, // Refetch every 3 seconds when chat is open
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: (data: { receiverProfileId: string; content: string }) =>
      messageService.sendMessage(data),
    onSuccess: () => {
      // Invalidate and refetch messages
      queryClient.invalidateQueries({ queryKey: ["dm-messages"] });
      queryClient.invalidateQueries({ queryKey: ["dm-contacts"] });
      // Invalidate unread counts
      queryClient.invalidateQueries({ queryKey: ["dm-total-unread"] });
      queryClient.invalidateQueries({ queryKey: ["dm-unread-count"] });
    },
  });

  // Mark messages as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (senderProfileId: string) =>
      messageService.markMessagesAsRead(senderProfileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dm-contacts"] });
      // Invalidate unread counts
      queryClient.invalidateQueries({ queryKey: ["dm-total-unread"] });
      queryClient.invalidateQueries({ queryKey: ["dm-unread-count"] });
    },
  });

  // Get total unread count
  const totalUnreadCount = useQuery({
    queryKey: ["dm-total-unread"],
    queryFn: () => messageService.getTotalUnreadCount(),
    staleTime: 5 * 1000, // 5 seconds
    refetchInterval: 5 * 1000, // Refetch every 5 seconds for real-time unread count
  });

  // Mark messages as read periodically when viewing conversation
  React.useEffect(() => {
    if (!selectedContactId) return;

    const interval = setInterval(() => {
      // Mark messages as read when viewing conversation
      markAsReadMutation.mutate(selectedContactId);
    }, 5000); // Mark as read every 5 seconds

    return () => clearInterval(interval);
  }, [selectedContactId, markAsReadMutation]);

  const handleContactSelect = (contactId: string) => {
    setSelectedContactId(contactId);
    // Mark messages from this contact as read immediately
    if (contactId) {
      markAsReadMutation.mutate(contactId);
    }
  };

  // Mark messages as read when new messages arrive while viewing conversation
  React.useEffect(() => {
    if (!selectedContactId || !messages.data || messages.data.length === 0)
      return;

    // Mark as read when new messages arrive
    const timer = setTimeout(() => {
      markAsReadMutation.mutate(selectedContactId);
    }, 1000); // Small delay to ensure messages are loaded

    return () => clearTimeout(timer);
  }, [messages.data, selectedContactId, markAsReadMutation]);

  const handleClearSelection = () => {
    setSelectedContactId(null);
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
    handleClearSelection,
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
    staleTime: 5 * 1000, // 5 seconds
    refetchInterval: 5 * 1000, // Refetch every 5 seconds for real-time count
  });
}

/**
 * Hook to search for people and messages
 */
export function useSearch(searchQuery?: string) {
  const peopleQuery = useQuery({
    queryKey: ["search-people", searchQuery],
    queryFn: () => profileService.searchProfiles(searchQuery || ""),
    enabled: !!searchQuery && searchQuery.length >= 2,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const messagesQuery = useQuery({
    queryKey: ["search-messages", searchQuery],
    queryFn: () => messageService.searchMessages(searchQuery || ""),
    enabled: !!searchQuery && searchQuery.length >= 2,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  return {
    people: peopleQuery.data || [],
    messages: messagesQuery.data || [],
    isLoading: peopleQuery.isLoading || messagesQuery.isLoading,
    error: peopleQuery.error || messagesQuery.error,
  };
}
