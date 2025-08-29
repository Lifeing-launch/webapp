"use client";

import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "../../ui/sidebar";
import {
  Book,
  BookMarked,
  BookOpen,
  Calendar,
  HeartHandshake,
  Podcast,
  UserRoundCog,
  UsersRound,
  Wine,
} from "lucide-react";
import Image from "next/image";
import NavGroup from "./nav-group";
import { NavUser } from "./nav-user";
import Link from "next/link";
import { useSectionColors } from "@/hooks/use-section-colors";

export const sidebarIcons = {
  dashboard: <HeartHandshake />,
  meetings: <Calendar />,
  coachingProgram: <BookOpen />,
  communityForum: <UsersRound />,
  drinkLog: <Wine />,
  resources: <BookMarked />,
  podcast: <Podcast />,
  account: <UserRoundCog />,
  bookClub: <Book />,
};

const data = {
  navItems: {
    myLifeing: [
      {
        title: "Living Room",
        url: "/dashboard",
        icon: sidebarIcons.dashboard,
      },
      {
        title: "My Meetings",
        url: "/meetings",
        icon: sidebarIcons.meetings,
      },
      {
        title: "Coaching Program",
        url: "/coaching",
        icon: sidebarIcons.coachingProgram,
      },
      {
        title: "Lifeing Lounge",
        url: "/community-forum",
        icon: sidebarIcons.communityForum,
      },
    ],
    resources: [
      {
        title: "Library",
        url: "/resources",
        icon: sidebarIcons.resources,
      },
      {
        title: "Audio Library",
        url: "/audio-resources",
        icon: sidebarIcons.podcast,
      },
    ],
    tools: [
      {
        title: "Drink Log",
        url: "/drink-log",
        icon: sidebarIcons.drinkLog,
      },
    ],
    events: [
      {
        title: "Book Club",
        url: "/book-club",
        icon: sidebarIcons.bookClub,
      },
    ],
  },
};

const AppSidebar = () => {
  const { colors } = useSectionColors();
  const { setOpenMobile, isMobile } = useSidebar();

  const handleItemClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const sidebarStyle = {
    "--sidebar": colors.sidebar,
    "--sidebar-foreground": colors.sidebarForeground,
    "--sidebar-primary": colors.primary,
    "--sidebar-accent": colors.accent,
    "--sidebar-ring": colors.ring,
  } as React.CSSProperties;

  return (
    <Sidebar style={sidebarStyle}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard" onClick={handleItemClick}>
                <Image
                  src="/images/logo/lifeing-white.svg"
                  alt="Lifeing Logo"
                  width={100}
                  height={60}
                />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavGroup
          title="My Lifeing"
          items={data.navItems.myLifeing}
          onItemClick={handleItemClick}
        />
        <NavGroup
          title="Tools"
          items={data.navItems.tools}
          onItemClick={handleItemClick}
        />
        <NavGroup
          title="Resources"
          items={data.navItems.resources}
          onItemClick={handleItemClick}
        />
        <NavGroup
          title="Upcoming Events"
          items={data.navItems.events}
          onItemClick={handleItemClick}
        />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
