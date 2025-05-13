"use client";

import { BadgeCheck, ChevronsUpDown, CreditCard, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { signOutAction } from "@/utils/supabase/actions";
import { createClient } from "@/utils/supabase/browser";
import { useEffect, useState } from "react";

export type UserMetadata = {
  firstName: string;
  lastName: string;
  email: string;
  avatar: string;
};

export function NavUser() {
  const { isMobile } = useSidebar();
  const [user, setUser] = useState<UserMetadata | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const supabase = createClient();

      // Get the logged-in user's ID
      const { data: authData, error: authError } =
        await supabase.auth.getUser();

      if (authError || !authData?.user) {
        console.error("Error fetching user:", authError);
        return;
      }
      const userId = authData.user.id;

      // Query the user_profiles table
      const { data: profileData, error: profileError } = await supabase
        .from("user_profiles")
        .select("first_name, last_name, email, avatar_url")
        .eq("id", userId)
        .single();

      if (profileError || !profileData) {
        console.error("Error fetching user profile:", profileError);
        return;
      }

      setUser({
        firstName: profileData.first_name,
        lastName: profileData.last_name,
        email: profileData.email,
        avatar: profileData.avatar_url || "/fallback-avatar.png",
      });
    };

    fetchUserProfile();
  }, []);

  if (!user)
    return (
      <SidebarMenuItem>
        <SidebarMenuButton onClick={signOutAction} className="cursor-pointer">
          <LogOut />
          Log out
        </SidebarMenuButton>
      </SidebarMenuItem>
    );

  const fullName = `${user?.firstName} ${user?.lastName}`;
  const fallbackAvatar = `${user?.firstName?.[0]}${user?.lastName?.[0]}`;

  return (
    <SidebarMenu data-testid="nav-user">
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-full">
                <AvatarImage src={user.avatar} alt={fullName} />
                <AvatarFallback className="rounded-full">
                  {fallbackAvatar}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{fullName}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-full">
                  <AvatarImage src={user.avatar} alt={fullName} />
                  <AvatarFallback className="rounded-full">
                    {fallbackAvatar}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{fullName}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <BadgeCheck />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCard />
                Billing
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOutAction}>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
