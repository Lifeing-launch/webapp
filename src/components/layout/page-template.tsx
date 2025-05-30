import AppHeader, { Breadcrumb } from "@/components/layout/header";
import React from "react";
import { PageHeader } from "./page-header";

interface IPageTemplate {
  title: string;
  children: React.ReactNode;
  breadcrumbs: Breadcrumb[];
  headerIcon?: React.ReactNode;
}

const PageTemplate = ({
  children,
  title,
  breadcrumbs,
  headerIcon,
}: IPageTemplate) => (
  <div className="w-full">
    <AppHeader breadcrumbs={breadcrumbs} icon={headerIcon} />
    <main>
      <PageHeader title={title}>
        <div className="px-4">{children}</div>
      </PageHeader>
    </main>
  </div>
);

export default PageTemplate;
