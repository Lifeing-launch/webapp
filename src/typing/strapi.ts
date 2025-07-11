import { BlocksContent } from "@strapi/blocks-react-renderer";

export type ResourceCategory = "visual" | "audio";
export type ResourceType =
  | "article"
  | "document"
  | "video"
  | "meditation"
  | "podcast"
  | "relaxation";

export type Resource = {
  id: number;
  documentId: string;
  title: string;
  description: string;
  category: ResourceCategory;
  type: ResourceType;
  slug: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  is_published: boolean;
  duration?: string | null;
  url?: string | null;
  cover_img?: Image | null;
  article?: Article;
};

export type Image = {
  id: number;
  documentId: string;
  name: string;
  alternativeText?: string | null;
  caption?: string | null;
  width: number;
  height: number;
  formats: Record<string, never>;
  hash: string;
  ext: string;
  mime: string;
  size: number;
  url: string;
  previewUrl?: string | null;
  provider: string;
  provider_metadata: Record<string, never>;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
};

export type Article = {
  id: number;
  documentId: string;
  body: BlocksContent;
};

export type Coach = {
  id: number;
  name: string;
  summary: string;
  focus_areas: string[];
  booking_url: string;
  experience_in_years: number;
  avatar?: Image;
};

export type SubscriptionPlanStatus = "DRAFT" | "ACTIVE" | "RETIRED";

export type SubscriptionPlan = {
  id: number;
  name: string;
  is_most_popular: boolean;
  plan_status: SubscriptionPlanStatus;
  stripe_price_monthly_id: string;
  stripe_price_yearly_id: string;
  price_monthly: number;
  price_yearly: number;
  features: { id: number; label: string }[];
};

export type MeetingType = "group" | "webinar" | "oneToOne" | "one-to-one";

export type Meeting = {
  id: number;
  title: string;
  description: string | null;
  meeting_type: MeetingType;
  url: string | null;
  when: string;
};

export type Pagination = {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
};

export type Metadata = {
  pagination: Pagination;
};
