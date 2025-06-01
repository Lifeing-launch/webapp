import AppHeader, { Breadcrumb } from "@/components/layout/header";
import React from "react";
import { PageSearch, IPageSearch } from "./page-search";

interface IPageTemplate {
  title?: string;
  children: React.ReactNode;
  breadcrumbs: Breadcrumb[];
  headerIcon?: React.ReactNode;
  searchProps?: IPageSearch;
}

const PageTemplate = ({
  children,
  title,
  breadcrumbs,
  headerIcon,
  searchProps,
}: IPageTemplate) => (
  <div className="w-full">
    <AppHeader breadcrumbs={breadcrumbs} icon={headerIcon} />
    <main>
      <div className="flex flex-col gap-4">
        {title && (
          <div className="flex w-full shrink-0 items-center pt-3 py-4 px-4 border-b">
            <h1 className="text-2xl font-bold flex-1">{title}</h1>
            {searchProps && <PageSearch {...searchProps} />}
          </div>
        )}
        <div className="px-4">{children}</div>
      </div>
    </main>
  </div>
);

export default PageTemplate;
