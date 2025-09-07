export function datetimeIsWithinInterval(
  dateTime: string,
  intervalInMinutes: number
): boolean {
  const now = new Date();
  const targetTime = new Date(dateTime);
  const differenceInMilliseconds = Math.abs(
    targetTime.getTime() - now.getTime()
  );
  const differenceInMinutes = differenceInMilliseconds / (1000 * 60);
  return differenceInMinutes <= intervalInMinutes;
}

export const formatDate = (date: Date) => {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

/**
 * Format a date in relative time (ex: "10 min ago", "1 hour ago")
 * @param dateString - Date in ISO string or Date object
 * @returns String in relative time format
 */
export const formatTimeAgo = (dateString: string | Date): string => {
  const now = new Date();
  const date =
    typeof dateString === "string" ? new Date(dateString) : dateString;

  if (isNaN(date.getTime())) {
    return typeof dateString === "string" ? dateString : "";
  }

  const diffInMilliseconds = now.getTime() - date.getTime();
  const diffInSeconds = Math.floor(diffInMilliseconds / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  const diffInWeeks = Math.floor(diffInDays / 7);
  const diffInMonths = Math.floor(diffInDays / 30);
  const diffInYears = Math.floor(diffInDays / 365);

  // If it's in the future, show "in X time"
  if (diffInMilliseconds < 0) {
    const absDiffInSeconds = Math.abs(diffInSeconds);
    const absDiffInMinutes = Math.abs(diffInMinutes);
    const absDiffInHours = Math.abs(diffInHours);
    const absDiffInDays = Math.abs(diffInDays);

    if (absDiffInSeconds < 60) return "in a few seconds";
    if (absDiffInMinutes < 60) return `in ${absDiffInMinutes} min`;
    if (absDiffInHours < 24)
      return `in ${absDiffInHours} hour${absDiffInHours > 1 ? "s" : ""}`;
    return `in ${absDiffInDays} day${absDiffInDays > 1 ? "s" : ""}`;
  }

  // If it's in the past, show "X time ago"
  if (diffInSeconds < 60) return "just now";
  if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
  if (diffInHours < 24)
    return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
  if (diffInDays < 7)
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
  if (diffInWeeks < 4)
    return `${diffInWeeks} week${diffInWeeks > 1 ? "s" : ""} ago`;
  if (diffInMonths < 12)
    return `${diffInMonths} month${diffInMonths > 1 ? "s" : ""} ago`;

  return `${diffInYears} year${diffInYears > 1 ? "s" : ""} ago`;
};
