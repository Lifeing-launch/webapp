"use client";

import React from "react";
import {
  BlocksRenderer,
  type BlocksContent,
} from "@strapi/blocks-react-renderer";
import Image from "next/image";

interface IExtendedBioRenderer {
  content: BlocksContent;
}

export function ExtendedBioRenderer({ content }: IExtendedBioRenderer) {
  if (!content || content.length === 0) {
    return null;
  }

  return (
    <div className="extended-bio prose dark:prose-invert max-w-none">
      <BlocksRenderer
        content={content}
        blocks={{
          // Customizar renderização de parágrafos
          paragraph: ({ children }) => (
            <p className="mb-4 leading-relaxed">{children}</p>
          ),

          // Customizar renderização de headings
          heading: ({ children, level }) => {
            const headingClasses: Record<number, string> = {
              1: "text-3xl font-bold mb-4 mt-8 text-foreground",
              2: "text-2xl font-bold mb-3 mt-6 text-foreground",
              3: "text-xl font-semibold mb-3 mt-5 text-foreground",
              4: "text-lg font-semibold mb-2 mt-4 text-foreground",
              5: "text-base font-semibold mb-2 mt-3 text-foreground",
              6: "text-sm font-semibold mb-2 mt-3 text-foreground",
            };
            const HeadingTag = `h${level}` as keyof React.JSX.IntrinsicElements;
            const className = headingClasses[level] || headingClasses[2];

            return React.createElement(HeadingTag, { className }, children);
          },

          // Customizar renderização de listas
          list: ({ children, format }) => {
            const ListTag = format === "ordered" ? "ol" : "ul";
            const listClasses =
              format === "ordered"
                ? "list-decimal ml-6 mb-4 space-y-1"
                : "list-disc ml-6 mb-4 space-y-1";

            return React.createElement(
              ListTag,
              { className: listClasses },
              children
            );
          },

          // Customizar renderização de itens de lista
          "list-item": ({ children }) => (
            <li className="text-foreground leading-relaxed">{children}</li>
          ),

          // Customizar renderização de quotes
          quote: ({ children }) => (
            <blockquote className="border-l-4 border-primary/30 pl-4 italic mb-4 text-muted-foreground bg-muted/30 py-2 rounded-r">
              {children}
            </blockquote>
          ),

          // Customizar renderização de código
          code: ({ children }) => (
            <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
              {children}
            </code>
          ),

          // Customizar renderização de imagens (se houver)
          image: ({ image }) => (
            <div className="my-6">
              <Image
                src={image.url}
                width={image.width}
                height={image.height}
                alt={image.alternativeText || ""}
                className="rounded-lg shadow-sm"
              />
              {image.caption && (
                <p className="text-sm text-muted-foreground mt-2 text-center italic">
                  {image.caption}
                </p>
              )}
            </div>
          ),

          // Customizar renderização de links
          link: ({ children, url }) => (
            <a
              href={url}
              className="text-primary hover:text-primary/80 underline underline-offset-2 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
        }}
        modifiers={{
          bold: ({ children }) => (
            <strong className="font-bold">{children}</strong>
          ),
          italic: ({ children }) => <em className="italic">{children}</em>,
          underline: ({ children }) => <u className="underline">{children}</u>,
          strikethrough: ({ children }) => (
            <s className="line-through">{children}</s>
          ),
          code: ({ children }) => (
            <code className="bg-muted px-1 py-0.5 rounded text-sm font-mono">
              {children}
            </code>
          ),
        }}
      />
    </div>
  );
}
