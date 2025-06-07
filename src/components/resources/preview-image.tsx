import React from "react";
import { FileText, MonitorPlay, ScrollText } from "lucide-react";
import Image from "next/image";
import { Resource } from "@/typing/strapi";

export function PreviewImage({ resource }: { resource: Resource }) {
  if (
    (resource.type === "video" || resource.type === "article") &&
    resource.cover_img?.url
  ) {
    return <ArticleImage resource={resource} />;
  }

  return <FallbackImage resource={resource} />;
}

function FallbackImage({ resource }: { resource: Resource }) {
  let Icon;

  if (resource.type === "video") {
    Icon = MonitorPlay;
  } else if (resource.type === "article") {
    Icon = ScrollText;
  } else {
    Icon = FileText;
  }

  return (
    <div className="flex flex-1 items-center justify-center bg-lime-100 text-lime-700 h-35 rounded-xs">
      <Icon className="size-12 font-bold" />
    </div>
  );
}

function ArticleImage({ resource }: { resource: Resource }) {
  return (
    <div className="flex-1 rounded-xs overflow-hidden h-35 relative">
      <Image
        src={resource.cover_img?.url || ""}
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
