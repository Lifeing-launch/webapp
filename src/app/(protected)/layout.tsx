import AppSidebar from "@/components/layout/nav/app-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { UserProvider } from "@/components/providers/user-provider";
import { SubscriptionProvider } from "@/components/providers/subscription-provider";
import React from "react";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <UserProvider>
    <SubscriptionProvider>
      <SidebarProvider style={{}}>
        <AppSidebar />
        {/* <SidebarInset> */}
        {children}
        {/* </SidebarInset> */}
      </SidebarProvider>
    </SubscriptionProvider>
  </UserProvider>
);

export default Layout;
