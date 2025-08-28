"use client";

import React, { ReactNode } from "react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../../ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";

export type NavItem = {
  title: string;
  url: string;
  icon: ReactNode;
  active?: boolean;
};

interface INavGroup {
  title: string;
  items: NavItem[];
  onItemClick?: () => void;
}

const NavGroup = ({ title, items, onItemClick }: INavGroup) => {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupLabel> {title}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item, index) => (
            <SidebarMenuItem key={index}>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith(item.url)}
              >
                <Link href={item.url} onClick={() => onItemClick?.()}>
                  {item.icon}
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
