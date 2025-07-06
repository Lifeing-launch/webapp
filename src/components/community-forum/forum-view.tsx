import { ForumHeader } from "@/components/community-forum/forum-header";
import { ForumSidebar } from "@/components/community-forum/forum-sidebar";
import { SidebarSection } from "@/components/community-forum/sidebar/sidebar-section";
import { TagList } from "@/components/community-forum/sidebar/tag-list";
import { CategoryList } from "@/components/community-forum/sidebar/category-list";
import { ForumPostList } from "@/components/community-forum/forum-post-list";
import { useForumPosts, UseForumPostsOptions } from "@/hooks/use-forum";
import { useState, useCallback, useMemo } from "react";
import NewPostModal from "./new-post-modal";

export interface IForumViewProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activePage: "Forum" | "Groups" | "Messages";
  setActivePage: React.Dispatch<
    React.SetStateAction<"Forum" | "Groups" | "Messages">
  >;
}

export const ForumView = ({ activePage, setActivePage }: IForumViewProps) => {
  const [openNewPost, setOpenNewPost] = useState(false);
  const [filters, setFilters] = useState<UseForumPostsOptions>({
    onlyForum: true,
  });

  const memoizedFilters = useMemo(() => filters, [filters]);

  const {
    tags,
    categories,
    posts: { refetch: refetchPosts },
  } = useForumPosts(memoizedFilters);

  const handleTagClick = useCallback((tagId: string) => {
    setFilters((prev) => ({
      ...prev,
      tagId: prev.tagId === tagId ? undefined : tagId,
    }));
  }, []);

  const handleCategoryClick = useCallback((categoryId: string) => {
    setFilters((prev) => ({
      ...prev,
      categoryId: prev.categoryId === categoryId ? undefined : categoryId,
    }));
  }, []);

  const handleSearchQuery = useCallback((query: string) => {
    setFilters((prev) => ({
      ...prev,
      searchQuery: query,
    }));
  }, []);

  const handleNewPost = useCallback(() => {
    setOpenNewPost((prev) => !prev);
  }, []);

  return (
    <>
      <div className="sticky top-0 z-20 bg-background border-b border-border px-4 py-3">
        <ForumHeader
          searchQuery={filters.searchQuery ?? ""}
          setSearchQuery={handleSearchQuery}
          buttonOnClick={handleNewPost}
        />
      </div>
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <ForumSidebar activePage={activePage} setActivePage={setActivePage}>
          <SidebarSection title="Browse by tags">
            <TagList
              tags={tags.data ?? []}
              isLoading={tags.isLoading}
              activeTag={filters.tagId}
              onTagClick={handleTagClick}
            />
          </SidebarSection>

          <SidebarSection title="Browse by Categories">
            <CategoryList
              activeCategory={filters.categoryId}
              categories={categories.data ?? []}
              isLoading={categories.isLoading}
              onCategoryClick={handleCategoryClick}
            />
          </SidebarSection>
        </ForumSidebar>
        <div className="flex-1 overflow-y-auto">
          <div className="px-4 py-3 pb-0">
            <ForumPostList filters={memoizedFilters} />
          </div>
        </div>
      </div>
      <NewPostModal
        open={openNewPost}
        onClose={handleNewPost}
        tags={tags.data ?? []}
        categories={categories.data ?? []}
        revalidate={refetchPosts}
      />
    </>
  );
};

export default ForumView;
