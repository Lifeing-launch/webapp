import { Breadcrumb } from "@/components/layout/header";
import PageTemplate from "@/components/layout/page-template";
import { sidebarIcons } from "@/components/layout/nav/app-sidebar";
import CoachingSkeleton from "@/components/coaching/skeleton";

const breadcrumbs: Breadcrumb[] = [{ label: "Coaching" }];

export default function CoachingLoading() {
  return (
    <PageTemplate
      title="Coaching Program"
      breadcrumbs={breadcrumbs}
      headerIcon={sidebarIcons.coachingProgram}
    >
      <CoachingSkeleton />
    </PageTemplate>
  );
}
