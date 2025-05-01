import AppHeader from "@/components/dashboard/header";
import AppSidebar from "@/components/dashboard/nav/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import React from "react";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <SidebarProvider style={{}}>
    <AppSidebar />
    <main className="w-full">
      <AppHeader />
      {children}
    </main>
  </SidebarProvider>
);

export default Layout;
