import dynamic from 'next/dynamic';
import { PageSection } from '@/typing/dynamic-page';

// Lazy load components for better performance
const AnnouncementSection = dynamic(
  () => import('@/components/retreats/AnnouncementSection'),
  { ssr: true }
);

const ContentImageSection = dynamic(
  () => import('@/components/retreats/ContentImageSection'),
  { ssr: true }
);

const ImageCarousel = dynamic(
  () => import('@/components/retreats/ImageCarousel'),
  { ssr: true }
);

const PricingSection = dynamic(
  () => import('@/components/retreats/PricingSection'),
  { ssr: true }
);

const RetreatRoomsSection = dynamic(
  () => import('@/components/retreats/RetreatRoomsSection'),
  { ssr: true }
);

// Component mapping based on Strapi component name
export const componentMap = {
  'page.hero-banner': AnnouncementSection,
  'page.content-image-section': ContentImageSection,
  'page.image-carousel': ImageCarousel,
  'page.pricing-table': PricingSection,
  'page.info-section': RetreatRoomsSection,
} as const;

// Helper function to get component by name
export function getComponentByName(componentName: string) {
  return componentMap[componentName as keyof typeof componentMap];
}

// Helper to transform Strapi data to component props
export function transformSectionData(section: PageSection) {
  switch (section.__component) {
    case 'page.hero-banner':
      return {
        title: section.title,
        subtitle: section.subtitle || '',
        description: section.description || '',
        ctaText: section.cta_text || '',
        backgroundImage: section.background_image?.url || '',
      };

    case 'page.content-image-section':
      return {
        data: {
          id: section.section_id || '',
          title: section.title || '',
          description: section.description || '',
          images: section.images?.map((img: { url: string }) => img.url) || [],
          alignment: section.alignment || 'left',
          imageSlideInterval: section.slide_interval || 10000,
        }
      };

    case 'page.image-carousel':
      return {
        images: section.images.map(img => img.url),
        interval: section.interval || 9000,
      };

    case 'page.pricing-table':
      return {
        pricing: section.pricing_items?.map(item => ({
          id: item.item_id || '',
          title: item.title,
          subtitle: item.subtitle || '',
          description: item.description || '',
          status: item.status || 'available',
          price1: {
            label: item.price_1_label || '',
            value: item.price_1_value || '',
          },
          price2: {
            label: item.price_2_label || '',
            value: item.price_2_value || '',
          },
        })) || [],
        bookingUrl: section.booking_url || '',
      };

    case 'page.info-section':
      return {
        title: section.title,
        paragraphs: section.paragraphs || [],
        footnote: section.footnote || '',
        ctaText: section.cta_text || '',
      };

    default:
      return {};
  }
}