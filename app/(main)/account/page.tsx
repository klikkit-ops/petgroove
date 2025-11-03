'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import type { Generation } from '@/types'

export default function AccountPage() {
  const router = useRouter()
  const [generations, setGenerations] = useState<Generation[]>([])
  const [credits, setCredits] = useState(0)
  const [subscriptionTier, setSubscriptionTier] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser()

      if (!currentUser) {
        router.push('/login')
        return
      }

      setUser(currentUser)

      // Fetch credits
      const creditsRes = await fetch('/api/account/credits')
      if (creditsRes.ok) {
        const creditsData = await creditsRes.json()
        setCredits(creditsData.credits)
        setSubscriptionTier(creditsData.subscription_tier)
      }

      // Fetch generations
      const gensRes = await fetch('/api/account/generations')
      if (gensRes.ok) {
        const gensData = await gensRes.json()
        setGenerations(gensData.generations || [])
      }

      setLoading(false)
    }

    fetchData()

    // Poll for updates if there are pending/processing generations
    const interval = setInterval(() => {
      fetchData()
    }, 10000) // Poll every 10 seconds

    return () => clearInterval(interval)
  }, [router])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const handleDownload = (videoUrl: string, danceType: string) => {
    const link = document.createElement('a')
    link.href = videoUrl
    link.download = `pet-dance-${danceType}-${Date.now()}.mp4`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-gray-900">
                Pet Groove
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/generate"
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Generate
              </Link>
              <Link
                href="/subscribe"
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Subscribe
              </Link>
              <button
                onClick={handleLogout}
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Account</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-gray-500">Credits</div>
              <div className="text-2xl font-bold text-indigo-600">{credits}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Subscription</div>
              <div className="text-lg font-semibold text-gray-900">
                {subscriptionTier || 'None'}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Total Generations</div>
              <div className="text-lg font-semibold text-gray-900">
                {generations.length}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">
              Generation History
            </h2>
          </div>

          {generations.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500 mb-4">No generations yet</p>
              <Link
                href="/generate"
                className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg"
              >
                Create Your First Video
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {generations.map((gen) => (
                <div
                  key={gen.id}
                  className="border border-gray-200 rounded-lg overflow-hidden"
                >
                  <div className="aspect-video bg-gray-100 relative">
                    {gen.video_url ? (
                      <video
                        src={gen.video_url}
                        controls
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          {gen.status === 'pending' && (
                            <div className="text-sm text-gray-500">
                              Pending...
                            </div>
                          )}
                          {gen.status === 'processing' && (
                            <div className="text-sm text-indigo-600">
                              Processing...
                            </div>
                          )}
                          {gen.status === 'failed' && (
                            <div className="text-sm text-red-600">Failed</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="text-sm font-medium text-gray-900 mb-1">
                      {gen.dance_type}
                    </div>
                    <div className="text-xs text-gray-500 mb-2">
                      {new Date(gen.created_at).toLocaleDateString()}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {gen.credits_used} credits
                      </span>
                      {gen.video_url && (
                        <button
                          onClick={() => handleDownload(gen.video_url!, gen.dance_type)}
                          className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded"
                        >
                          Download
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

