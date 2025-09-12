import { NextResponse } from "next/server";
import { RetreatData } from "@/typing/retreats";

const mockData: RetreatData = {
  announcement: {
    title: "An Invitation to Our First-Ever Lifeing Retreat:",
    subtitle: "Rewilding the Soul in Palm Springs",
    description:
      "Join us from <strong>October 30th to November 3rd</strong> for a four-night, all-inclusive escape to a breathtaking 7,000-square-foot villa in the heart of Palm Springs.<br/><br/>This is not just a getaway; it's an invitation to lean into your innate powers and discover the deep calm that comes from being truly present.",
    ctaText: "See Room Rates",
    backgroundImage: "/images/retreats/hero-banner.jpg",
  },
  contentSections: [
    {
      id: "experience",
      title: "A Sanctuary of Serenity",
      description:
        "This Oasis Villa is your home for four nights, nestled against the stunning backdrop of the San Jacinto mountains.<br/><br/>It features a gorgeous pool, a cozy, sunken fire pit for evening connection, and an onsite spa with a steam room and sauna for deep, restorative relaxation.",
      images: [
        "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1444927714506-8492d94b4e3d?w=800&h=600&fit=crop",
      ],
      alignment: "left",
      imageSlideInterval: 10000,
    },
    {
      id: "living-oasis",
      title: "Nourishment & Connection",
      description:
        "We will be cared for by our <strong>private chef, Deanna</strong> who will craft nightly gourmet meals, along with healthy breakfasts and lunches. This is a chance to nourish your body and connect with your fellow community members around a shared table, in a space of pure acceptance.",
      images: [
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&h=600&fit=crop",
      ],
      alignment: "right",
      imageSlideInterval: 10000,
    },
    {
      id: "food-meditation",
      title: "Practices for Wholeness",
      description:
        "Each day will be a gentle flow of intentional practice. We'll start with <strong>morning yoga and meditation</strong>, anchoring ourselves in breath and movement. Our journey will culminate in a profound and magical experience—a private sound bath at the renowned <strong>Integratron in Joshua Tree</strong>, designed to align and restore your energy.",
      images: [
        "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1543352634-a1c51d9f1fa7?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=800&h=600&fit=crop",
      ],
      alignment: "left",
      imageSlideInterval: 10000,
    },
    {
      id: "watershed-swimming",
      title: "Seamless Grounding",
      description:
        "All of your ground transportation, including airport transfers, will be taken care of so that you can simply arrive and immerse yourself in the experience.<br/><br/>This vintage 1953 Airstream is on property and you can come visit Heidi here during office hours.<br/><br/>And, in the Casita adjacent to the Spa and Outdoor Lounge, you will find Dr. Lovey in her suite where she will hold office hours, after hours, because she rolls that way.",
      images: [
        "https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1502933691298-84fc14542831?w=800&h=600&fit=crop",
      ],
      alignment: "right",
      imageSlideInterval: 10000,
    },
  ],
  retreatRooms: {
    title: "Retreat Rooms",
    paragraphs: [
      "This retreat is a sacred space for us to practice everything we believe in: letting go of shame, leaning into curiosity, and embracing a life of purpose. It's an opportunity to truly embody the Lifeing way and return home feeling unburdened, inspired, and aligned.",
      "The availability is limited to 14. Room rates and configurations vary, average price based upon double occupancy is $3000 exclusive of airfare. For those wanting a private room, we will add a single supplement fee based upon the room of your choice."
    ],
    footnote: "All Inclusive (Except Airfare and Massages)",
    ctaText: "Request to book",
  },
  carousel: {
    images: [
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1584132915807-fd1f5fbc078f?w=800&h=600&fit=crop",
    ],
    interval: 4000,
  },
  pricing: [
    {
      id: "primary-suite-1",
      title: "Primary Suite 1",
      subtitle: "",
      description: "Alaskan King bed, private patio w/ outdoor tub & shower",
      status: "booked",
      price1: {
        label: "Double Occupancy",
        value: "$3,535",
      },
      price2: {
        label: "Single Occupancy",
        value: "$5,000",
      },
    },
    {
      id: "primary-suite-2",
      title: "Primary Suite 2",
      subtitle: "",
      description: "Deluxe King bed, private patio",
      status: "available",
      price1: {
        label: "Double Occupancy",
        value: "$3,295",
      },
      price2: {
        label: "Single Occupancy",
        value: "$4,800",
      },
    },
    {
      id: "room-1",
      title: "Room 1",
      subtitle: "",
      description: "King bed, private bath, outdoor patio access",
      status: "available",
      price1: {
        label: "Double Occupancy",
        value: "$3,095",
      },
      price2: {
        label: "Single Occupancy",
        value: "$4,500",
      },
    },
    {
      id: "room-2",
      title: "Room 2",
      subtitle: "",
      description: "Queen bed, shared bath w/ private door",
      status: "available",
      price1: {
        label: "Double Occupancy",
        value: "$2,795",
      },
      price2: {
        label: "Single Occupancy",
        value: "$3,800",
      },
    },
    {
      id: "room-3",
      title: "Room 3",
      subtitle: "",
      description: "King bed, outdoor patio access, shared bath",
      status: "available",
      price1: {
        label: "Double Occupancy",
        value: "$2,895",
      },
      price2: {
        label: "Single Occupancy",
        value: "$4,200",
      },
    },
    {
      id: "room-4",
      title: "Room 4",
      subtitle: "",
      description: "Twin beds, outdoor patio access, shared bath",
      status: "available",
      price1: {
        label: "Double Occupancy",
        value: "$2,895",
      },
      price2: {
        label: "Single Occupancy",
        value: "$4,200",
      },
    },
    {
      id: "room-5",
      title: "Room 5",
      subtitle: "",
      description: "King bed, outdoor patio access, shared bath",
      status: "available",
      price1: {
        label: "Double Occupancy",
        value: "$2,895",
      },
      price2: {
        label: "Single Occupancy",
        value: "$4,200",
      },
    },
  ],
  bookingUrl: "https://forms.google.com/example-booking-form",
  seo: {
    title: "Lifeing Retreats - Rewilding the Soul in Palm Springs",
    description:
      "Join our transformative wellness retreat in Palm Springs. Experience mindful moderation, meditation, and renewal in a serene desert oasis.",
  },
};

export async function GET() {
  try {
    return NextResponse.json(mockData);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch retreat data" },
      { status: 500 }
    );
  }
}
