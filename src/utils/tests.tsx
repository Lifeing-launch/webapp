import { render, RenderOptions } from "@testing-library/react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

// Mock UserProvider to avoid Supabase ES module issues
const MockUserProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

const AllProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <MockUserProvider>
        <SidebarProvider>{children}</SidebarProvider>
      </MockUserProvider>
    </QueryClientProvider>
  );
};

const customRender = (ui: React.ReactNode, options?: RenderOptions) =>
  render(ui, { wrapper: AllProviders, ...options });

export * from "@testing-library/react";
export { customRender as render };
