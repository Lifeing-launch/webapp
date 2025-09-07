"use client";

import PageBanner from "@/components/layout/page-banner";
import { useSectionColors } from "@/hooks/use-section-colors";
import Link from "next/link";

const BANNER_IMAGE = "/images/banners/meetings.png";

export default function MindfulModerationContent({
  content,
  hasAccess,
}: {
  content: React.ReactNode;
  hasAccess: boolean;
}) {
  const { colors } = useSectionColors();

  const displayContent = () => {
    if (!hasAccess) {
      return (
        <p>
          Mindful Moderation is available exclusively for Lifeing Members with
          the Elevate Package and above.{" "}
          <Link href="/subscription/manage" className="underline text-primary">
            Upgrade your membership to access this offering.
          </Link>
        </p>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="text-sm">
          <h2 className="text-xl mb-2">
            Mindful Moderation: Exclusively for Lifeing Members with the Elevate
            Package
          </h2>
          <p className="mb-2">
            Group coaching support and empowerment to mindfully transform your
            relationship with alcohol; whether you're exploring, reducing,
            resetting, quitting, or fine-tuning mindful moderation strategies.
            Coaching in real-time, accountability, and evidence based tools to
            move confidently from where you are to where you want to be.
          </p>
          <p className="mb-2">
            You will have access to 28+  group coaching sessions for less than
            $1 per group coaching session! 
          </p>
          <div className="mb-2">
            <p className="font-bold">What you'll get:</p>
            <ul className="list-disc list-inside pl-4">
              <li>
                Live Coaching & Real-Time Support – Led by expert coaches 
              </li>
              <li>
                Education & Proven Strategies – Learn effective moderation
                techniques that work.
              </li>
              <li>Accountability & Community – Stay motivated </li>
              <li>Measurable Results – Track your progress! Celebrate wins!</li>
            </ul>
          </div>
          <p className="mb-2">
            This is your time to reclaim your power, rewrite your story, and
            create balance in a way that honors your truth; without the
            rigidity, without the labels, and without the shame.
          </p>
          <p className="mb-2">
            Limited spots available. Start your journey to a healthier
            relationship with alcohol in a safe judgement-free community who
            gets it.
          </p>
        </div>
        <div>
          <h2 className="font-semibold text-base">
            Weekly Group Session Schedule
          </h2>
          {content}
        </div>
      </div>
    );
  };

  return (
    <div
      className="w-full h-screen flex flex-col"
      style={
        {
          "--section-bookmark-color": colors.primary,
        } as React.CSSProperties
      }
    >
      <PageBanner
        title="Mindful Moderation"
        className="mb-0 flex-shrink-0"
        backgroundImage={BANNER_IMAGE}
      />
      <main className="flex-1 p-6 overflow-y-auto">{displayContent()}</main>
    </div>
  );
}
