import { serverFetch } from "@/utils/fetch";
import { BookCards, HydratedBook } from "@/components/book-club/book-card";
import qs from "qs";
import BookClubContent from "@/components/book-club/content";

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

  return <BookClubContent content={content} />;
}
