import { useEffect, useState } from "react";

interface DrinkCatalog {
  drinkTypes: Array<{ id: number; name: string }>;
  drinkBrands: Array<{ id: number; name: string; drink_type_id: number }>;
  moods: Array<{ id: number; name: string }>;
  triggers: Array<{ id: number; name: string }>;
  locations: Array<{ id: number; name: string }>;
}

export function useDrinkCatalog() {
  const [catalog, setCatalog] = useState<DrinkCatalog | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const response = await fetch("/api/drink-log/catalog");
        if (!response.ok) {
          throw new Error("Failed to fetch catalog");
        }
        const data = await response.json();
        setCatalog(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCatalog();
  }, []);

  return { catalog, isLoading, error };
}
