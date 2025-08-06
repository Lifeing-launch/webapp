import { Breadcrumb } from "@/components/layout/header";
import PageTemplate from "@/components/layout/page-template";
import { sidebarIcons } from "@/components/layout/nav/app-sidebar";
import { CoachCard } from "@/components/coaching/coach-card";
import { Coach } from "@/typing/strapi";
import { serverFetch } from "@/utils/fetch";

const breadcrumbs: Breadcrumb[] = [{ label: "Coaching" }];

export default async function CoachingPage() {
  let coaches: Coach[] = [];
  let error: string | null = null;

  try {
    const data: { data?: Coach[] } = await serverFetch("/api/coaches");
    coaches = data.data || [];
  } catch (err) {
    console.error("Error fetching coaches: ", err);
    error = "Failed to load coaches. Please try again later.";
  }

  let content = <></>;

  if (error) {
    content = <p className="text-sm text-red-500">{error}</p>;
  } else if (!coaches.length) {
    content = <p className="text-sm">There are no coaches to display.</p>;
  } else {
    content = (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 auto-rows">
        {coaches.map((coach) => (
          <CoachCard key={coach.id} coach={coach} />
        ))}
      </div>
    );
  }

  return (
    <PageTemplate
      title="Coaching Program"
      breadcrumbs={breadcrumbs}
      headerIcon={sidebarIcons.coachingProgram}
    >
      {content}
    </PageTemplate>
  );
}
