# Pet Groove Application - Task Overview

This file tracks the progress of the Pet Groove application implementation. It is automatically updated as major changes are made.

## Project Status

**Current Phase**: Implementation Complete

## Completed Tasks

### Setup & Configuration
- ✅ Project initialization with Next.js 14+ (App Router)
- ✅ Dependencies installed (Supabase, Stripe, OpenAI, Tailwind CSS, Vercel Blob)
- ✅ TypeScript configuration
- ✅ Basic project structure created
- ✅ Type definitions created

### Database & Authentication
- ✅ Supabase database schema created (users, generations, credit_transactions tables)
- ✅ Row Level Security (RLS) policies implemented
- ✅ Database functions for credit management (add_credits, deduct_credits)
- ✅ Supabase authentication with login/signup pages
- ✅ Auth middleware for protected routes
- ✅ Supabase client utilities (browser and server)

### Payment System
- ✅ Stripe integration setup
- ✅ Subscription selection UI matching provided design
- ✅ Stripe Checkout integration
- ✅ Webhook handlers for subscription events
- ✅ Credit allocation on subscription
- ✅ Recurring credit replenishment for weekly subscriptions

### Video Generation
- ✅ Image upload component with Supabase Storage
- ✅ Dance selection dropdown (10 dance types)
- ✅ OpenAI integration for prompt generation (GPT-4 Vision)
- ✅ RunwayML API integration (gen4_turbo/veo3.1_fast)
- ✅ Async video processing with polling
- ✅ Credit deduction system (deducts on completion)

### Account Dashboard
- ✅ Generation history view
- ✅ Video download functionality
- ✅ Credit balance display
- ✅ Subscription status display

### UI/UX
- ✅ Tailwind CSS styling
- ✅ Subscription UI matching provided design
- ✅ Responsive design
- ✅ Navigation components
- ✅ Landing page
- ✅ Loading states and error handling

## Remaining Tasks

### Deployment & Configuration
- [ ] Run Supabase schema SQL in Supabase dashboard
- [ ] Create Supabase Storage bucket named 'pet-images'
- [ ] Set up Stripe products and prices in Stripe dashboard
- [ ] Configure environment variables in Vercel
- [ ] Set up Stripe webhook endpoint in Stripe dashboard
- [ ] Deploy to Vercel
- [ ] Test end-to-end flow

### Optional Enhancements
- [ ] Add email notifications for completed generations
- [ ] Add social sharing functionality
- [ ] Implement rate limiting
- [ ] Add analytics
- [ ] Add error logging/monitoring (e.g., Sentry)

## Technical Details

### Tech Stack
- Framework: Next.js 14+ (App Router)
- Styling: Tailwind CSS
- Authentication: Supabase Auth
- Database: Supabase (PostgreSQL)
- Payments: Stripe (subscriptions)
- AI Services: OpenAI API, RunwayML API
- Storage: Vercel Blob (videos) + Supabase Storage (images)

### Credit System
- Video Cost: ~400-500 credits per video (~£3 minimum)
- Trial users: gen4_turbo model only
- Paid users: veo3.1_fast model
- Subscription Plans:
  - Weekly Trial: 1000 credits for $0.49 (then $7.99/week ongoing)
  - Annual: 48,000 credits for $69.99

### Dance Types
10 predefined dance options available for users to choose from.

## Setup Instructions

### 1. Database Setup
Run the SQL from `supabase/schema.sql` in your Supabase SQL Editor to create all tables, functions, and policies.

### 2. Storage Setup
Create a Supabase Storage bucket named `pet-images` with public access for uploaded pet images.

### 3. Stripe Setup
- Create two products in Stripe:
  - Weekly Trial: $0.49 (recurring weekly at $7.99)
  - Annual: $69.99 (one-time)
- Get the Price IDs and add them to `.env.local` as:
  - `STRIPE_WEEKLY_TRIAL_PRICE_ID`
  - `STRIPE_ANNUAL_PRICE_ID`

### 4. Environment Variables
Ensure all required environment variables are set in `.env.local`:
- Supabase keys (URL, anon key, service role key)
- Stripe keys (publishable key, secret key, webhook secret)
- OpenAI API key
- RunwayML API key
- Vercel Blob token
- App URL

### 5. RunwayML API Notes
The RunwayML API integration uses placeholder endpoints. You may need to adjust the API endpoints and request/response formats based on RunwayML's actual API documentation.

## Last Updated
2024-11-03

