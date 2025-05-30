import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Fragment, ReactNode } from "react";

export interface Breadcrumb {
  label: string;
  href?: string;
}

interface AppHeader {
  breadcrumbs?: Breadcrumb[];
  icon?: ReactNode;
}

export default function AppHeader({ breadcrumbs, icon }: AppHeader) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2  border-b">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" icon={icon} />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="/dashboard">My Lifeing</BreadcrumbLink>
            </BreadcrumbItem>
            {breadcrumbs?.map((breadcrumb, index) => (
              <Fragment key={index}>
                <BreadcrumbSeparator className="hidden md:block" />

                {index < breadcrumbs.length - 1 ? (
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href={breadcrumb.href}>
                      {breadcrumb.label}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                ) : (
                  <BreadcrumbItem>
                    <BreadcrumbPage>{breadcrumb.label}</BreadcrumbPage>
                  </BreadcrumbItem>
                )}
              </Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
  );
}
