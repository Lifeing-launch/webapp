"use client";

import { ChevronsUpDown, CreditCard, LogOut, UserRoundCog } from "lucide-react";
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
import Link from "next/link";
import { UserAvatar } from "./user-avatar";
import { useUser } from "@/components/providers/user-provider";

export function NavUser() {
  const { isMobile } = useSidebar();
  const { profile, loading } = useUser();

  if (loading || !profile)
    return (
      <SidebarMenu data-testid="nav-user">
        <SidebarMenuItem data-testid="nav-user-partial">
          <SidebarMenuButton onClick={signOutAction} className="cursor-pointer">
            <LogOut />
            Log out
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );

  const fullName = `${profile?.first_name || ""} ${profile?.last_name || ""}`;

  return (
    <SidebarMenu data-testid="nav-user">
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <UserAvatar user={profile} />
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{fullName}</span>
                <span className="truncate text-xs">{profile?.email}</span>
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
                <UserAvatar user={profile} />
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{fullName}</span>
                  <span className="truncate text-xs">{profile?.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <Link href={"/account"}>
                <DropdownMenuItem>
                  <UserRoundCog />
                  Account Settings
                </DropdownMenuItem>
              </Link>
              <Link href={"/subscription/manage"}>
                <DropdownMenuItem>
                  <CreditCard />
                  Billing
                </DropdownMenuItem>
              </Link>
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
