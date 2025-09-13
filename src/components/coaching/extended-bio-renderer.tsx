import React, { JSX } from "react";
import { ExtendedBioBlock } from "@/typing/strapi";

interface IExtendedBioRenderer {
  blocks: ExtendedBioBlock[];
}

export function ExtendedBioRenderer({ blocks }: IExtendedBioRenderer) {
  if (!blocks || blocks.length === 0) {
    return null;
  }

  const renderChildren = (children: ExtendedBioBlock["children"]) => {
    if (!children || children.length === 0) return null;

    return children.map((child, childIndex) => {
      if (child.type === "text") {
        return (
          <span
            key={childIndex}
            className={`
              ${child.bold ? "font-bold" : ""}
              ${child.italic ? "italic" : ""}
            `}
          >
            {child.text}
          </span>
        );
      }
      // Handle list-item type
      if (child.type === "list-item" && child.children) {
        return (
          <li key={childIndex} className="ml-4">
            {renderChildren(child.children)}
          </li>
        );
      }
      return null;
    });
  };

  const renderBlock = (block: ExtendedBioBlock, index: number) => {
    switch (block.type) {
      case "paragraph":
        return (
          <p key={index} className="mb-4">
            {renderChildren(block.children)}
          </p>
        );

      case "heading":
        const blockLevel = block.level || 2;
        const HeadingTag = `h${blockLevel}` as keyof JSX.IntrinsicElements;
        const headingClasses: Record<number, string> = {
          1: "text-3xl font-bold mb-4 mt-8",
          2: "text-2xl font-bold mb-3 mt-6",
          3: "text-xl font-semibold mb-3 mt-5",
          4: "text-lg font-semibold mb-2 mt-4",
          5: "text-base font-semibold mb-2 mt-3",
          6: "text-sm font-semibold mb-2 mt-3",
        };
        const headingClass = headingClasses[blockLevel] || headingClasses[2];
        return (
          <HeadingTag key={index} className={headingClass}>
            {renderChildren(block.children)}
          </HeadingTag>
        );

      case "list":
        const ListTag = block.format === "ordered" ? "ol" : "ul";
        const listClasses =
          block.format === "ordered"
            ? "list-decimal ml-6 mb-4"
            : "list-disc ml-6 mb-4";

        return (
          <ListTag key={index} className={listClasses}>
            {renderChildren(block.children)}
          </ListTag>
        );

      case "quote":
        return (
          <blockquote
            key={index}
            className="border-l-4 border-gray-300 pl-4 italic mb-4"
          >
            {renderChildren(block.children)}
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
