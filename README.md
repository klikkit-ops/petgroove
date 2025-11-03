# Pet Groove

Turn your pet into a dancing star! Upload a photo of your pet and watch them dance to 10 different dance styles using AI-powered video generation.

## Features

- 🎬 **AI-Powered Video Generation**: Uses OpenAI GPT-4 Vision to analyze your pet and RunwayML to generate dancing videos
- 💃 **10 Dance Styles**: Choose from Macarena, Cha-Cha Slide, Robot, Floss, and more
- 💳 **Credit-Based System**: Purchase credits through subscription plans
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🔐 **Secure Authentication**: Powered by Supabase Auth
- 💰 **Subscription Plans**: Weekly trial ($0.49) or Annual ($69.99)

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **Payments**: Stripe
- **AI Services**: OpenAI API, RunwayML API
- **Storage**: Supabase Storage (images), Vercel Blob (videos)
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- Stripe account
- OpenAI API key
- RunwayML API key
- Vercel account (for deployment)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd petgroove
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables in `.env.local`:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
STRIPE_WEEKLY_TRIAL_PRICE_ID=your_weekly_trial_price_id
STRIPE_ANNUAL_PRICE_ID=your_annual_price_id

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# RunwayML
RUNWAY_API_KEY=your_runway_api_key

# Vercel Blob
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token

# App
NEXT_PUBLIC_APP_URL=https://petgroove.app
```

### Database Setup

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the SQL from `supabase/schema.sql` to create all tables, functions, and policies

### Storage Setup

1. In Supabase dashboard, go to Storage
2. Create a new bucket named `pet-images`
3. Set it to public access
4. Configure CORS if needed

### Stripe Setup

1. Create two products in Stripe:
   - **Weekly Trial**: 
     - Price: $0.49 (recurring weekly)
     - Recurring price after trial: $7.99/week
   - **Annual**: 
     - Price: $69.99 (one-time payment)

2. Copy the Price IDs and add them to `.env.local`:
   - `STRIPE_WEEKLY_TRIAL_PRICE_ID`
   - `STRIPE_ANNUAL_PRICE_ID`

3. Set up webhook endpoint:
   - In Stripe dashboard, go to Webhooks
   - Add endpoint: `https://petgroove.app/api/webhooks/stripe`
   - Select events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_succeeded`
   - Copy the webhook secret to `.env.local`

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Deploy to Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Add all environment variables
4. Deploy!

## Project Structure

```
petgroove/
├── app/
│   ├── (auth)/          # Authentication pages
│   ├── (main)/          # Main application pages
│   ├── api/             # API routes
│   └── layout.tsx       # Root layout
├── components/          # React components
├── lib/                 # Utility libraries
│   ├── supabase/        # Supabase clients
│   ├── stripe/          # Stripe utilities
│   ├── openai/          # OpenAI integration
│   └── runway/          # RunwayML integration
├── supabase/            # Database schema
├── types/               # TypeScript types
└── TASK_OVERVIEW.md     # Progress tracking
```

## API Routes

- `POST /api/auth/logout` - Logout user
- `POST /api/upload` - Upload pet image
- `POST /api/generate` - Start video generation
- `GET /api/generate/[id]/status` - Check generation status
- `POST /api/subscribe` - Create Stripe checkout session
- `POST /api/webhooks/stripe` - Stripe webhook handler
- `GET /api/account/generations` - Get user's generations
- `GET /api/account/credits` - Get user credit balance

## Credit System

- **gen4_turbo** (trial users): 400 credits per video
- **veo3.1_fast** (paid users): 500 credits per video
- Credits are deducted only when video generation completes successfully

## Subscription Plans

- **Weekly Trial**: 1000 credits for $0.49, then $7.99/week
- **Annual**: 48,000 credits for $69.99

## Notes

- The RunwayML API integration uses placeholder endpoints. You may need to adjust the API endpoints and request/response formats based on RunwayML's actual API documentation.
- Video generation is asynchronous and polls for completion every 5 seconds
- Credits are only deducted when video generation completes successfully

## License

MIT

