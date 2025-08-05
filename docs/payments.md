# Lifeing Webapp - Payments Guide

This guide covers the payment system implementation in the Lifeing Webapp using Stripe for subscription management.

## Overview

The Lifeing Webapp uses Stripe to handle:
- Subscription-based payments with monthly and yearly billing
- Card-only payment processing with custom payment method configurations
- 14-day free trial periods for new subscriptions
- Webhook-based subscription lifecycle management
- Integration with Strapi CMS for plan management
- Automated cleanup and maintenance operations

## Stripe Configuration

### API Client Setup

The Stripe client is configured in `src/services/subscription.ts`:

```typescript
export const stripeClient = new Stripe(
  process.env.STRIPE_SECRET_KEY as string,
  {
    apiVersion: "2025-05-28.basil",
  }
);
```

### Environment-Specific Settings

**Test Mode vs Live Mode:**
- **Local/Staging**: Uses test keys (`sk_test_...`, `pk_test_...`) for safe development
- **Production**: Uses live keys (`sk_live_...`, `pk_live_...`) for real transactions

The mode is automatically determined by the key type - no manual configuration needed.

## Payment Method Configuration

### Card-Only Payments

The system uses custom payment method configurations to restrict payments to cards only:

```typescript
const CARD_ONLY_PAYMENT_METHOD_CONFIG = getEnvironmentConfig({
  development: "pmc_1RdQB1GRqtxHfTeQKRWXlRkX", // Test payment method config
  staging: "pmc_1RdQB1GRqtxHfTeQKRWXlRkX",     // Test payment method config  
  production: "pmc_1RdQA3GRqtxHfTeQholINNKn",   // Live payment method config
});
```

**Setting up Payment Method Configurations:**
1. Go to Stripe Dashboard → Settings → Payment methods
2. Create a new payment method configuration
3. Enable only "Card" payment methods
4. Copy the configuration ID (`pmc_...`) to your environment configuration

## Subscription Flow

### Creating Checkout Sessions

When users select a plan, the system creates a Stripe Checkout session:

**Key Features:**
- **Mode**: `subscription` for recurring payments
- **Trial Period**: 14 days for all new subscriptions
- **Payment Methods**: Card-only via custom configuration
- **Metadata**: Stores user ID, email, and plan information

**API Endpoint**: `POST /api/payment/stripe/session`

**Example Flow:**
```typescript
const session = await stripeClient.checkout.sessions.create({
  line_items: [{ price: priceId, quantity: 1 }],
  mode: "subscription",
  subscription_data: {
    trial_period_days: 14,
    metadata: { userId, email, plan }
  },
  payment_method_configuration: CARD_ONLY_PAYMENT_METHOD_CONFIG,
  customer_email: email,
  success_url: getSiteUrl() + successPath,
  cancel_url: getSiteUrl() + cancelPath,
});
```

### Subscription Management Operations

**Available Operations:**
- **Create subscription**: Via Stripe Checkout
- **Change plan**: Modify existing subscription to different price
- **Cancel subscription**: Cancel at end of current period
- **View subscription**: Display current plan and billing details

**API Endpoints:**
- `POST /api/payment/stripe/change` - Change subscription plan
- `POST /api/payment/stripe/cancel` - Cancel subscription

## Webhook Integration

### Webhook Endpoint

**URL**: `POST /api/payment/stripe/webhook`

The webhook handler verifies Stripe signatures and routes events to appropriate handlers:

```typescript
// Verify webhook signature
const event = stripeClient.webhooks.constructEvent(
  rawBody,
  sig,
  process.env.STRIPE_WEBHOOK_SECRET!
);
```

### Supported Events

**Subscription Events:**
- `customer.subscription.created` - New subscription created
- `customer.subscription.updated` - Subscription modified
- `customer.subscription.deleted` - Subscription canceled

**Invoice Events:**
- `invoice.payment_succeeded` - Payment successful
- `invoice.payment_failed` - Payment failed
- `invoice.upcoming` - Upcoming payment notification

### Event Processing

**Subscription Created/Updated:**
- Fetches plan details from Strapi using Stripe price ID
- Creates/updates subscription record in Supabase
- Stores payment method details (card type, last 4 digits)

**Payment Succeeded:**
- Updates subscription status to "active"
- Updates billing period dates
- Clears any failure timestamps

**Payment Failed:**
- Updates subscription with failure timestamp
- Maintains 14-day grace period for failed payments

### Local Webhook Testing

For local development, use Stripe CLI to forward webhooks:

```bash
npm run stripe:webhook
# or
stripe listen --forward-to localhost:3000/api/payment/stripe/webhook
```

## Strapi Plan Integration

### Plan Management

Subscription plans are managed in Strapi CMS with the following structure:

**Plan Fields:**
- `name` - Plan name (e.g., "Premium", "Pro")
- `stripe_price_monthly_id` - Stripe price ID for monthly billing
- `stripe_price_yearly_id` - Stripe price ID for yearly billing
- `price_monthly` - Monthly price for display
- `price_yearly` - Yearly price for display
- `plan_status` - Status: "ACTIVE" or "RETIRED"

### Plan Fetching

Plans are fetched from Strapi using price IDs:

```typescript
// Fetch plan by Stripe price ID
const plan = await PlanService.fetchByPriceId(priceId);
```

