import { Plan } from "@/typing/global";

export const AUTH_PATHS: { path: string; exact?: boolean }[] = [
  { path: "/login" },
  { path: "/signup" },
  { path: "/verify-email" },
  { path: "/forgot-password" },
  { path: "/reset-password/verify" },
];

export const plans: Plan[] = [
  {
    id: 1,
    name: "Lifeing Essentials",
    price: 75,
    benefits: [
      "Full access to our 50+ meetings per month (That’s less than $2 per session!)",
      "Access to upcoming features including a resource library",
      "Exclusive tools and merchandise",
      "A welcoming landing spot for community and connection",
    ],
  },
  {
    id: 2,
    name: "Lifeing Essentials + 1 Focused Group",
    price: 100,
    isMostPopular: true,
    benefits: [
      "Includes everything in Lifeing Essentials",
      "Access to one closed focused group coaching offering (Mindful Moderation currently available)",
      "More small focused groups coming soon!",
      "Continued access to exciting upcoming features including the resource library, merchandise, exclusive tools, and a hub for community and connection",
    ],
  },
  {
    id: 3,
    name: "Founding Member | Benefactor Tier",
    price: 150,
    benefits: [
      "Includes everything in Lifeing Essentials and Lifeing + Coaching",
      "Discounted access to all closed groups as they launch",
      "Advanced notice for upcoming events",
      "Exclusive offers",
      "Access to all future features including the resource library, merchandise, exclusive tools, and a hub for community and connection",
    ],
  },
];
