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

const data = {
  navItems: {
    myLifeing: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: HeartHandshake,
      },
      {
        title: "My Meetings",
        url: "/meetings",
        icon: Calendar,
        active: true,
      },
      {
        title: "Coaching Program",
        url: "#",
        icon: BookOpen,
      },
      {
        title: "Community Forum",
        url: "#",
        icon: UsersRound,
      },
    ],
    resources: [
      {
        title: "Resources",
        url: "#",
        icon: BookMarked,
      },
      {
        title: "The Podcast",
        url: "#",
        icon: Podcast,
      },
    ],
  },
};

const AppSidebar = () => {
  return (
    <Sidebar className="bg-lime-100">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <Image
                  src="/lifeing-logo-full.svg"
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
