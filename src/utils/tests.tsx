import { render, RenderOptions } from "@testing-library/react";
import { SidebarProvider } from "@/components/ui/sidebar"; // adjust the path as needed

const AllProviders = ({ children }: { children: React.ReactNode }) => {
  return <SidebarProvider>{children}</SidebarProvider>;
};

const customRender = (ui: React.ReactNode, options?: RenderOptions) =>
  render(ui, { wrapper: AllProviders, ...options });

export * from "@testing-library/react";
export { customRender as render };
