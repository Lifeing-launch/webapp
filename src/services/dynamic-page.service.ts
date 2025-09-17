import { DynamicPageResponse, NavigationResponse } from "@/typing/dynamic-page";
import { getStrapiBaseUrl } from "@/utils/urls";
import { strapiFetch } from "@/utils/fetch";

export class DynamicPageService {
  static async getPageBySlug(
    slug: string
  ): Promise<DynamicPageResponse | null> {
    try {
      // Call Strapi directly from server-side
      // For now, we'll just fetch public pages
      // Protected pages will be handled by middleware
      const strapiUrl = `${getStrapiBaseUrl()}/dynamic-pages/slug/${slug}`;
      const data = await strapiFetch(strapiUrl);
      return data;
    } catch (error) {
      // If it's an authentication error, the page is protected
      // Return null and let middleware handle the redirect
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      if (errorMessage.includes("Esta página requer autenticação")) {
        console.log(`Page ${slug} is protected, returning null`);
        return null;
      }
      console.error("Error fetching dynamic page:", error);
      return null;
    }
  }

  static async getNavigationPages(): Promise<NavigationResponse | null> {
    try {
      const strapiUrl = `${getStrapiBaseUrl()}/dynamic-pages/navigation`;
      const data = await strapiFetch(strapiUrl);
      return data;
    } catch (error) {
      console.error("Error fetching navigation pages:", error);
      return null;
    }
  }

  static async getAllPageSlugs(): Promise<string[]> {
    try {
      const strapiUrl = `${getStrapiBaseUrl()}/dynamic-pages?fields[0]=slug&pagination[limit]=100`;
      const data = await strapiFetch(strapiUrl);
      return data.data.map((page: { slug: string }) => page.slug);
    } catch (error) {
      console.error("Error fetching page slugs:", error);
      return [];
    }
  }
}
