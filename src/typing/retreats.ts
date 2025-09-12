export interface RetreatAnnouncement {
  title: string;
  subtitle: string;
  description: string;
  ctaText: string;
  backgroundImage: string;
}

export interface ContentSection {
  id: string;
  title: string;
  description: string;
  images: string[];
  alignment: "left" | "right";
  imageSlideInterval?: number;
}

export interface PricingItem {
  id: string;
  title: string;
  subtitle?: string;
  status: "available" | "coming-soon" | "booked";
  price1: {
    label: string;
    value: string;
  };
  price2: {
    label: string;
    value: string;
  };
  description?: string;
}

export interface RetreatCarousel {
  images: string[];
  interval?: number;
}

export interface RetreatRoomsInfo {
  title: string;
  paragraphs: string[];
  footnote: string;
  ctaText: string;
}

export interface RetreatData {
  announcement: RetreatAnnouncement;
  contentSections: ContentSection[];
  retreatRooms: RetreatRoomsInfo;
  carousel: RetreatCarousel;
  pricing: PricingItem[];
  bookingUrl: string;
  seo: {
    title: string;
    description: string;
  };
}
