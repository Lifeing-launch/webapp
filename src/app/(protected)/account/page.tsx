import { Breadcrumb } from "@/components/layout/header";
import PageTemplate from "@/components/layout/page-template";
import React from "react";
import { sidebarIcons } from "@/components/layout/nav/app-sidebar";
import { AccountSettings } from "@/components/account/settings";

const breadcrumbs: Breadcrumb[] = [{ label: "Account Settings" }];

const SettingsPage = () => {
  return (
    <PageTemplate
      title="Account Settings"
      breadcrumbs={breadcrumbs}
      headerIcon={sidebarIcons.account}
    >
      <AccountSettings />
    </PageTemplate>
  );
};

export default SettingsPage;
