import { cn } from "@/lib/utils";

export interface IBanner {
  message: string;
  type?: "error" | "warning" | "info";
}
export const Banner = ({ message, type = "info" }: IBanner) => {
  let bannerStyles;

  switch (type) {
    case "warning":
      bannerStyles = "bg-yellow-500 text-black";
      break;
    case "error":
      bannerStyles = "bg-red-800 text-white";
      break;
    default:
      bannerStyles = "bg-blue-300 text-black";
  }

  return (
    <aside
      role="banner"
      aria-label="Announcement"
      className={cn(
        "relative flex items-center py-3 pr-8 pl-6 text-center",
        bannerStyles
      )}
    >
      <p className="text-sm w-full">{message}</p>
    </aside>
  );
};
