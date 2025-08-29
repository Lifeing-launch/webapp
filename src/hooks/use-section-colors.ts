"use client";

import { usePathname } from "next/navigation";

export type SectionType =
  | "meetings"
  | "audio-resources"
  | "resources"
  | "community-forum"
  | "book-club"
  | "default";

export interface SectionColors {
  sidebar: string;
  sidebarForeground: string;
  primary: string;
  accent: string;
  ring: string;
}

export const SECTION_COLORS: Record<SectionType, SectionColors> = {
  meetings: {
    sidebar: "var(--section-purple)",
    sidebarForeground: "var(--section-purple-foreground)",
    primary: "var(--section-purple)",
    accent: "var(--section-purple)",
    ring: "var(--section-purple-foreground)",
  },
  "audio-resources": {
    sidebar: "var(--section-purple)",
    sidebarForeground: "var(--section-purple-foreground)",
    primary: "var(--section-purple)",
    accent: "var(--section-purple)",
    ring: "var(--section-purple-foreground)",
  },
  resources: {
    sidebar: "var(--section-brown)",
    sidebarForeground: "var(--section-brown-foreground)",
    primary: "var(--section-brown)",
    accent: "var(--section-brown)",
    ring: "var(--section-brown-foreground)",
  },
  "community-forum": {
    sidebar: "var(--section-brown)",
    sidebarForeground: "var(--section-brown-foreground)",
    primary: "var(--section-brown)",
    accent: "var(--section-brown)",
    ring: "var(--section-brown-foreground)",
  },
  "book-club": {
    sidebar: "var(--section-brown)",
    sidebarForeground: "var(--section-brown-foreground)",
    primary: "var(--section-brown)",
    accent: "var(--section-brown)",
    ring: "var(--section-brown-foreground)",
  },
  default: {
    sidebar: "var(--primary)",
    sidebarForeground: "var(--sidebar-foreground)",
    primary: "var(--sidebar-primary)",
    accent: "var(--sidebar-accent)",
    ring: "var(--sidebar-ring)",
  },
};

export const useSectionColors = (): {
  section: SectionType;
  colors: SectionColors;
} => {
  const pathname = usePathname();

  const section: SectionType = (() => {
    if (pathname.startsWith("/meetings")) return "meetings";
    if (pathname.startsWith("/audio-resources")) return "audio-resources";
    if (pathname.startsWith("/resources")) return "resources";
    if (pathname.startsWith("/community-forum")) return "community-forum";
    if (pathname.startsWith("/book-club")) return "book-club";
    return "default";
  })();

  return {
    section,
    colors: SECTION_COLORS[section],
  };
};
