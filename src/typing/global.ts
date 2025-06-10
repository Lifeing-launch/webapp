export type StrapiMeta = {
  pagination: {
    page: number;
    pageSize: number;
    pageCount: number;
    total: number;
  };
};

export type Plan = {
  id: number;
  name: string;
  price: number;
  isMostPopular?: boolean;
  benefits: string[];
};
