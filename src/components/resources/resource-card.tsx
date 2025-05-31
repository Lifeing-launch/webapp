import React from "react";
import { FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Badge } from "../ui/badge";
import { formatDate } from "@/utils/datetime";
import Link from "next/link";
import Image from "next/image";
import BookmarkButton from "./bookmark-button";

export type ResourceType = "article" | "document" | "video";
export type ResourceGroup = "visual" | "audio";

export type Resource = {
  id: number;
  title: string;
  description: string;
  type: ResourceType;
  createdAt: string;
  duration?: number;
};

interface IResourceCard {
  resource: Resource;
  className?: string;
  hasBookmarked?: boolean;
  resourceGroup?: ResourceGroup;
}

const TYPE_TO_LABEL_MAPPING = {
  article: "Article",
  document: "Document",
  video: "Video",
};

export function ResourceCard({
  resource,
  className,
  hasBookmarked = false,
  resourceGroup,
}: IResourceCard) {
  if (resourceGroup === "audio") {
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
                <span className="text-muted-foreground font-medium">
                  Duration: 10 minutes
                </span>
              </div>
              <p> {resource.description} </p>
            </CardContent>
          </div>
          <div>
            <BookmarkButton
              resourceId={resource.id}
              hasBookmarked={hasBookmarked}
            />
          </div>
        </div>

        <audio controls className="w-full" controlsList="nodownload">
          <source
            src="https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg"
            type="audio/mpeg"
          ></source>
        </audio>
      </Card>
    );
  }

  return (
    <Link href={`/resources/${resource.id}`} className="h-full">
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

        <div>
          <BookmarkButton
            resourceId={resource.id}
            hasBookmarked={hasBookmarked}
          />
        </div>
      </Card>
    </Link>
  );
}

function PreviewImage({ resource }: { resource: Resource }) {
  if (resource.type === "video" || resource.type === "article") {
    return <ArticleImage resource={resource} />;
  }

  return <PlaceholderImage />;
}

function PlaceholderImage() {
  return (
    <div className="flex flex-1 items-center justify-center bg-lime-100 text-lime-700 h-35 rounded-xs">
      <FileText className="size-12 font-bold" />
    </div>
  );
}

function ArticleImage({ resource }: { resource: Resource }) {
  return (
    <div className="flex-1 rounded-xs overflow-hidden h-35 relative">
      <Image
        src="https://images.unsplash.com/photo-1542353436-312f0e1f67ff?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        alt="Resource Image"
        width={600}
        height={300}
        className="object-cover"
      />
      {resource.type === "video" && (
        <div className="flex absolute inset-0 items-center justify-center">
          <Image
            src="/play-button.svg"
            alt=""
            width={40}
            height={40}
            className="size-15"
          />
        </div>
      )}
    </div>
  );
}
