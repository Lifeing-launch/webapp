// SEO Component
export interface PageSEO {
  title: string;
  description: string;
  keywords?: string;
  og_image?: {
    url: string;
    alternativeText?: string;
  };
}

// Hero Banner Component
export interface PageHeroBanner {
  __component: 'page.hero-banner';
  title: string;
  subtitle?: string;
  description?: string;
  background_image?: {
    url: string;
    alternativeText?: string;
  };
  cta_text?: string;
  cta_url?: string;
  height?: 'sm' | 'md' | 'lg' | 'xl';
  image_position?: string;
}

// Content Image Section Component
export interface PageContentImageSection {
  __component: 'page.content-image-section';
  section_id?: string;
  title: string;
  description: string;
  images?: Array<{
    url: string;
    alternativeText?: string;
  }>;
  alignment?: 'left' | 'right';
  slide_interval?: number;
}

// Image Carousel Component
export interface PageImageCarousel {
  __component: 'page.image-carousel';
  images: Array<{
    url: string;
    alternativeText?: string;
  }>;
  interval?: number;
  show_indicators?: boolean;
  show_controls?: boolean;
}

// Pricing Item Component
export interface PagePricingItem {
  item_id?: string;
  title: string;
  subtitle?: string;
  description?: string;
  status?: 'available' | 'booked' | 'coming-soon';
  price_1_label?: string;
  price_1_value?: string;
  price_2_label?: string;
  price_2_value?: string;
}

// Pricing Table Component
export interface PagePricingTable {
  __component: 'page.pricing-table';
  title?: string;
  description?: string;
  booking_url?: string;
  pricing_items?: PagePricingItem[];
  footnote?: string;
}

// Info Section Component
export interface PageInfoSection {
  __component: 'page.info-section';
  title: string;
  paragraphs?: string[];
  footnote?: string;
  cta_text?: string;
  cta_url?: string;
}

// Union type for all page sections
export type PageSection =
  | PageHeroBanner
  | PageContentImageSection
  | PageImageCarousel
  | PagePricingTable
  | PageInfoSection;

// Main Dynamic Page type
export interface DynamicPage {
  id: number;
  title: string;
  slug: string;
  description?: string;
  visibility: 'public' | 'protected';
  navigation: 'sidebar' | 'deeplink' | 'hidden';
  navigation_order?: number;
  navigation_icon?: string;
  seo: PageSEO;
  page_sections?: PageSection[];
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

// API Response types
export interface DynamicPageResponse {
  data: DynamicPage;
  meta: {
    slug: string;
    visibility: string;
    navigation: string;
  };
}

export interface NavigationPageItem {
  title: string;
  slug: string;
  navigation: 'sidebar' | 'deeplink';
  navigation_order: number;
  navigation_icon: string;
  visibility: 'public' | 'protected';
}

export interface NavigationResponse {
  data: NavigationPageItem[];
  meta: {
    total: number;
  };
}