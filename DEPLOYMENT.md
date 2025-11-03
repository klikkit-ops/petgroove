# Deployment Guide - Pet Groove

This guide walks you through deploying Pet Groove to production.

## Step 1: Initialize Git and Push to GitHub

```bash
# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Pet Groove application"

# Add your GitHub remote (replace with your actual repo URL)
git remote add origin https://github.com/klikkit-ops/petgroove.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 2: Set Up Supabase

### 2.1 Create Tables and Functions

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Open the file `supabase/schema.sql`
4. Copy and paste the entire SQL into the SQL Editor
5. Click **Run** to execute

This creates:
- `users` table
- `generations` table
- `credit_transactions` table
- RLS policies
- Database functions (`add_credits`, `deduct_credits`)

### 2.2 Create Storage Bucket

1. In Supabase dashboard, go to **Storage**
2. Click **New bucket**
3. Name: `pet-images`
4. Set to **Public bucket** (checked)
5. Click **Create bucket**

### 2.3 Get Your Supabase Keys

1. Go to **Settings** → **API**
2. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

## Step 3: Set Up Stripe

### 3.1 Create Products and Prices

1. Go to Stripe Dashboard → **Products**
2. Click **Add product**

**Product 1: Weekly Trial**
- Name: "Weekly Trial"
- Pricing model: Recurring
- Price: $0.49 USD
- Billing period: Weekly
- Create the price and note the **Price ID** (starts with `price_`)

**Product 2: Weekly Recurring** (for after trial)
- Create another recurring price for $7.99/week
- This will be used automatically after trial ends

**Product 3: Annual**
- Name: "Annual Plan"
- Pricing model: One-time
- Price: $69.99 USD
- Create and note the **Price ID**

### 3.2 Set Up Webhook

1. Go to Stripe Dashboard → **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Endpoint URL: `https://petgroove.app/api/webhooks/stripe` (or your domain)
4. Select events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
5. Click **Add endpoint**
6. Copy the **Signing secret** (starts with `whsec_`)

### 3.3 Get Stripe Keys

1. Go to **Developers** → **API keys**
2. Copy:
   - **Publishable key** → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - **Secret key** → `STRIPE_SECRET_KEY` (keep this secret!)

## Step 4: Set Up Vercel Blob

1. Go to [Vercel Dashboard](https://vercel.com)
2. Navigate to your project or create a new project
3. Go to **Settings** → **Storage**
4. Create a new Blob store or use existing
5. Copy the **BLOB_READ_WRITE_TOKEN**

## Step 5: Configure Environment Variables

### 5.1 Local Development (.env.local)

Update your `.env.local` file with all the keys:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_WEEKLY_TRIAL_PRICE_ID=price_...
STRIPE_ANNUAL_PRICE_ID=price_...

# OpenAI
OPENAI_API_KEY=sk-...

# RunwayML
RUNWAY_API_KEY=your_runway_api_key

# Vercel Blob
BLOB_READ_WRITE_TOKEN=vercel_blob_...

# App
NEXT_PUBLIC_APP_URL=https://petgroove.app
```

### 5.2 Vercel Production

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add all the same variables listed above
4. Make sure to set them for **Production**, **Preview**, and **Development**

## Step 6: Deploy to Vercel

### Option A: Via GitHub (Recommended)

1. Push your code to GitHub (see Step 1)
2. Go to [Vercel Dashboard](https://vercel.com)
3. Click **Add New Project**
4. Import your GitHub repository: `klikkit-ops/petgroove`
5. Vercel will auto-detect Next.js
6. Add environment variables (from Step 5.2)
7. Click **Deploy**

### Option B: Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

## Step 7: Update Stripe Webhook URL

After deployment, update your Stripe webhook endpoint URL:

1. Go to Stripe Dashboard → **Developers** → **Webhooks**
2. Edit your webhook endpoint
3. Update URL to: `https://petgroove.app/api/webhooks/stripe` (your actual domain)
4. Save

## Step 8: Configure RunwayML API

⚠️ **Important**: The RunwayML API integration uses placeholder endpoints. You need to:

1. Check [RunwayML API Documentation](https://docs.runwayml.com)
2. Update the endpoints in `lib/runway/client.ts`:
   - Correct API base URL
   - Correct request/response format
   - Correct authentication method

Current implementation assumes:
- Endpoint: `https://api.runwayml.com/v1/image-to-video`
- Task status: `https://api.runwayml.com/v1/tasks/{taskId}`

## Step 9: Test the Application

### Test Checklist

- [ ] User can sign up
- [ ] User can log in
- [ ] User can view subscription plans
- [ ] User can subscribe (test with Stripe test cards)
- [ ] Credits are allocated after subscription
- [ ] User can upload pet image
- [ ] User can select dance type
- [ ] Video generation starts (check API logs)
- [ ] Credits are deducted on completion
- [ ] User can view generation history
- [ ] User can download videos

### Stripe Test Cards

- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- 3D Secure: `4000 0027 6000 3184`

## Step 10: Go Live

1. Switch Stripe to **Live mode**
2. Update environment variables with live keys
3. Redeploy to Vercel
4. Update Stripe webhook to production URL
5. Test with real payment (small amount)

## Troubleshooting

### Webhook Not Working

- Check webhook URL in Stripe dashboard
- Verify `STRIPE_WEBHOOK_SECRET` is correct
- Check Vercel function logs for errors
- Test webhook in Stripe dashboard → **Send test webhook**

### Database Errors

- Verify RLS policies are enabled
- Check user has proper permissions
- Verify database functions exist

### Image Upload Fails

- Verify `pet-images` bucket exists in Supabase
- Check bucket is set to public
- Verify Supabase storage API keys

### Video Generation Fails

- Check RunwayML API endpoints are correct
- Verify API key is valid
- Check API logs in Vercel
- Verify image URL is accessible

## Next Steps

Once deployed:
1. Monitor error logs in Vercel
2. Set up monitoring (e.g., Sentry)
3. Add analytics (e.g., Google Analytics)
4. Set up email notifications
5. Optimize performance

