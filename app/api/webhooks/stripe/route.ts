import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe/server'
import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = await createClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        
        if (session.metadata?.supabase_user_id) {
          const userId = session.metadata.supabase_user_id
          const credits = parseInt(session.metadata.credits || '0')
          const plan = session.metadata.plan
          
          // Determine subscription tier
          let subscriptionTier: 'trial' | 'weekly' | 'annual' | null = null
          if (plan === 'weekly_trial') {
            subscriptionTier = 'trial'
          } else if (plan === 'annual') {
            subscriptionTier = 'annual'
          }

          // Add credits to user
          const { error: creditError } = await supabase.rpc('add_credits', {
            p_user_id: userId,
            p_amount: credits,
            p_type: 'subscription',
            p_stripe_payment_intent_id: session.payment_intent as string | null,
          })

          if (creditError) {
            console.error('Error adding credits:', creditError)
          }

          // Update user subscription info
          if (session.subscription) {
            await supabase
              .from('users')
              .update({
                subscription_tier: subscriptionTier,
                subscription_status: 'active',
                stripe_subscription_id: session.subscription as string,
              })
              .eq('id', userId)
          } else if (plan === 'annual') {
            // Annual is a one-time payment, not a subscription
            await supabase
              .from('users')
              .update({
                subscription_tier: 'annual',
                subscription_status: 'active',
              })
              .eq('id', userId)
          }
        }
        break
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        
        // Find user by subscription ID
        const { data: userData } = await supabase
          .from('users')
          .select('id')
          .eq('stripe_subscription_id', subscription.id)
          .single()

        if (userData) {
          const status = subscription.status === 'active' ? 'active' : 
                        subscription.status === 'canceled' ? 'canceled' : 
                        'past_due'

          await supabase
            .from('users')
            .update({ subscription_status: status })
            .eq('id', userData.id)

          // If subscription is active and recurring, add credits
          if (status === 'active' && subscription.items.data[0]?.price.id === process.env.STRIPE_WEEKLY_TRIAL_PRICE_ID) {
            const credits = 1000 // Weekly plan credits
            await supabase.rpc('add_credits', {
              p_user_id: userData.id,
              p_amount: credits,
              p_type: 'subscription',
              p_stripe_payment_intent_id: null,
            })
          }
        }
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        
        if (invoice.subscription) {
          const { data: userData } = await supabase
            .from('users')
            .select('id')
            .eq('stripe_subscription_id', invoice.subscription as string)
            .single()

          if (userData && invoice.lines.data[0]?.price.id === process.env.STRIPE_WEEKLY_TRIAL_PRICE_ID) {
            // Weekly subscription payment succeeded, add credits
            const credits = 1000
            await supabase.rpc('add_credits', {
              p_user_id: userData.id,
              p_amount: credits,
              p_type: 'subscription',
              p_stripe_payment_intent_id: invoice.payment_intent as string | null,
            })
          }
        }
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

