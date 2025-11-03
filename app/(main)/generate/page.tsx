'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ImageUpload from '@/components/generation/ImageUpload'
import { DANCE_TYPES, CREDIT_COSTS } from '@/types'

export default function GeneratePage() {
  const router = useRouter()
  const [selectedDance, setSelectedDance] = useState('')
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!imageUrl) {
      setError('Please upload an image first')
      return
    }

    if (!selectedDance) {
      setError('Please select a dance type')
      return
    }

    setGenerating(true)
    setError(null)

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl,
          danceType: selectedDance,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to start generation')
      }

      const data = await response.json()
      router.push(`/account?generation=${data.generationId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setGenerating(false)
    }
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
                href="/account"
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Account
              </Link>
              <Link
                href="/subscribe"
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Subscribe
              </Link>
            </div>
          </div>
        </div>
      </nav>
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Create Dancing Pet Video</h1>

        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-800">{error}</div>
          </div>
        )}

        <div className="bg-white shadow rounded-lg p-6 space-y-6">
          <ImageUpload
            onImageUploaded={(url) => {
              setImageUrl(url)
              setError(null)
            }}
            currentImageUrl={imageUrl}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Dance Type
            </label>
            <select
              value={selectedDance}
              onChange={(e) => {
                setSelectedDance(e.target.value)
                setError(null)
              }}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">Choose a dance...</option>
              {DANCE_TYPES.map((dance) => (
                <option key={dance.id} value={dance.id}>
                  {dance.name} - {dance.description}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> This will cost approximately {CREDIT_COSTS.gen4_turbo}-{CREDIT_COSTS['veo3.1_fast']} credits depending on your subscription tier.
            </p>
          </div>

          <button
            onClick={handleGenerate}
            disabled={generating || !imageUrl || !selectedDance}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generating ? 'Starting generation...' : 'Generate Video'}
          </button>
        </div>
      </div>
      </div>
    </div>
  )
}

