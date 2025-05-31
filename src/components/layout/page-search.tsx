"use client";

import { useEffect, useState } from "react";
import { CustomInput } from "../ui/custom/input";
import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "@/hooks/use-debounce";

export interface IPageSearch {
  label: string;
}

export const PARAM_KEY_SEARCH = "q";

export function PageSearch({ label }: IPageSearch) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 500);

  useEffect(() => {
    const newSearchParams = new URLSearchParams(searchParams);
    if (!debouncedQuery) {
      newSearchParams.delete(PARAM_KEY_SEARCH);
    } else {
      newSearchParams.set(PARAM_KEY_SEARCH, debouncedQuery);
    }
    router.push(`${pathname}?${newSearchParams.toString()}`);
  }, [debouncedQuery, searchParams, router, pathname]);

  return (
    <div>
      <div className="sr-only">
        <label htmlFor="search-input">{label}</label>
      </div>
      <CustomInput
        id="search-input"
        placeholder={label}
        startIcon={Search}
        className="w-xs text-sm"
        onChange={(e) => setQuery(e.target.value)}
      />
    </div>
  );
}
