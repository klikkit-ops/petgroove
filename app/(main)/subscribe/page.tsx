'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getStripe } from '@/lib/stripe/client'
import { SUBSCRIPTION_PLANS } from '@/lib/stripe/server'

export default function SubscribePage() {
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState<'weekly_trial' | 'annual'>('weekly_trial')
  const [loading, setLoading] = useState(false)

  const handleSubscribe = async () => {
    setLoading(true)

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan: selectedPlan }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      const stripe = await getStripe()
      if (!stripe) {
        throw new Error('Stripe failed to initialize')
      }

      await stripe.redirectToCheckout({ sessionId: data.sessionId })
    } catch (error) {
      console.error('Error:', error)
      alert(error instanceof Error ? error.message : 'An error occurred')
      setLoading(false)
    }
  }

  const weeklyPlan = SUBSCRIPTION_PLANS.weekly_trial
  const annualPlan = SUBSCRIPTION_PLANS.annual

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8 text-center">
            Choose Your Plan
          </h1>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Weekly Trial Plan */}
            <div
              className={`rounded-lg border-2 p-6 cursor-pointer transition-all ${
                selectedPlan === 'weekly_trial'
                  ? 'border-green-500 bg-gray-800'
                  : 'border-gray-700 bg-gray-800/50'
              }`}
              onClick={() => setSelectedPlan('weekly_trial')}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-green-400 text-sm font-semibold mb-1">7-Day Trial</div>
                  <h3 className="text-xl font-bold text-white">{weeklyPlan.name}</h3>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold text-yellow-400">💰</span>
                  <span className="text-2xl font-bold text-white">{weeklyPlan.credits}</span>
                </div>
              </div>

              <div className="text-sm text-gray-400 mb-4">{weeklyPlan.frequency}</div>

              <ul className="space-y-2 mb-6">
                {weeklyPlan.features.map((feature, index) => (
                  <li key={index} className="text-sm text-gray-300 flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="text-3xl font-bold text-white mb-2">
                US${weeklyPlan.price}
              </div>
              {selectedPlan === 'weekly_trial' && (
                <div className="text-sm text-gray-400 mb-4">
                  then US${weeklyPlan.recurringPrice}/week
                </div>
              )}

              <div className="flex items-center justify-between">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="plan"
                    value="weekly_trial"
                    checked={selectedPlan === 'weekly_trial'}
                    onChange={() => setSelectedPlan('weekly_trial')}
                    className="sr-only"
                  />
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedPlan === 'weekly_trial'
                        ? 'border-green-500 bg-green-500'
                        : 'border-gray-400'
                    }`}
                  >
                    {selectedPlan === 'weekly_trial' && (
                      <div className="w-3 h-3 rounded-full bg-white"></div>
                    )}
                  </div>
                  <span className="ml-2 text-white text-sm">Select</span>
                </label>
              </div>
            </div>

            {/* Annual Plan */}
            <div
              className={`rounded-lg border-2 p-6 cursor-pointer transition-all ${
                selectedPlan === 'annual'
                  ? 'border-green-500 bg-gray-800'
                  : 'border-gray-700 bg-gray-800/50'
              }`}
              onClick={() => setSelectedPlan('annual')}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white">{annualPlan.name}</h3>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold text-yellow-400">💰</span>
                  <span className="text-2xl font-bold text-white">{annualPlan.credits}</span>
                </div>
              </div>

              <div className="text-sm text-gray-400 mb-4">{annualPlan.frequency}</div>

              <div className="text-3xl font-bold text-white mb-6">
                US${annualPlan.price}
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="plan"
                    value="annual"
                    checked={selectedPlan === 'annual'}
                    onChange={() => setSelectedPlan('annual')}
                    className="sr-only"
                  />
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedPlan === 'annual'
                        ? 'border-green-500 bg-green-500'
                        : 'border-gray-400'
                    }`}
                  >
                    {selectedPlan === 'annual' && (
                      <div className="w-3 h-3 rounded-full bg-white"></div>
                    )}
                  </div>
                  <span className="ml-2 text-white text-sm">Select</span>
                </label>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <button
              onClick={handleSubscribe}
              disabled={loading}
              className="w-full bg-lime-400 hover:bg-lime-500 text-gray-900 font-bold py-4 px-6 rounded-lg text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? 'Processing...'
                : selectedPlan === 'weekly_trial'
                ? `Start 7-Day Trial for $${weeklyPlan.price}`
                : `Subscribe for $${annualPlan.price}`}
            </button>

            <div className="mt-4 text-center text-sm text-gray-400">
              <a href="#" className="underline mr-4">Terms of Use</a>
              <a href="#" className="underline">Privacy Policy</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

