import React from "react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../../ui/sidebar";
import { LucideIcon } from "lucide-react";
import Link from "next/link";

export type NavItem = {
  title: string;
  url: string;
  icon: LucideIcon;
  active?: boolean;
};

interface INavGroup {
  title: string;
  items: NavItem[];
}

const NavGroup = ({ title, items }: INavGroup) => {
  return (
    <SidebarGroup>
      <SidebarGroupLabel> {title}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item, index) => (
            <SidebarMenuItem key={index}>
              <SidebarMenuButton asChild isActive={item.active}>
                <Link href={item.url}>
                  <item.icon />
                  <span> {item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};

export default NavGroup;
