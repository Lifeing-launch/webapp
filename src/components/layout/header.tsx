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
import { Fragment } from "react";

export interface Breadcrumb {
  label: string;
  href?: string;
}

interface AppHeader {
  breadcrumbs?: Breadcrumb[];
}

export default function AppHeader({ breadcrumbs }: AppHeader) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2  border-b">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="#">My Lifeing</BreadcrumbLink>
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
