import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BookText, Clock } from "lucide-react";
import { Book, Meeting } from "@/typing/strapi";
import Image from "next/image";
import { formatDate } from "@/utils/datetime";
import RsvpButton from "../meetings/rsvp-button";

export type HydratedBook = Book & {
  meeting: Meeting & { hasRsvped?: boolean };
};

function FallbackImage() {
  return (
    <div className="flex items-center justify-center bg-[#F0915A] text-[#AC5118] h-30 w-40 rounded-xl">
      <BookText className="size-12" />
    </div>
  );
}

function BookImage({ book }: { book: Book }) {
  if (!book.cover_img) {
    return <FallbackImage />;
  }

  return (
    <div className="h-30 w-40 rounded-xl bg-[#F0915A] relative">
      <Image
        src={book.cover_img.url}
        alt={book.title}
        fill
        className="object-cover"
      />
    </div>
  );
}

export function BookCards({ books }: { books: HydratedBook[] }) {
  return (
    <Card className="py-0 px-4">
      <CardContent className="flex flex-col text-xs p-0">
        {books.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </CardContent>
    </Card>
  );
}

export function BookCard({ book }: { book: HydratedBook }) {
  return (
    <div className="flex items-center border-b last:border-b-0 py-4">
      <BookImage book={book} />

      <div className="flex flex-col justify-center flex-1 px-4 gap-1">
        <h2 className="text-base font-semibold"> {book.title} </h2>
        {book.meeting && (
          <p className="flex align-center items-center gap-1 font-medium">
            <Clock className="size-4 text-[#AC5118]" />{" "}
            <span>{formatDate(new Date(book.meeting.when))}</span>
          </p>
        )}
      </div>
      {book.meeting && (
        <div>
          <RsvpButton
            meetingId={book.meeting?.id}
            hasRsvped={book.meeting?.hasRsvped}
          />
        </div>
      )}
    </div>
  );
}
