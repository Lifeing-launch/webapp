"use client";

import * as React from "react";
import { Clock, Check, X as XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { GroupMemberWithDetails } from "@/typing/forum";
import { useGroupMemberActions } from "@/hooks/use-forum";
import { formatTimeAgo } from "@/utils/datetime";
import { getAvatarBackgroundStyle } from "@/utils/forum-avatar-colors";
import { useSectionColors } from "@/hooks/use-section-colors";

interface JoinRequestsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requests: GroupMemberWithDetails[];
  onRequestProcessed?: () => void;
}

/**
 * Individual join request item component
 */
function JoinRequestItem({
  request,
  onApprove,
  onReject,
  isLoading,
}: {
  request: GroupMemberWithDetails;
  onApprove: () => void;
  onReject: () => void;
  isLoading: boolean;
}) {
  const timeAgo = formatTimeAgo(request.created_at || new Date());

  // Generate initials from nickname
  const initials = request.profile.nickname
    .split(" ")
    .map((name) => name[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex-shrink-0 w-[280px] p-4 border border-gray-200 rounded-lg bg-white">
      <div className="flex items-start gap-3">
        {/* User Avatar */}
        <Avatar className="w-10 h-10 text-white flex-shrink-0">
          <AvatarFallback
            className="text-white font-semibold text-sm"
            style={getAvatarBackgroundStyle(request.anon_profile_id)}
          >
            {initials}
          </AvatarFallback>
        </Avatar>

        {/* Request Details */}
        <div className="flex-1 min-w-0">
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-sm">
              <span className="font-medium text-foreground truncate">
                @{request.profile.nickname}
              </span>
              <span className="text-muted-foreground text-xs">requested</span>
            </div>
            <div className="text-xs text-muted-foreground">
              to join{" "}
              <span className="font-medium text-foreground">
                &apos;{request.group.name}&apos;
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>{timeAgo}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 mt-3">
            <Button
              size="sm"
              variant="default"
              onClick={onApprove}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700 text-white h-7 px-3 text-xs"
            >
              <Check className="w-3 h-3 mr-1" />
              Approve
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={onReject}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700 text-white h-7 px-3 text-xs"
            >
              <XIcon className="w-3 h-3 mr-1" />
              Reject
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Modal for managing group join requests
 */
export function JoinRequestsModal({
  open,
  onOpenChange,
  requests,
  onRequestProcessed,
}: JoinRequestsModalProps) {
  const { colors } = useSectionColors();
  const { approveGroupMember, removeGroupMember } = useGroupMemberActions();
  const [loadingRequests, setLoadingRequests] = React.useState<Set<string>>(
    new Set()
  );
  const [isApproving, setIsApproving] = React.useState(false);

  const setRequestLoading = (requestId: string, isLoading: boolean) => {
    setLoadingRequests((prev) => {
      const newSet = new Set(prev);
      if (isLoading) {
        newSet.add(requestId);
      } else {
        newSet.delete(requestId);
      }
      return newSet;
    });
  };

  const handleApprove = async (request: GroupMemberWithDetails) => {
    try {
      setRequestLoading(request.anon_profile_id, true);
      await approveGroupMember(request.group_id, request.anon_profile_id);
      onRequestProcessed?.();
    } catch (error) {
      console.error("Error approving member:", error);
    } finally {
      setRequestLoading(request.anon_profile_id, false);
    }
  };

  const handleReject = async (request: GroupMemberWithDetails) => {
    try {
      setRequestLoading(request.anon_profile_id, true);
      await removeGroupMember(request.group_id, request.anon_profile_id);
      onRequestProcessed?.();
    } catch (error) {
      console.error("Error rejecting member:", error);
    } finally {
      setRequestLoading(request.anon_profile_id, false);
    }
  };

  const handleApproveAll = async () => {
    try {
      setIsApproving(true);

      // Process all requests in parallel
      const promises = requests.map((request) =>
        approveGroupMember(request.group_id, request.anon_profile_id)
      );

      await Promise.all(promises);
      onRequestProcessed?.();
    } catch (error) {
      console.error("Error approving all members:", error);
    } finally {
      setIsApproving(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <DialogTitle className="text-lg font-semibold">
            Join Request ({requests.length})
          </DialogTitle>
        </DialogHeader>

        {/* Description */}
        <div className="pb-4">
          <p className="text-sm text-muted-foreground">
            You have {requests.length} outstanding join request
            {requests.length !== 1 ? "s" : ""} waiting for your approval.
          </p>
        </div>

        {/* Requests List - Horizontal Scroll */}
        <div className="flex-1 overflow-hidden">
          <div
            className="flex gap-4 overflow-x-auto pb-4"
            style={{ scrollBehavior: "smooth" }}
          >
            {requests.map((request) => (
              <JoinRequestItem
                key={`${request.group_id}-${request.anon_profile_id}`}
                request={request}
                onApprove={() => handleApprove(request)}
                onReject={() => handleReject(request)}
                isLoading={loadingRequests.has(request.anon_profile_id)}
              />
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end pt-4 border-t gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isApproving}
            className="px-6"
          >
            Cancel
          </Button>
          <Button
            onClick={handleApproveAll}
            disabled={isApproving || requests.length === 0}
            className="px-6 text-white"
            style={{
              backgroundColor: colors.primary,
              borderColor: colors.primary,
            }}
            onMouseEnter={(e) => {
              if (!isApproving && requests.length > 0) {
                e.currentTarget.style.backgroundColor = colors.primary;
                e.currentTarget.style.opacity = "0.9";
              }
            }}
            onMouseLeave={(e) => {
              if (!isApproving && requests.length > 0) {
                e.currentTarget.style.backgroundColor = colors.primary;
                e.currentTarget.style.opacity = "1";
              }
            }}
          >
            {isApproving ? "Approving..." : "Approve All"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default JoinRequestsModal;
