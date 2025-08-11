import DrinkLogClient from "@/components/drink-log/drink-log-client";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import PageBanner from "@/components/layout/page-banner";

const BANNER_IMAGE = "/images/banners/drink-log.png";

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
    <div className="w-full">
      <PageBanner
        title="Drink Log"
        className="mb-0"
        backgroundImage={BANNER_IMAGE}
      />
      <main className="p-4">
        <DrinkLogClient userId={user.id} initialView={view} />
      </main>
    </div>
  );
}
