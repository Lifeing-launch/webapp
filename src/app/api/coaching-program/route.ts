import { NextResponse } from "next/server";

export interface CoachingPackage {
  id: string;
  title: string;
  subtitle: string;
  sessions: string;
  description: string;
  stripeUrl: string;
  isPopular?: boolean;
}

export interface CoachingProgramData {
  intro: {
    title: string;
    description: string;
  };
  packages: CoachingPackage[];
  footer: {
    bullets: string[];
    note: string;
  };
}

const mockData: CoachingProgramData = {
  intro: {
    title: "Collaborative Coaching Program",
    description:
      "Step Into a season of intentional self-discovery and growth with our Collaborative Coaching Program. Our customizable packages honor your unique path while offering the insight and support of distinct yet complementary coaching styles.\n\nDesign your experience your way: choose 1:1 sessions with any of our Lifeing Coaches based on your needs, goals, and rhythm. Work closely with one coach or blend sessions across our team - the choice is yours to make.",
  },
  packages: [
    {
      id: "discovery",
      title: "Discovery Package",
      subtitle: "(4) 30-Minute Sessions",
      sessions: "(4) 30-Minute Sessions",
      description:
        "Explore with up to four different coaches through introductory or follow-up sessions. Perfect for sampling perspectives and finding the right fit.",
      stripeUrl: "https://buy.stripe.com/fZu6oHboS2F426WcM3dAk03",
    },
    {
      id: "foundation",
      title: "Foundation Package",
      subtitle: "(4) 45-Minute Focused Sessions",
      sessions: "(4) 45-Minute Focused Sessions",
      description:
        "Build momentum with focused sessions customized to your goals. Choose a single coach for depth or mix coaches for variety and fresh insight.",
      stripeUrl: "https://buy.stripe.com/9B69AT50udjI8vkh2jdAk04",
      isPopular: true,
    },
    {
      id: "comprehensive",
      title: "Comprehensive Value Package",
      subtitle: "(10) 45-Minute Comprehensive Sessions",
      sessions: "(10) 45-Minute Comprehensive Sessions",
      description:
        "Our best value for ongoing support and accountability. Gain consistent, personalized coaching with one or multiple coaches in your chosen areas of focus.",
      stripeUrl: "https://buy.stripe.com/6oU7sL78CcfEbHw3btdAk05",
    },
  ],
  footer: {
    bullets: [
      "After purchasing, you'll receive scheduling links for the coaches.",
      "Sessions roll over month-to-month and can be used whenever you're ready.",
    ],
    note: "Note: Coaching packages may be payable or reimbursable through your FSA or HSA account. Coverage varies with insurance providers. If you'd like more information or documentation (LON) to support your request for coverage, please email or consult.",
  },
};

export async function GET() {
  try {
    return NextResponse.json({ data: mockData });
  } catch (error) {
    console.error("Error fetching coaching program data:", error);
    return NextResponse.json(
      { error: "Failed to fetch coaching program data" },
      { status: 500 }
    );
  }
}
