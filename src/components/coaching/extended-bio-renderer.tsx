import React, { JSX } from "react";
import { ExtendedBioBlock } from "@/typing/strapi";

interface IExtendedBioRenderer {
  blocks: ExtendedBioBlock[];
}

export function ExtendedBioRenderer({ blocks }: IExtendedBioRenderer) {
  if (!blocks || blocks.length === 0) {
    return null;
  }

  const renderBlock = (block: ExtendedBioBlock, index: number) => {
    switch (block.type) {
      case "paragraph":
        return (
          <p key={index} className="mb-4">
            {block.children.map((child, childIndex) => (
              <span
                key={childIndex}
                className={`
                  ${child.bold ? "font-bold" : ""}
                  ${child.italic ? "italic" : ""}
                `}
              >
                {child.text}
              </span>
            ))}
          </p>
        );

      case "heading":
        const HeadingTag =
          `h${block.level || 2}` as keyof JSX.IntrinsicElements;
        return (
          <HeadingTag key={index} className="font-bold mb-3 mt-6">
            {block.children.map((child) => child.text).join("")}
          </HeadingTag>
        );

      case "list":
        return (
          <ul key={index} className="list-disc list-inside mb-4">
            {block.children.map((child, childIndex) => (
              <li key={childIndex}>{child.text}</li>
            ))}
          </ul>
        );

      case "quote":
        return (
          <blockquote
            key={index}
            className="border-l-4 border-gray-300 pl-4 italic mb-4"
          >
            {block.children.map((child) => child.text).join("")}
          </blockquote>
        );

      default:
        return null;
    }
  };

  return (
    <div className="extended-bio prose dark:prose-invert max-w-none">
      {blocks.map((block, index) => renderBlock(block, index))}
    </div>
  );
}
