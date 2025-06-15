import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import {
  buildSubscriptionRecord,
  stripeHandlerLogger,
  supabaseQueryWrapper,
} from "./helpers";
import { createAdminClient } from "@/utils/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-05-28.basil",
});

const supabaseAdmin = createAdminClient();

export async function POST(request: NextRequest) {
  const sig = request.headers.get("stripe-signature");
  const rawBody = await request.text();

  try {
    // Verify the Stripe webhook signature.
    const event = stripe.webhooks.constructEvent(
      rawBody,
      sig!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    switch (event.type) {
      case "customer.subscription.created":
        await handleSubscriptionCreated(
          event.data.object as Stripe.Subscription
        );
        break;

      case "customer.subscription.updated":
        await handleSubscriptionUpdated(
          event.data.object as Stripe.Subscription
        );
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(
          event.data.object as Stripe.Subscription
        );
        break;

      case "invoice.payment_succeeded":
        await handleInvoicePaymentSucceeded(
          event.data.object as Stripe.Invoice
        );
        break;

      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("Error processing Stripe webhook:", err.message);
    return NextResponse.json({ error: "Webhook error" }, { status: 400 });
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const eventName = "handleSubscriptionCreated";

  stripeHandlerLogger(eventName, `subscription_id: ${subscription.id}`);

  const record = await buildSubscriptionRecord(subscription);

  await supabaseQueryWrapper(
    supabaseAdmin.from("subscriptions").insert(record),
    eventName
  );

  stripeHandlerLogger(eventName, `subscription_id: ${subscription.id}`, false);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const eventName = "handleSubscriptionUpdated";

  stripeHandlerLogger(eventName, `subscription_id: ${subscription.id}`);

  const record = await buildSubscriptionRecord(subscription);

  await supabaseQueryWrapper(
    supabaseAdmin
      .from("subscriptions")
      .update(record)
      .eq("stripe_subscription_id", subscription.id)
      .single(),
    eventName
  );

  stripeHandlerLogger(eventName, `subscription_id: ${subscription.id}`, false);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const eventName = "handleSubscriptionDeleted";

  stripeHandlerLogger(eventName, `subscription_id: ${subscription.id}`);
  const now = new Date().toISOString();

  await supabaseQueryWrapper(
    supabaseAdmin
      .from("subscriptions")
      .update({
        status: "canceled",
        canceled_at: now,
        updated_at: now,
      })
      .eq("stripe_subscription_id", subscription.id)
      .single(),
    eventName
  );

  stripeHandlerLogger(eventName, `subscription_id: ${subscription.id}`, false);
}

// Invoice payment succeeded: renew period & clear any prior failure
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  const subId = invoice.subscription as string;
  const eventName = "handleInvoicePaymentSucceeded";

  stripeHandlerLogger(
    eventName,
    `invoice_id: ${invoice.id} and subscription_id: ${subId}`
  );

  const line = invoice.lines.data[0];
  const { start, end } = line.period;

  await supabaseQueryWrapper(
    supabaseAdmin
      .from("subscriptions")
      .update({
        status: "active",
        current_period_start: new Date(start * 1000).toISOString(),
        current_period_end: new Date(end * 1000).toISOString(),
        failed_at: null, // clear any previous failure,
        updated_at: new Date(),
      })
      .eq("stripe_subscription_id", subId)
      .single(),
    eventName
  );

  stripeHandlerLogger(
    eventName,
    `invoice_id: ${invoice.id} and subscription_id: ${subId}`,
    false
  );
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const subId = invoice.subscription as string;
  const eventName = "handleInvoicePaymentFailed";

  stripeHandlerLogger(
    eventName,
    `invoice_id: ${invoice.id} and subscription_id: ${subId}`
  );

  // Fetch current failed_at
  const data = (await supabaseQueryWrapper(
    supabaseAdmin
      .from("subscriptions")
      .select("failed_at")
      .eq("stripe_subscription_id", subId)
      .single(),
    eventName,
    "fetching current failed at"
  )) as { failed_at?: Date };

  const now = new Date().toISOString();

  // If this is the first failure, set failed_at
  if (!data?.failed_at) {
    await supabaseQueryWrapper(
      supabaseAdmin
        .from("subscriptions")
        .update({ failed_at: now, updated_at: now })
        .eq("stripe_subscription_id", subId)
        .single(),
      eventName,
      "setting failed at"
    );
  }

  stripeHandlerLogger(
    eventName,
    `invoice_id: ${invoice.id} and subscription_id: ${subId}`,
    false
  );
}
