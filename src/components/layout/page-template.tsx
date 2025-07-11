import AppHeader, { Breadcrumb } from "@/components/layout/header";
import React from "react";
import { PageSearch, IPageSearch } from "./page-search";
import { Banner, IBanner } from "../ui/custom/banner";
import { cn } from "@/lib/utils";

interface IPageTemplate {
  title?: string;
  children: React.ReactNode;
  breadcrumbs: Breadcrumb[];
  headerIcon?: React.ReactNode;
  searchProps?: IPageSearch;
  bannerProps?: IBanner;
  hiddenTitle?: boolean;
  classNameChildren?: string;
}

const PageTemplate = ({
  children,
  title,
  breadcrumbs,
  headerIcon,
  searchProps,
  bannerProps,
  hiddenTitle = false,
  classNameChildren,
}: IPageTemplate) => (
  <div className="w-full">
    {bannerProps && <Banner {...bannerProps} />}
    <AppHeader breadcrumbs={breadcrumbs} icon={headerIcon} />
    <main>
      <div className="flex flex-col gap-4">
        {title && (
          <div
            className={cn(
              "flex w-full shrink-0 items-center pt-3 py-4 px-4 border-b",
              hiddenTitle && "py-0"
            )}
          >
            <h1
              className={cn(
                "text-2xl font-bold flex-1",
                hiddenTitle && "hidden"
              )}
            >
              {title}
            </h1>
            {searchProps && <PageSearch {...searchProps} />}
          </div>
        )}
        <div className={cn("px-4", classNameChildren)}>{children}</div>
      </div>
    </main>
  </div>
);

export default PageTemplate;
