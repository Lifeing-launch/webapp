import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserMetadata } from "./nav-user";
import { FallbackAvatar } from "@/components/account/fallback-avatar";

export const UserAvatar = ({ user }: { user: UserMetadata }) => {
  const userInitials = `${user?.firstName?.[0] || "?"}${user?.lastName?.[0] || "?"}`;
  const fullName = `${user?.firstName || ""} ${user?.lastName || ""}`.trim();

  return (
    <Avatar className="h-8 w-8 rounded-full overflow-hidden">
      <AvatarImage
        src={user.avatarUrl || undefined}
        alt={fullName}
        className="object-cover w-full h-full"
      />
      <AvatarFallback className="rounded-full">
        <FallbackAvatar userInitials={userInitials} />
      </AvatarFallback>
    </Avatar>
  );
};
