'use client';

import React from 'react';
import { PageSection } from '@/typing/dynamic-page';
import { SectionRenderer } from './SectionRenderer';

interface PageRendererProps {
  sections?: PageSection[];
}

export default function PageRenderer({ sections }: PageRendererProps) {
  if (!sections || sections.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-500">No content available</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {sections.map((section, index) => (
        <SectionRenderer
          key={`section-${index}`}
          section={section}
          index={index}
        />
      ))}
    </div>
  );
}