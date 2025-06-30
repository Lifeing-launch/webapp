import { stripeClient } from "@/services/subscription";
import { checkUserIsAuthenticated } from "@/utils/supabase/auth";
import { getSiteUrl } from "@/utils/urls";
import { NextRequest, NextResponse } from "next/server";

// TODO: Change value based on environment - test/prod
// See https://dashboard.stripe.com/test/settings/payment_methods/
const CARD_ONLY_PAYMENT_METHOD_CONFIG = "pmc_1RdQB1GRqtxHfTeQKRWXlRkX";

export async function POST(request: NextRequest) {
  let user;

  try {
    user = await checkUserIsAuthenticated();
  } catch {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  try {
    const { email, id: userId } = user;

    // Get priceId and plan from request body.
    const { priceId, plan, successPath, cancelPath } = await request.json();

    const session = await stripeClient.checkout.sessions.create({
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      subscription_data: {
        trial_period_days: 14,
        metadata: {
          userId,
          email: email || null,
          plan,
        },
      },
      payment_method_configuration: CARD_ONLY_PAYMENT_METHOD_CONFIG,
      customer_email: email!,
      success_url: getSiteUrl() + successPath!,
      cancel_url: getSiteUrl() + cancelPath!,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Error creating Stripe session:", err);
    return NextResponse.json(
      { error: "Error creating Stripe session" },
      { status: 500 }
    );
  }
}
