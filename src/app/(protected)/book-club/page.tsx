import { serverFetch } from "@/utils/fetch";
import PageBanner from "@/components/layout/page-banner";
import { BookCards, HydratedBook } from "@/components/book-club/book-card";
import qs from "qs";

const BANNER_IMAGE = "/images/banners/book-club.png";

export default async function BookClubPage() {
  let books: HydratedBook[] = [];
  let error: string | null = null;

  try {
    const data: { data?: HydratedBook[] } = await serverFetch(
      `/api/books?${qs.stringify({
        hydrateRsvp: true,
      })}`
    );
    books = data.data || [];
  } catch (err) {
    console.error("Error fetching books: ", err);
    error = "Failed to load books. Please try again later.";
  }

  let content = <></>;

  if (error) {
    content = <p className="text-sm text-red-500">{error}</p>;
  } else if (!books.length) {
    content = <p className="text-sm">There are no books to display.</p>;
  } else {
    content = <BookCards books={books} />;
  }

  return (
    <div className="w-full h-screen flex flex-col">
      <PageBanner
        title="Shelf discovery with Meg"
        className="mb-0 flex-shrink-0"
        backgroundImage={BANNER_IMAGE}
      />
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-xl text-sm flex flex-col gap-4 mb-5">
          <p className="font-bold">
            Join Meg for Shelf Discovery, Lifeings Book Club where we explore
            thought-provoking reads and the ideas that expand our minds and
            hearts.
          </p>
          <p>
            This new journey begins with a “Surprise”, Meg will introduce the
            book during the first meeting. Bring your curiosity and Meg will
            bring a thought provoking question and we will all share in a
            lively, engaging discussion.
          </p>
          <p className="text-muted-foreground text-xs">
            Stay tuned for updates, links for the books and more information as
            we roll out this exciting new offering!
          </p>
          <div className="mt-5">{content}</div>
        </div>
      </main>
    </div>
  );
}
