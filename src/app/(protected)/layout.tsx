import AppSidebar from "@/components/layout/nav/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import React from "react";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <SidebarProvider style={{}}>
    <AppSidebar />
    {children}
  </SidebarProvider>
);

export default Layout;
