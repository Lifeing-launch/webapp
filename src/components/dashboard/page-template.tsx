import AppHeader, { Breadcrumb } from "@/components/dashboard/header";
import React from "react";
import { PageHeader } from "./page-header";

interface IPageTemplate {
  title: string;
  children: React.ReactNode;
  breadcrumbs: Breadcrumb[];
}

const PageTemplate = ({ children, title, breadcrumbs }: IPageTemplate) => (
  <div className="w-full">
    <AppHeader breadcrumbs={breadcrumbs} />
    <main>
      <PageHeader title={title}>
        <div className="px-4">{children}</div>
      </PageHeader>
    </main>
  </div>
);

export default PageTemplate;
