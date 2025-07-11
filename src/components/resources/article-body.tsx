"use client";

import React from "react";
import {
  BlocksRenderer,
  type BlocksContent,
} from "@strapi/blocks-react-renderer";
import Image from "next/image";

interface IArticleBody {
  content: BlocksContent;
}

export function ArticleBody({ content }: IArticleBody) {
  return (
    <div className="article-body my-4">
      <BlocksRenderer
        content={content}
        blocks={{
          image: ({ image }) => (
            <Image
              src={image.url}
              width={image.width}
              height={image.height}
              alt={image.alternativeText || ""}
            />
          ),
        }}
      />
    </div>
  );
}
