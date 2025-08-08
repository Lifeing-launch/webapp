import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Badge } from "../ui/badge";
import { formatDate } from "@/utils/datetime";
import Link from "next/link";
import BookmarkButton from "./bookmark-button";
import { PreviewImage } from "./preview-image";
import { type BlocksContent } from "@strapi/blocks-react-renderer";
import { Resource, ResourceCategory, ResourceType } from "@/typing/strapi";

export type Article = {
  id: number;
  documentId: string;
  body: BlocksContent;
};

interface IResourceCard {
  resource: Resource;
  className?: string;
  hasBookmarked?: boolean;
  hideBookmark?: boolean;
  category?: ResourceCategory;
}

export const TYPE_TO_LABEL_MAPPING: Record<ResourceType, string> = {
  article: "Article",
  document: "Document",
  video: "Video",
  meditation: "Meditation",
  podcast: "Podcast",
  relaxation: "Relaxation",
};

export function ResourceCard({ category, ...props }: IResourceCard) {
  if (category === "audio") return <AudioResourceCard {...props} />;
  if (category === "visual") return <VisualResourceCard {...props} />;
}

function AudioResourceCard({
  resource,
  className,
  hasBookmarked = false,
  hideBookmark = false,
}: IResourceCard) {
  return (
    <Card
      className={cn("items-stretch gap-2 p-4 w-full h-full", className)}
      data-testid="resource-card"
    >
      <div className="flex flex-1">
        <div className="flex-1">
          <CardHeader className="p-2">
            <CardTitle>{resource.title}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-xs px-2">
            <div className="flex gap-2 items-center">
              <Badge variant="secondary">
                {TYPE_TO_LABEL_MAPPING[resource.type] || resource.type}
              </Badge>
              {resource.duration && (
                <span className="text-muted-foreground font-medium">
                  Duration: {resource.duration}
                </span>
              )}
            </div>
            <p> {resource.description} </p>
          </CardContent>
        </div>
        {!hideBookmark && (
          <div>
            <BookmarkButton
              resourceId={resource.id}
              hasBookmarked={hasBookmarked}
            />
          </div>
        )}
      </div>

      {resource.url && (
        <audio controls className="w-full" controlsList="nodownload">
          <source src={resource.url} type="audio/mpeg"></source>
        </audio>
      )}
    </Card>
  );
}

function VisualResourceCard({
  resource,
  className,
  hasBookmarked = false,
  hideBookmark = false,
}: IResourceCard) {
  const getResourceHref = () => {
    if (resource.type === "article") {
      return resource.url || `/resources/${resource.slug}`;
    }
    return resource.url || undefined;
  };

  return (
    <Link href={getResourceHref() || ""} target="_blank" className="h-full">
      <Card
        className={cn(
          "flex-row items-stretch gap-2 p-4 w-full h-full",
          className
        )}
        data-testid="resource-card"
      >
        <PreviewImage resource={resource} />
        <div className="flex items-center flex-1">
          <div>
            <CardHeader className="p-2">
              <CardTitle>{resource.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-xs px-2">
              <p> {resource.description} </p>
              <div className="flex gap-2 items-center">
                <Badge variant="secondary">
                  {TYPE_TO_LABEL_MAPPING[resource.type] || resource.type}
                </Badge>
                <span className="text-muted-foreground font-medium">
                  Uploaded: {formatDate(new Date(resource.createdAt))}
                </span>
              </div>
            </CardContent>
          </div>
        </div>
        {!hideBookmark && (
          <div>
            <BookmarkButton
              resourceId={resource.id}
              hasBookmarked={hasBookmarked}
            />
          </div>
        )}
      </Card>
    </Link>
  );
}
