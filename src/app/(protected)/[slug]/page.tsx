import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import PageBanner from '@/components/layout/page-banner';
import PageRenderer from '@/components/page-builder/PageRenderer';
import { DynamicPageService } from '@/services/dynamic-page.service';

interface DynamicPageProps {
  params: {
    slug: string;
  };
}

// Generate metadata for SEO
export async function generateMetadata({ params }: DynamicPageProps): Promise<Metadata> {
  const pageData = await DynamicPageService.getPageBySlug(params.slug);

  if (!pageData) {
    return {
      title: 'Page Not Found',
      description: 'The requested page could not be found.',
    };
  }

  const { seo } = pageData.data;

  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    openGraph: {
      title: seo.title,
      description: seo.description,
      images: seo.og_image ? [{ url: seo.og_image.url }] : undefined,
    },
  };
}

export default async function ProtectedDynamicPage({ params }: DynamicPageProps) {
  const pageData = await DynamicPageService.getPageBySlug(params.slug);

  if (!pageData) {
    notFound();
  }

  const { data, meta } = pageData;

  // Only show protected pages in this route
  if (meta.visibility !== 'protected') {
    notFound();
  }

  // Find hero banner section for page banner
  const heroBanner = data.page_sections?.find(
    section => section.__component === 'page.hero-banner'
  );

  return (
    <>
      {heroBanner && (
        <PageBanner
          title={heroBanner.title}
          backgroundImage={heroBanner.background_image?.url}
          height={heroBanner.height || 'lg'}
          imagePosition={heroBanner.image_position || '50% 50%'}
        />
      )}

      <div className="w-full h-full flex flex-col flex-1">
        <PageRenderer sections={data.page_sections} />
      </div>
    </>
  );
}