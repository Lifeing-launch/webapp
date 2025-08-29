import { ForumHeader } from "@/components/community-forum/forum-header";
import { ForumSidebar } from "@/components/community-forum/forum-sidebar";
import { SidebarSection } from "@/components/community-forum/sidebar/sidebar-section";
import { TagList } from "@/components/community-forum/sidebar/tag-list";
import { CategoryList } from "@/components/community-forum/sidebar/category-list";
import { ForumPostList } from "@/components/community-forum/forum-post-list";
import { useInfinitePosts } from "@/hooks/use-infinite-posts";
import { useState, useCallback, useMemo } from "react";
import NewPostModal from "./new-post-modal";
import { Sheet, SheetContent } from "@/components/ui/sheet";

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
  const [openMobileMenu, setOpenMobileMenu] = useState(false);
  const [filters, setFilters] = useState<{
    searchQuery?: string;
    tagId?: string;
    categoryId?: string;
  }>({});

  const memoizedFilters = useMemo(() => filters, [filters]);

  const {
    posts,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    tags,
    categories,
    isLoadingTags,
    isLoadingCategories,
    refetch: refetchPosts,
  } = useInfinitePosts({
    ...memoizedFilters,
    onlyForum: true,
  });

  const handleTagClick = useCallback((tagId: string) => {
    setFilters((prev) => ({
      ...prev,
      tagId: prev.tagId === tagId ? undefined : tagId,
    }));
    setOpenMobileMenu(false);
  }, []);

  const handleCategoryClick = useCallback((categoryId: string) => {
    setFilters((prev) => ({
      ...prev,
      categoryId: prev.categoryId === categoryId ? undefined : categoryId,
    }));
    setOpenMobileMenu(false);
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

  const sidebarContent = (
    <>
      <SidebarSection title="Browse by tags">
        <TagList
          tags={tags}
          isLoading={isLoadingTags}
          activeTag={filters.tagId}
          onTagClick={handleTagClick}
        />
      </SidebarSection>

      <SidebarSection title="Browse by Categories">
        <CategoryList
          activeCategory={filters.categoryId}
          categories={categories}
          isLoading={isLoadingCategories}
          onCategoryClick={handleCategoryClick}
        />
      </SidebarSection>
    </>
  );

  return (
    <>
      <Sheet open={openMobileMenu} onOpenChange={setOpenMobileMenu}>
        <SheetContent side="left" className="w-[300px] p-0">
          <ForumSidebar
            activePage={activePage}
            setActivePage={setActivePage}
            isFull={true}
            onItemClick={() => setOpenMobileMenu(false)}
          >
            {sidebarContent}
          </ForumSidebar>
        </SheetContent>
      </Sheet>

      <div className="sticky top-0 z-20 bg-background border-b border-border px-4 py-3">
        <ForumHeader
          searchQuery={filters.searchQuery ?? ""}
          setSearchQuery={handleSearchQuery}
          buttonOnClick={handleNewPost}
          onMenuClick={() => setOpenMobileMenu(true)}
          showMenuButton={true}
        />
      </div>
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <ForumSidebar activePage={activePage} setActivePage={setActivePage}>
          {sidebarContent}
        </ForumSidebar>
        <div className="flex-1 overflow-y-auto">
          <div className="px-4 py-3 pb-0">
            <ForumPostList
              posts={posts}
              isLoading={isLoading}
              isFetchingNextPage={isFetchingNextPage}
              hasNextPage={hasNextPage}
              onLoadMore={fetchNextPage}
            />
          </div>
        </div>
      </div>
      <NewPostModal
        open={openNewPost}
        onClose={handleNewPost}
        tags={tags}
        categories={categories}
        revalidate={refetchPosts}
      />
    </>
  );
};

export default ForumView;
