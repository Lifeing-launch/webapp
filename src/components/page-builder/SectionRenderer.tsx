'use client';

import React from 'react';
import { PageSection } from '@/typing/dynamic-page';
import { getComponentByName, transformSectionData } from '@/utils/component-mapper';

interface SectionRendererProps {
  section: PageSection;
  index: number;
}

export function SectionRenderer({ section, index }: SectionRendererProps) {
  const Component = getComponentByName(section.__component);

  if (!Component) {
    console.warn(`Component not found for: ${section.__component}`);
    return null;
  }

  const props = transformSectionData(section);

  return (
    <div className="section-wrapper" data-section={section.__component}>
      <Component {...props} />
    </div>
  );
}