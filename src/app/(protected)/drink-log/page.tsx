import DrinkLogClient from "@/components/drink-log/drink-log-client";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import PageTemplate from "@/components/layout/page-template";
import { Wine } from "lucide-react";

export default async function DrinkLogPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const resolvedSearchParams = await searchParams;
  const view = resolvedSearchParams.view || "week";

  return (
    <PageTemplate
      title="Drink Log"
      hiddenTitle={true}
      breadcrumbs={[
        // { label: "Lifeing", href: "/" },
        { label: "Live More Drink Less", href: "/drink-log" },
      ]}
      headerIcon={<Wine className="h-5 w-5" />}
    >
      <DrinkLogClient userId={user.id} initialView={view} />
    </PageTemplate>
  );
}
