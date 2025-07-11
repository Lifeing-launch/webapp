"use client";

import React, { useState, useRef, useEffect } from "react";
import { Loader2, Users } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { GroupTypeEnum } from "@/typing/forum";
import { groupService } from "@/services/forum";
import { useMutation } from "@tanstack/react-query";

interface NewGroupModalProps {
  open: boolean;
  onClose: () => void;
  revalidate: () => void;
  openGroup?: (group: { id: string; name: string }) => void;
}

export const NewGroupModal = ({
  open,
  onClose,
  revalidate,
  openGroup,
}: NewGroupModalProps) => {
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const nameInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const maxNameLength = 50;
  const maxDescriptionLength = 100;

  const {
    mutate: createGroup,
    isPending,
    isError,
  } = useMutation({
    mutationFn: (data: {
      name: string;
      description?: string;
      groupType?: GroupTypeEnum;
    }) => groupService.createGroup(data),
    onSuccess: (data) => {
      openGroup?.({ id: data.id, name: data.name });
      revalidate();
      onClose();
      setGroupName("");
      setDescription("");
      setIsPrivate(false);
      setIsFocused(false);
    },
  });

  // Auto-focus when modal opens
  useEffect(() => {
    if (open && nameInputRef.current) {
      // Small delay to ensure modal is fully rendered
      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 100);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!groupName.trim()) {
      return;
    }

    createGroup({
      name: groupName.trim(),
      description: description.trim() || undefined,
      groupType: isPrivate ? "private" : "public",
    });
  };

  const isFormValid =
    groupName.trim().length > 0 &&
    groupName.length <= maxNameLength &&
    description.length <= maxDescriptionLength;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[548px] p-0 gap-0">
        <DialogTitle className="sr-only">Create New Group</DialogTitle>
        <div className="flex flex-col items-start p-6 gap-6 relative bg-white shadow-sm rounded-xl">
          <div className="flex flex-col items-start gap-6 w-full">
            {/* Header */}
            <div className="flex flex-row items-center gap-3 w-full">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-white" strokeWidth={2} />
              </div>
              <div className="flex flex-col items-start gap-1">
                <h2 className="text-zinc-900 font-semibold text-xl leading-6 tracking-tight">
                  Create New Group
                </h2>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="w-full">
              <div className="flex flex-col items-start gap-6 w-full">
                {/* Group Name */}
                <div className="flex flex-col items-start gap-2 w-full">
                  <Label
                    htmlFor="group-name"
                    className="text-zinc-900 font-medium text-base leading-6"
                  >
                    Group Name
                  </Label>
                  <Input
                    id="group-name"
                    ref={nameInputRef}
                    type="text"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="Group Name"
                    className="w-full h-12 px-4 py-3 text-base border border-gray-300 rounded-md focus:border-primary focus:ring-2 focus:ring-primary/20"
                    maxLength={maxNameLength}
                    required
                  />
                  <div className="text-zinc-400 font-normal text-sm leading-5">
                    {groupName.length}/{maxNameLength}
                  </div>
                </div>

                {/* Description */}
                <div className="flex flex-col items-start gap-2 w-full">
                  <Label
                    htmlFor="description"
                    className="text-zinc-900 font-medium text-base leading-6"
                  >
                    Description
                  </Label>
                  <div
                    className={`w-full min-h-[120px] p-3 bg-white border rounded-md relative transition-colors ${
                      isFocused
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-gray-300"
                    }`}
                  >
                    <Textarea
                      id="description"
                      ref={textareaRef}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setIsFocused(false)}
                      placeholder="Description"
                      className="w-full h-[80px] p-0 bg-transparent border-0 resize-none text-base leading-6 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                      maxLength={maxDescriptionLength}
                    />
                  </div>
                  <div className="text-zinc-400 font-normal text-sm leading-5">
                    {description.length}/{maxDescriptionLength}
                  </div>
                </div>

                {/* Private Group Checkbox */}
                <div className="flex flex-row items-center gap-3 w-full">
                  <div className="flex items-center">
                    <input
                      id="private-group"
                      type="checkbox"
                      checked={isPrivate}
                      onChange={(e) => setIsPrivate(e.target.checked)}
                      className="w-4 h-4 border-gray-300 rounded focus:ring-primary focus:ring-2 accent-primary"
                      style={{
                        accentColor: "hsl(var(--primary))",
                      }}
                    />
                  </div>
                  <Label
                    htmlFor="private-group"
                    className="text-zinc-900 font-medium text-base leading-6 cursor-pointer"
                  >
                    Make it private
                  </Label>
                </div>

                {/* Error Message */}
                {isError && (
                  <div className="text-red-500 font-normal text-sm leading-5 bg-red-50 p-3 rounded-md w-full">
                    Error creating group, please try again.
                  </div>
                )}

                {/* Create Button */}
                <Button
                  type="submit"
                  className="px-6 py-3 h-12 bg-primary hover:bg-primary/90 text-white font-medium text-base rounded-md self-end"
                  disabled={!isFormValid || isPending}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Creating...
                    </>
                  ) : (
                    "Create Group"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewGroupModal;
