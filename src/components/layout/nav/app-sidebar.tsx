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
  UsersRound,
} from "lucide-react";
import Image from "next/image";
import NavGroup from "./nav-group";
import { NavUser } from "./nav-user";

export const sidebarIcons = {
  dashboard: <HeartHandshake />,
  meetings: <Calendar />,
  coachingProgram: <BookOpen />,
  communityForum: <UsersRound />,
  resources: <BookMarked />,
  podcast: <Podcast />,
};

const data = {
  navItems: {
    myLifeing: [
      {
        title: "Dashboard",
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
        url: "#",
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
                  src="/lifeing-logo.svg"
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
        <NavGroup title="Resources" items={data.navItems.resources} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
