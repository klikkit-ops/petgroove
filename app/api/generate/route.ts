import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateDancePrompt } from '@/lib/openai/client'
import { createRunwayGeneration, checkRunwayTaskStatus } from '@/lib/runway/client'
import { CREDIT_COSTS } from '@/types'
import { put } from '@vercel/blob'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { imageUrl, danceType } = await request.json()

    if (!imageUrl || !danceType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get user data to determine model and check credits
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('credits, subscription_tier')
      .eq('id', user.id)
      .single()

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'Failed to fetch user data' },
        { status: 500 }
      )
    }

    // Determine model based on subscription tier
    // Trial users get gen4_turbo, paid users (weekly/annual) get veo3.1_fast
    const model = userData.subscription_tier === 'trial' || !userData.subscription_tier 
      ? 'gen4_turbo' 
      : 'veo3.1_fast'
    const creditsRequired = CREDIT_COSTS[model]

    // Check if user has enough credits
    if (userData.credits < creditsRequired) {
      return NextResponse.json(
        { error: `Insufficient credits. You need ${creditsRequired} credits but only have ${userData.credits}.` },
        { status: 400 }
      )
    }

    // Generate prompt using OpenAI
    const prompt = await generateDancePrompt(imageUrl, danceType)

    // Create generation record
    const { data: generation, error: genError } = await supabase
      .from('generations')
      .insert({
        user_id: user.id,
        pet_image_url: imageUrl,
        dance_type: danceType,
        prompt,
        status: 'pending',
        model_used: model,
        credits_used: creditsRequired,
      })
      .select()
      .single()

    if (genError || !generation) {
      console.error('Error creating generation:', genError)
      return NextResponse.json(
        { error: 'Failed to create generation record' },
        { status: 500 }
      )
    }

    // Start RunwayML generation (async)
    createRunwayGeneration({
      imageUrl,
      prompt,
      model,
    })
      .then(async (taskId) => {
        // Update generation with task ID
        await supabase
          .from('generations')
          .update({
            runway_task_id: taskId,
            status: 'processing',
          })
          .eq('id', generation.id)

        // Poll for completion (in background)
        pollForCompletion(taskId, generation.id, user.id)
      })
      .catch(async (error) => {
        console.error('Error starting RunwayML generation:', error)
        await supabase
          .from('generations')
          .update({
            status: 'failed',
          })
          .eq('id', generation.id)
      })

    return NextResponse.json({
      generationId: generation.id,
      status: 'pending',
      message: 'Generation started',
    })
  } catch (error) {
    console.error('Error in generate route:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

async function pollForCompletion(
  taskId: string,
  generationId: string,
  userId: string
) {
  const supabase = await createClient()
  const maxAttempts = 60 // 5 minutes max (5 second intervals)
  let attempts = 0

  const pollInterval = setInterval(async () => {
    attempts++

    try {
      const task = await checkRunwayTaskStatus(taskId)

      if (task.status === 'succeeded' && task.output && task.output.length > 0) {
        clearInterval(pollInterval)

        // Download video from RunwayML and upload to Vercel Blob
        const videoUrl = task.output[0]
        const videoResponse = await fetch(videoUrl)
        const videoBlob = await videoResponse.blob()

        const blob = await put(`videos/${generationId}.mp4`, videoBlob, {
          access: 'public',
        })

        // Update generation with video URL
        await supabase
          .from('generations')
          .update({
            video_url: blob.url,
            status: 'completed',
            completed_at: new Date().toISOString(),
          })
          .eq('id', generationId)

        // Get generation to determine credits
        const { data: genData } = await supabase
          .from('generations')
          .select('model_used, credits_used')
          .eq('id', generationId)
          .single()

        // Deduct credits
        if (genData) {
          await supabase.rpc('deduct_credits', {
            p_user_id: userId,
            p_amount: genData.credits_used,
          })
        }
      } else if (task.status === 'failed') {
        clearInterval(pollInterval)

        await supabase
          .from('generations')
          .update({
            status: 'failed',
          })
          .eq('id', generationId)
      } else if (attempts >= maxAttempts) {
        clearInterval(pollInterval)

        await supabase
          .from('generations')
          .update({
            status: 'failed',
          })
          .eq('id', generationId)
      }
    } catch (error) {
      console.error('Error polling RunwayML:', error)
      if (attempts >= maxAttempts) {
        clearInterval(pollInterval)
      }
    }
  }, 5000) // Poll every 5 seconds
}

