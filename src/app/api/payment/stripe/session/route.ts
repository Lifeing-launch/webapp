import { stripeClient } from "@/services/subscription";
import { getAuthenticatedUser } from "@/utils/supabase/auth";
import { getSiteUrl } from "@/utils/urls";
import { getEnvironmentConfig } from "@/utils/environment";
import { NextRequest, NextResponse } from "next/server";

// Payment method configurations for different environments
const CARD_ONLY_PAYMENT_METHOD_CONFIG = getEnvironmentConfig({
  development: "pmc_1RdQB1GRqtxHfTeQKRWXlRkX", // See https://dashboard.stripe.com/test/settings/payment_methods/
  staging: "pmc_1RdQB1GRqtxHfTeQKRWXlRkX", // See https://dashboard.stripe.com/test/settings/payment_methods/
  production: "pmc_1RdQA3GRqtxHfTeQholINNKn", // See https://dashboard.stripe.com/settings/payment_methods/
});

export async function POST(request: NextRequest) {
  try {
    const user = getAuthenticatedUser(request);
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
