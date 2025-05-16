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
