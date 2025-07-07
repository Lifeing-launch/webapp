import { NextRequest, NextResponse } from "next/server";
import {
  handleSubscriptionCreated,
  handleSubscriptionUpdated,
  handleSubscriptionDeleted,
} from "./handlers/subscription-handlers";
import {
  handleInvoicePaymentSucceeded,
  handleInvoicePaymentFailed,
  handleInvoiceUpcoming,
} from "./handlers/invoice-handlers";
import Stripe from "stripe";
import { stripeClient } from "@/services/subscription";

/**
 * Stripe webhook handler for processing subscription and invoice events
 */
export async function POST(request: NextRequest) {
  try {
    const sig = request.headers.get("stripe-signature");
    const rawBody = await request.text();

    console.log(
      "Signing secret:",
      JSON.stringify(process.env.STRIPE_WEBHOOK_SECRET)
    );
    console.log("Signature header:", sig);
    console.log(
      "First 200 bytes of raw body:",
      rawBody.slice(0, 200).toString()
    );

    if (!sig) {
      console.error("Missing Stripe signature header");
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    // Verify the Stripe webhook signature
    const event = stripeClient.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    // Route events to appropriate handlers
    await routeWebhookEvent(event);

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Error processing Stripe webhook:", err);
    return NextResponse.json({ error: "Webhook error" }, { status: 400 });
  }
}

/**
 * Routes webhook events to appropriate handlers based on event type
 */
async function routeWebhookEvent(event: Stripe.Event): Promise<void> {
  const eventHandlers: Record<
    string,
    (data: Stripe.Subscription | Stripe.Invoice) => Promise<void>
  > = {
    "customer.subscription.created": (data) =>
      handleSubscriptionCreated(data as Stripe.Subscription),
    "customer.subscription.updated": (data) =>
      handleSubscriptionUpdated(data as Stripe.Subscription),
    "customer.subscription.deleted": (data) =>
      handleSubscriptionDeleted(data as Stripe.Subscription),
    "invoice.payment_succeeded": (data) =>
      handleInvoicePaymentSucceeded(data as Stripe.Invoice),
    "invoice.payment_failed": (data) =>
      handleInvoicePaymentFailed(data as Stripe.Invoice),
    "invoice.upcoming": (data) => handleInvoiceUpcoming(data as Stripe.Invoice),
  };

  const handler = eventHandlers[event.type];

  if (handler) {
    await handler(event.data.object as Stripe.Subscription | Stripe.Invoice);
  } else {
    console.log(`Unhandled event type: ${event.type}`);
  }
}
