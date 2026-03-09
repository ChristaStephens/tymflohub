# Stripe Payment Integration Setup

TymFlo Hub uses Stripe Checkout for secure subscription payments.

## Setup Instructions

### 1. Create a Stripe Account

1. Go to https://dashboard.stripe.com/register
2. Sign up for a Stripe account
3. Complete the account verification process

### 2. Get Your Stripe API Keys

1. Go to https://dashboard.stripe.com/apikeys
2. You'll need two API keys:
   - **Publishable Key** (starts with `pk_`): Safe to expose publicly in your frontend
   - **Secret Key** (starts with `sk_`): Must be kept secret on the backend only

**For Testing** (Sandbox/Test Mode):
- Use the test mode keys (toggle to "Test mode" in your Stripe dashboard)
- Test cards: https://stripe.com/docs/testing

**For Production** (Live Mode):
- Use live mode keys (toggle to "Live mode")
- Real payments will be processed

### 3. Create Products and Price IDs

You need to create products in Stripe and get their Price IDs:

1. Go to https://dashboard.stripe.com/products
2. Click "Add Product"

#### Pro Plan ($9/month)
- **Name**: TymFlo Hub Pro - Monthly
- **Description**: Unlimited access to all tools, 100MB file limit, batch processing
- **Pricing**:
  - Type: Recurring
  - Price: $9.00 USD
  - Billing period: Monthly
- Click "Save product"
- Copy the **Price ID** (starts with `price_`) from the pricing section

#### Team Plan ($29/month)
- **Name**: TymFlo Hub Team - Monthly
- **Description**: Everything in Pro + team features for up to 10 members
- **Pricing**:
  - Type: Recurring
  - Price: $29.00 USD
  - Billing period: Monthly
- Click "Save product"
- Copy the **Price ID** (starts with `price_`)

### 4. Configure Environment Variables

Add these secrets to your Replit project:

**Required Secrets:**
1. Go to Tools → Secrets in Replit
2. Add the following keys:

```
STRIPE_SECRET_KEY=sk_test_... (or sk_live_... for production)
VITE_STRIPE_PUBLIC_KEY=pk_test_... (or pk_live_... for production)
VITE_STRIPE_PRO_PRICE_ID=price_... (Pro plan price ID)
VITE_STRIPE_TEAM_PRICE_ID=price_... (Team plan price ID)
```

**Note**: The `VITE_` prefix is required for environment variables that need to be accessible in the frontend.

### 5. How It Works

**Payment Flow:**
1. User clicks "Upgrade to Pro" or "Contact Sales" on pricing page
2. Frontend calls `/api/create-checkout-session` with the price ID
3. Backend creates a Stripe Checkout Session
4. User is redirected to Stripe-hosted checkout page
5. User enters payment information on Stripe's secure page
6. After successful payment, user is redirected to `/dashboard?session_id={CHECKOUT_SESSION_ID}`
7. After cancelled payment, user is redirected back to `/pricing`

**Security:**
- All payment data is handled by Stripe (PCI-DSS compliant)
- Your application never touches credit card information
- Stripe Secret Key is only used on the backend
- Publishable Key can be safely used in the frontend

### 6. Test the Integration

**Using Test Mode:**

1. Make sure you're using test API keys (`sk_test_` and `pk_test_`)
2. Use these test card numbers:
   - **Success**: 4242 4242 4242 4242
   - **Decline**: 4000 0000 0000 0002
   - **3D Secure Required**: 4000 0025 0000 3155
3. Use any future expiration date (e.g., 12/34)
4. Use any 3-digit CVC code (e.g., 123)
5. Use any ZIP code (e.g., 12345)

**Testing Steps:**
1. Go to `/pricing` on your application
2. Click "Upgrade to Pro"
3. You should be redirected to Stripe checkout
4. Enter test card information
5. Complete the payment
6. You should be redirected to `/dashboard`

### 7. Set Up Webhooks (Optional but Recommended)

Webhooks notify your server when payments succeed, fail, or subscriptions change:

1. Go to https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. **Endpoint URL**: `https://your-repl-url.replit.app/api/webhooks/stripe`
4. **Events to send**:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

5. Add this webhook handler to `server/routes.ts`:

```typescript
// Stripe Webhook Handler
app.post("/api/webhooks/stripe", 
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!stripe || !sig || !webhookSecret) {
      return res.sendStatus(400);
    }

    try {
      const event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        webhookSecret
      );

      // Handle different event types
      switch (event.type) {
        case "checkout.session.completed":
          const session = event.data.object;
          // Update user subscription status in database
          console.log("Checkout completed:", session.id);
          break;
        
        case "customer.subscription.deleted":
          const subscription = event.data.object;
          // Downgrade user to free plan
          console.log("Subscription cancelled:", subscription.id);
          break;
      }

      res.json({ received: true });
    } catch (err: any) {
      console.error("Webhook error:", err.message);
      res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }
);
```

### 8. Going Live

When ready for production:

1. **Switch to Live Mode** in Stripe Dashboard
2. Update your secrets with **live** API keys:
   - `STRIPE_SECRET_KEY`: Replace with `sk_live_...`
   - `VITE_STRIPE_PUBLIC_KEY`: Replace with `pk_live_...`
3. Verify your business details in Stripe
4. Set up live webhooks
5. Test with a real (small amount) transaction
6. Monitor payments in Stripe Dashboard

### 9. Customer Portal (Optional)

Allow customers to manage their subscriptions:

```typescript
app.post("/api/create-portal-session", async (req, res) => {
  if (!stripe || !req.isAuthenticated()) {
    return res.sendStatus(401);
  }

  const { stripeCustomerId } = req.user;

  const session = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: `${req.headers.origin}/dashboard`,
  });

  res.json({ url: session.url });
});
```

## Troubleshooting

**"Stripe is not configured" error:**
- Make sure `STRIPE_SECRET_KEY` is set in your environment
- Restart your application after adding secrets

**"Setup Required" toast on pricing page:**
- Make sure `VITE_STRIPE_PRO_PRICE_ID` and `VITE_STRIPE_TEAM_PRICE_ID` are set
- Verify the price IDs start with `price_`

**Checkout redirect fails:**
- Check browser console for errors
- Verify the backend route `/api/create-checkout-session` is working
- Check server logs for Stripe API errors

**Testing doesn't work:**
- Make sure you're using test mode API keys (`sk_test_` and `pk_test_`)
- Use test card numbers from https://stripe.com/docs/testing
- Clear browser cache and try again

## Resources

- [Stripe Dashboard](https://dashboard.stripe.com)
- [Stripe Checkout Documentation](https://stripe.com/docs/payments/checkout)
- [Stripe Testing Cards](https://stripe.com/docs/testing)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Replit Stripe Integration](https://docs.replit.com/category/integrations)

## Support

For questions or issues:
- Stripe Support: https://support.stripe.com
- TymFlo Hub Support: hello@tymflo.com
