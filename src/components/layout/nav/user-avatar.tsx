import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FallbackAvatar } from "@/components/account/fallback-avatar";
import { UserProfile } from "@/typing/supabase";

export const UserAvatar = ({ user }: { user: UserProfile }) => {
  const userInitials = `${user?.first_name?.[0] || "?"}${user?.last_name?.[0] || "?"}`;
  const fullName = `${user?.first_name || ""} ${user?.last_name || ""}`.trim();

  return (
    <Avatar className="h-8 w-8 rounded-full overflow-hidden">
      <AvatarImage
        src={user.avatar_url || undefined}
        alt={fullName}
        className="object-cover w-full h-full"
      />
      <AvatarFallback className="rounded-full">
        <FallbackAvatar userInitials={userInitials} />
      </AvatarFallback>
    </Avatar>
  );
};
