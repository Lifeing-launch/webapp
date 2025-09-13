import { serverFetch } from "@/utils/fetch";
import qs from "qs";
import MindfulModerationContent from "@/components/mindful-moderation/content";
import {
  GroupMeetings,
  HydratedSession,
} from "@/components/mindful-moderation/meetings";
import { createClient } from "@/utils/supabase/server";
import { PlanService } from "@/services/plan";

export default async function MindfulModerationPage() {
  let sessions: HydratedSession[] = [];
  let error: string | null = null;
  let hasAccess: boolean = false;

  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Unauthorized");
    }

    const { data: subscription } = await supabase
      .from("active_subscriptions")
      .select("plan_id, stripe_subscription_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (
      await PlanService.canAccessPlanProtectedPage(
        "/mindful-moderation",
        subscription
      )
    ) {
      hasAccess = true;
    } else {
      throw new Error("Unauthorized");
    }

    const data: { data?: HydratedSession[] } = await serverFetch(
      `/api/mindful-moderation?${qs.stringify({
        hydrateRsvp: true,
      })}`
    );
    sessions = data.data || [];
  } catch (err) {
    console.error("Error fetching sessions: ", err);
    error = "Failed to load sessions. Please try again later.";
  }

  let content = <></>;

  if (error) {
    content = <p className="text-sm text-red-500">{error}</p>;
  } else if (!sessions.length) {
    content = <p className="text-sm">There are no sessions to display.</p>;
  } else {
    content = <GroupMeetings sessions={sessions} />;
  }

  return <MindfulModerationContent content={content} hasAccess={hasAccess} />;
}
