import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
})

// Subscription plans matching the provided design
export const SUBSCRIPTION_PLANS = {
  weekly_trial: {
    name: 'Weekly Trial',
    priceId: process.env.STRIPE_WEEKLY_TRIAL_PRICE_ID!,
    credits: 1000,
    price: 0.49,
    recurringPrice: 7.99,
    frequency: 'Weekly',
    features: [
      'Up to 66 Text to Image',
      'Up to 6 Text to Video',
      'Up to 50 Text to Avatar',
      'Up to 3 Image to Video',
    ],
  },
  annual: {
    name: 'Annual',
    priceId: process.env.STRIPE_ANNUAL_PRICE_ID!,
    credits: 48000,
    price: 69.99,
    frequency: 'Annual',
    features: [],
  },
} as const

export type SubscriptionPlan = keyof typeof SUBSCRIPTION_PLANS

