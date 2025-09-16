import { DynamicPageResponse, NavigationResponse } from '@/typing/dynamic-page';

const API_BASE_URL = process.env.NEXT_PUBLIC_CMS_URL || 'http://localhost:1337';

export class DynamicPageService {
  static async getPageBySlug(slug: string): Promise<DynamicPageResponse | null> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/dynamic-pages/slug/${slug}`,
        {
          next: { revalidate: 60 }, // ISR - revalidate every 60 seconds
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Failed to fetch page: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching dynamic page:', error);
      return null;
    }
  }

  static async getNavigationPages(): Promise<NavigationResponse | null> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/dynamic-pages/navigation`,
        {
          next: { revalidate: 60 },
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch navigation: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching navigation pages:', error);
      return null;
    }
  }

  static async getAllPageSlugs(): Promise<string[]> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/dynamic-pages?fields[0]=slug&pagination[limit]=100`,
        {
          next: { revalidate: 3600 }, // Revalidate every hour
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch page slugs: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data.map((page: any) => page.slug);
    } catch (error) {
      console.error('Error fetching page slugs:', error);
      return [];
    }
  }
}