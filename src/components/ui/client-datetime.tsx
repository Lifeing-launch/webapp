"use client";

import { useEffect, useState } from "react";
import { formatDateTime, formatDate, formatTime } from "@/utils/datetime";

interface IClientDateTime {
  date: Date | string;
  format?: "datetime" | "date" | "time";
  className?: string;
  fallback?: string;
}

/**
 * Client-side datetime component that handles timezone correctly.
 * This component prevents SSR/CSR mismatch by only rendering the
 * timezone-aware date after hydration.
 */
export function ClientDateTime({
  date,
  format = "datetime",
  className,
  fallback = "Loading...",
}: IClientDateTime) {
  const [mounted, setMounted] = useState(false);
  const [formattedDate, setFormattedDate] = useState<string>(fallback);

  useEffect(() => {
    setMounted(true);

    // Format the date with user's timezone after mount
    const dateObj = typeof date === "string" ? new Date(date) : date;

    let formatted: string;
    switch (format) {
      case "date":
        formatted = formatDate(dateObj);
        break;
      case "time":
        formatted = formatTime(dateObj);
        break;
      default:
        formatted = formatDateTime(dateObj);
        break;
    }

    setFormattedDate(formatted);
  }, [date, format]);

  // Show fallback until component is mounted (prevents hydration mismatch)
  if (!mounted) {
    return <span className={className}>{fallback}</span>;
  }

  return <span className={className}>{formattedDate}</span>;
}

export default ClientDateTime;
