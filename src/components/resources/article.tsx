import React from "react";
import { TYPE_TO_LABEL_MAPPING } from "./resource-card";
import { ArticleBody } from "./article-body";
import { Badge } from "../ui/badge";
import BookmarkButton from "./bookmark-button";
import Image from "next/image";
import { formatDate } from "@/utils/datetime";
import { Resource } from "@/typing/strapi";

interface IArticle {
  resource: Resource;
  hasBookmarked: boolean;
}

export function Article({ resource, hasBookmarked }: IArticle) {
  if (resource.type !== "article")
    return (
      <p className="mt-3"> Sorry, this resource could not be displayed. </p>
    );

  return (
    <article className="max-w-2xl m-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold pt-2"> {resource.title} </h1>
        <div className="flex gap-2 items-center text-xs">
          <Badge variant="secondary">
            {TYPE_TO_LABEL_MAPPING[resource.type] || resource.type}
          </Badge>
          <span className="text-muted-foreground font-medium">
            Uploaded: {formatDate(new Date(resource.createdAt))}
          </span>
          <BookmarkButton
            resourceId={resource.id}
            hasBookmarked={hasBookmarked}
          />
        </div>
        <div className="flex-1 rounded-md overflow-hidden w-full relative">
          <Image
            src="https://images.unsplash.com/photo-1542353436-312f0e1f67ff?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Resource Image"
            width={600}
            height={300}
            className="object-cover w-full"
          />
        </div>
        {resource?.article?.body && (
          <ArticleBody content={resource.article.body} />
        )}
      </div>
    </article>
  );
}