The service searches across:
- Current monthly price IDs
- Current yearly price IDs  
- Historical price IDs (for plan changes)

### Plan Status Management

**Active Plans**: Available for new subscriptions

**Retired Plans**: No longer available, but existing subscriptions continue

## Subscription Status Management

### Status Types

The system tracks multiple subscription statuses based on Stripe:

**Active Statuses:**
- `active` - Subscription is current and paid
- `trialing` - In free trial period

**Transitional Statuses:**
- `past_due` - Payment failed, in grace period
- `unpaid` - Payment failed, outside grace period

**Inactive Statuses:**
- `canceled` - Subscription ended
- `incomplete` - Initial payment failed

### Active Subscription Logic

The system uses a database view to determine active subscriptions:

```sql
CREATE OR REPLACE VIEW active_subscriptions AS
SELECT *
FROM subscriptions
WHERE
  status IN ('active','trialing')
  OR (
    failed_at IS NOT NULL
    AND now() < failed_at + INTERVAL '14 days'
  );
```

**Grace Period**: Failed payments maintain access for 14 days to allow recovery.

### Subscription Constraints

**One Active Subscription Per User:**
- Database constraint prevents multiple active subscriptions
- Users must cancel current subscription before starting new one

```sql
CREATE UNIQUE INDEX unique_active_subscription_per_user
  ON subscriptions(user_id)
WHERE status IN ('active', 'trialing');
```

## Cron Jobs and Automation

### Retired Plan Cleanup

**Purpose**: Automatically cancel subscriptions for retired plans
**Schedule**: Twice daily (midnight and noon)
**Function**: `cron-cleanup-retired-plans`

**Process:**
1. Fetch all non-canceled subscriptions expiring in next 24 hours
2. Check if associated plan is marked as "RETIRED" in Strapi
3. Cancel subscription at period end in Stripe
4. Update subscription status to "canceled" in database


### Cron Job Configuration

The cron job is scheduled using Supabase's pg_cron extension:

```sql
-- Cleanup retired plans (twice daily)
select cron.schedule(
  'cron-cleanup-retired-plans',
  '0 0,12 * * *', 
  $$ /* HTTP call to edge function */ $$
);
```

## Testing and Development

### Test Mode Features

**Safe Testing Environment:**
- All test transactions use fake card numbers
- No real money is processed
- Full webhook simulation available

**Test Card Numbers:**
- `4242424242424242` - Visa success
- `4000000000000002` - Card declined
- `4000000000009995` - Insufficient funds

### Webhook Development

**Local Testing:**
1. Install Stripe CLI
2. Login to your Stripe account: `stripe login`
3. Forward webhooks: `npm run stripe:webhook`
4. Use provided webhook signing secret in local environment

**Webhook Verification:**
- All webhook events are verified using signing secrets
- Invalid signatures are rejected with 400 status
- Event processing is idempotent to handle retries

## Security Considerations

### API Key Security

**Secret Key Protection:**
- Never expose secret keys in client-side code
- Use environment variables for all keys
- Rotate keys periodically, especially after security incidents

**Webhook Security:**
- Always verify webhook signatures
- Use HTTPS endpoints only
- Implement idempotency for event processing

### Payment Data Handling

**PCI Compliance:**
- Never store full card numbers
- Only store last 4 digits and card brand
- Use Stripe's secure vaults for payment methods

**Customer Data:**
- Store minimal customer information
- Link subscriptions via Stripe customer IDs
- Implement proper data retention policies

## Monitoring and Maintenance

### Key Metrics to Monitor

**Subscription Health:**
- Active subscription count
- Trial conversion rates
- Failed payment rates
- Churn by plan type

**Technical Health:**
- Webhook processing success rates
- API response times
- Cron job execution status
- Error rates by endpoint

### Regular Maintenance Tasks

**Monthly:**
- Review failed payment trends
- Audit subscription status accuracy
- Check for orphaned data
- Verify webhook endpoint health

**Quarterly:**
- Rotate webhook signing secrets
- Review plan pricing and features
- Update payment method configurations
- Audit access logs and security

## Troubleshooting

### Common Issues

**Webhook Failures:**
- Verify webhook endpoint is accessible via HTTPS
- Check signing secret matches Stripe dashboard
- Ensure proper error handling and logging
- Monitor webhook attempt history in Stripe dashboard

**Subscription Sync Issues:**
- Verify plan exists in Strapi for price ID
- Check webhook events are being processed
- Validate database constraints aren't blocking updates
- Review subscription status mapping logic

**Payment Failures:**
- Check card details and expiration dates
- Verify payment method configuration allows cards
- Review customer email and address information
- Monitor for fraud prevention blocks

### Debug Tools

**Stripe Dashboard:**
- View all transactions and subscriptions
- Monitor webhook delivery attempts
- Access detailed event logs
- Test webhook endpoints

**Application Logs:**
- Webhook processing details
- Subscription creation/update events
- Payment success/failure logging
- Cron job execution results

## Resources

- [Stripe Documentation](https://docs.stripe.com/)
- [Stripe Webhooks Guide](https://docs.stripe.com/webhooks)
- [Stripe Testing Guide](https://docs.stripe.com/testing)
- [Stripe API Reference](https://docs.stripe.com/api) 