import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../../ui/sidebar";
import {
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

export const sidebarIcons = {
  dashboard: <HeartHandshake />,
  meetings: <Calendar />,
  coachingProgram: <BookOpen />,
  communityForum: <UsersRound />,
  drinkLog: <Wine />,
  resources: <BookMarked />,
  podcast: <Podcast />,
  account: <UserRoundCog />,
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
        title: "Community Forum",
        url: "/community-forum",
        icon: sidebarIcons.communityForum,
      },
    ],
    resources: [
      {
        title: "Resources",
        url: "/resources",
        icon: sidebarIcons.resources,
      },
      {
        title: "Audio Resources",
        url: "/audio-resources",
        icon: sidebarIcons.podcast,
      },
    ],
    programs: [
      {
        title: "Drink Log",
        url: "/drink-log",
        icon: sidebarIcons.drinkLog,
      },
    ],
  },
};

const AppSidebar = () => {
  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <Image
                  src="/lifeing-logo-white.svg"
                  alt="Lifeing Logo"
                  width={100}
                  height={60}
                />
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavGroup title="My Lifeing" items={data.navItems.myLifeing} />
        <NavGroup title="Programs" items={data.navItems.programs} />
        <NavGroup title="Resources" items={data.navItems.resources} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
