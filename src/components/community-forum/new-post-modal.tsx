"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown, Loader2, User } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAnonymousProfile } from "@/hooks/use-anonymous-profile";
import { Category, Tag } from "@/typing/forum";
import { postService } from "@/services/forum";
import { useMutation } from "@tanstack/react-query";
import { getAvatarBackgroundStyle } from "@/utils/forum-avatar-colors";
import { useSectionColors } from "@/hooks/use-section-colors";

interface NewPostModalProps {
  open: boolean;
  onClose: () => void;
  tags: Tag[];
  categories: Category[];
  revalidate: () => void;
}

export const NewPostModal = ({
  open,
  onClose,
  tags,
  categories,
  revalidate,
}: NewPostModalProps) => {
  const { profile, user } = useAnonymousProfile();
  const { colors } = useSectionColors();

  // Função helper para garantir ID único para cores do avatar
  const getUserIdForAvatar = () => {
    if (profile?.id) return profile.id;
    if (user?.id) return user.id;
    // Fallback único baseado no timestamp para garantir variação
    return `fallback-${Date.now()}`;
  };

  const [content, setContent] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>(() =>
    categories.length > 0 ? categories[0].id : ""
  );
  const [selectedTags, setSelectedTags] = useState<string[]>(() =>
    tags.length > 0 ? [tags[0].id] : []
  );
  const [isFocused, setIsFocused] = useState(false);
  const [tagFilter, setTagFilter] = useState("");
  const [showFilteredTags, setShowFilteredTags] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const maxLength = 1000;

  const {
    mutate: createPost,
    isPending,
    isError,
  } = useMutation({
    mutationFn: (data: {
      groupId?: string;
      content: string;
      title?: string;
      categoryId?: string;
      tags?: string[];
    }) => postService.createPost(data),
    onSuccess: () => {
      revalidate();
      onClose();
      setContent("");
      setSelectedTags(tags.length > 0 ? [tags[0].id] : []);
      setSelectedCategory(categories.length > 0 ? categories[0].id : "");
      setTagFilter("");
      setShowFilteredTags(false);
      setIsFocused(false);
    },
  });

  // Calculate tag relevance for sorting
  const getTagRelevance = (tagName: string, filter: string): number => {
    const lowerTag = tagName.toLowerCase();
    const lowerFilter = filter.toLowerCase();

    // Exact match gets highest score
    if (lowerTag === lowerFilter) return 100;

    // Starts with filter gets high score
    if (lowerTag.startsWith(lowerFilter)) return 80;

    // Contains filter gets medium score
    if (lowerTag.includes(lowerFilter)) return 60;

    return 0;
  };

  // Auto-focus when modal opens
  useEffect(() => {
    if (open && textareaRef.current) {
      // Small delay to ensure modal is fully rendered
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  }, [open]);

  // Ensure first category is selected when categories change
  useEffect(() => {
    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0].id);
    }
    if (tags.length > 0 && !selectedTags.length) {
      setSelectedTags([tags[0].id]);
    }
  }, [categories, selectedCategory, tags, selectedTags]);

  // Filter and sort tags based on # input and selection status
  const filteredTags = useMemo(() => {
    let result = tags;

    // Filter by search term if filtering
    if (tagFilter) {
      result = tags.filter((tag) =>
        tag.name.toLowerCase().includes(tagFilter.toLowerCase())
      );
    }

    // Sort: selected tags first, then by relevance to filter
    result.sort((a, b) => {
      const aSelected = selectedTags.includes(a.id);
      const bSelected = selectedTags.includes(b.id);

      // Selected tags come first
      if (aSelected && !bSelected) return -1;
      if (!aSelected && bSelected) return 1;

      // If both selected or both not selected, sort by relevance to filter
      if (tagFilter) {
        const aRelevance = getTagRelevance(a.name, tagFilter);
        const bRelevance = getTagRelevance(b.name, tagFilter);
        return bRelevance - aRelevance;
      }

      return 0;
    });

    return result;
  }, [tags, tagFilter, selectedTags]);

  // Get the best matching tag for Enter selection
  const getBestMatchingTag = (): Tag | null => {
    if (!tagFilter || filteredTags.length === 0) return null;

    // Return the first tag from filtered/sorted list (most relevant)
    return filteredTags[0];
  };

  // Handle content change and detect # for tag filtering
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);

    // Check if user is typing a hashtag
    const cursorPosition = e.target.selectionStart;
    const textBeforeCursor = newContent.slice(0, cursorPosition);
    const hashtagMatch = textBeforeCursor.match(/#(\w*)$/);

    if (hashtagMatch) {
      setTagFilter(hashtagMatch[1]);
      setShowFilteredTags(true);
    } else {
      setTagFilter("");
      setShowFilteredTags(false);
    }
  };

  // Handle key events in textarea
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && showFilteredTags) {
      e.preventDefault();
      const bestMatch = getBestMatchingTag();
      if (bestMatch) {
        handleTagClick(bestMatch.id, bestMatch.name);
      }
    }
  };

  const handleTagClick = (tagId: string, tagName?: string) => {
    if (showFilteredTags && tagName) {
      // Remove the hashtag filter from content when selecting a tag
      const cursorPosition = textareaRef.current?.selectionStart || 0;
      const textBeforeCursor = content.slice(0, cursorPosition);
      const textAfterCursor = content.slice(cursorPosition);
      const hashtagMatch = textBeforeCursor.match(/#(\w*)$/);

      if (hashtagMatch) {
        // Remove the hashtag filter text (e.g., "#life") from content
        const newContent =
          textBeforeCursor.slice(0, hashtagMatch.index) + textAfterCursor;
        setContent(newContent);
        setShowFilteredTags(false);
        setTagFilter("");

        // Add to selected tags if not already selected
        if (!selectedTags.includes(tagId)) {
          setSelectedTags((prev) => [...prev, tagId]);
        }

        // Refocus textarea at the position where the hashtag was removed
        setTimeout(() => {
          if (textareaRef.current) {
            const newCursorPosition = hashtagMatch.index!;
            textareaRef.current.focus();
            textareaRef.current.setSelectionRange(
              newCursorPosition,
              newCursorPosition
            );
          }
        }, 0);
      }
    } else {
      // Toggle tag selection in normal mode
      setSelectedTags((prev) =>
        prev.includes(tagId)
          ? prev.filter((t) => t !== tagId)
          : [...prev, tagId]
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    createPost({
      content,
      categoryId: selectedCategory,
      tags: selectedTags,
    });
  };

  const displayTags = showFilteredTags ? filteredTags : filteredTags;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[548px] p-0 gap-0">
        <DialogTitle className="sr-only">Share a thought</DialogTitle>
        <div className="flex flex-col items-start p-5 gap-3 relative bg-white shadow-sm rounded-xl">
          <div className="flex flex-col items-start gap-3 w-full">
            {/* Header */}
            <div className="flex flex-row items-center gap-3 w-full">
              <div className="flex flex-col items-start gap-1.5">
                <h2 className="text-zinc-900 font-semibold text-base leading-4 tracking-tight">
                  Share a thought
                </h2>
              </div>
            </div>

            {/* User info and category */}
            <div className="flex flex-col items-start gap-3">
              {/* Avatar */}
              <div className="flex flex-row items-center gap-2">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center relative"
                  style={getAvatarBackgroundStyle(getUserIdForAvatar())}
                >
                  <User className="w-6 h-6 text-slate-50" strokeWidth={2} />
                </div>

                {/* Username */}
                <span className="text-zinc-900 font-semibold text-sm leading-5">
                  {profile?.nickname || "Anonymous"}
                </span>
              </div>

              {/* Category dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div
                    className="flex flex-row items-center justify-center px-1.5 py-0.5 gap-1 rounded-md cursor-pointer transition-colors"
                    style={{
                      backgroundColor: `${colors.primary}40`, // 40% opacity
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = `${colors.primary}50`; // 50% opacity on hover
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = `${colors.primary}40`; // back to 40% opacity
                    }}
                  >
                    <span
                      className="font-normal text-xs leading-4"
                      style={{ color: colors.primary }}
                    >
                      {categories.find((cat) => cat.id === selectedCategory)
                        ?.name || "General"}
                    </span>
                    <ChevronDown
                      className="w-3 h-3"
                      style={{ color: colors.primary }}
                      strokeWidth={1}
                    />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  {categories.map((category) => (
                    <DropdownMenuItem
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className="cursor-pointer"
                    >
                      {category.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Textarea with tags inside */}
            <form onSubmit={handleSubmit} className="w-full">
              <div className="flex flex-col items-start gap-2 w-full">
                <div className="flex flex-col items-start gap-1.5 w-full relative">
                  {/* Textarea container with focus border */}
                  <div
                    className="w-full min-h-[248px] p-3 bg-white border shadow-sm rounded-md relative transition-colors"
                    style={
                      isFocused
                        ? {
                            borderColor: colors.primary,
                            boxShadow: `0 0 0 2px ${colors.primary}20`,
                          }
                        : {
                            borderColor: "#d4d4d8",
                          }
                    }
                  >
                    <Textarea
                      ref={textareaRef}
                      value={content}
                      onChange={handleContentChange}
                      onKeyDown={handleKeyDown}
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setIsFocused(false)}
                      placeholder="What do you want to talk about today?"
                      className="w-full h-[200px] p-0 bg-transparent border-0 resize-none text-sm leading-5 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                      maxLength={maxLength}
                    />

                    {/* Tags positioned at bottom of textarea with horizontal scroll */}
                    <div className="absolute bottom-3 left-3 right-3">
                      <div className="overflow-x-auto scrollbar-hide">
                        <div className="flex flex-row items-start gap-2.5 flex-nowrap min-w-max">
                          {displayTags.map((tag, index) => (
                            <Badge
                              key={tag.id}
                              variant="secondary"
                              className="px-1.5 py-0.5 text-xs leading-4 font-normal rounded-md border-0 cursor-pointer transition-colors hover:opacity-80 flex-shrink-0"
                              style={(() => {
                                if (selectedTags.includes(tag.id)) {
                                  return {
                                    backgroundColor: `${colors.primary}35`,
                                    color: colors.primary,
                                  };
                                } else if (showFilteredTags && index === 0) {
                                  return {
                                    backgroundColor: `${colors.primary}20`,
                                    color: colors.primary,
                                    boxShadow: `0 0 0 2px ${colors.primary}20`,
                                  };
                                } else if (showFilteredTags) {
                                  return {
                                    backgroundColor: `${colors.primary}10`,
                                    color: colors.primary,
                                  };
                                } else {
                                  return {
                                    backgroundColor: "#e4e4e7",
                                    color: "#71717a",
                                  };
                                }
                              })()}
                              onClick={() => handleTagClick(tag.id, tag.name)}
                            >
                              #{tag.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Character count and filter indicator */}
                <div className="flex justify-between items-center w-full">
                  <div className="text-zinc-400 font-normal text-xs leading-4">
                    {content.length}/{maxLength}
                  </div>
                  {showFilteredTags && (
                    <div
                      className="font-normal text-xs leading-4"
                      style={{ color: colors.primary }}
                    >
                      Filtering tags: #{tagFilter} (Press Enter to select)
                    </div>
                  )}
                </div>

                {isError && (
                  <div className="text-red-500 font-normal text-xs leading-4">
                    Error creating post, please try again.
                  </div>
                )}

                {/* Post button */}
                <div className="flex flex-col items-end w-full">
                  <Button
                    type="submit"
                    className="px-4 py-2 text-slate-50 font-medium text-sm leading-5 rounded-md shadow-sm border-0 h-9"
                    style={{
                      backgroundColor: colors.primary,
                    }}
                    onMouseEnter={(e) => {
                      if (
                        !isPending &&
                        content.trim() &&
                        content.length <= maxLength
                      ) {
                        e.currentTarget.style.backgroundColor = colors.primary;
                        e.currentTarget.style.opacity = "0.9";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (
                        !isPending &&
                        content.trim() &&
                        content.length <= maxLength
                      ) {
                        e.currentTarget.style.backgroundColor = colors.primary;
                        e.currentTarget.style.opacity = "1";
                      }
                    }}
                    disabled={
                      !content.trim() || content.length > maxLength || isPending
                    }
                  >
                    {isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Post"
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewPostModal;
