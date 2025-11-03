const RUNWAY_API_URL = 'https://api.runwayml.com/v1'

export interface RunwayGenerationRequest {
  imageUrl: string
  prompt: string
  model: 'gen4_turbo' | 'veo3.1_fast'
}

export interface RunwayTask {
  id: string
  status: 'pending' | 'processing' | 'succeeded' | 'failed'
  output?: string[]
  error?: string
}

export async function createRunwayGeneration(
  request: RunwayGenerationRequest
): Promise<string> {
  const apiKey = process.env.RUNWAY_API_KEY
  if (!apiKey) {
    throw new Error('Runway API key not configured')
  }

  // RunwayML image-to-video API call
  // Note: The actual API endpoint and format may vary - this is a template
  // You may need to adjust based on RunwayML's actual API documentation
  const response = await fetch(`${RUNWAY_API_URL}/image-to-video`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      image_url: request.imageUrl,
      prompt: request.prompt,
      model: request.model,
      duration: 8, // 8 seconds minimum
      aspect_ratio: '16:9', // Common aspect ratio
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('RunwayML API error:', errorText)
    throw new Error(`RunwayML API error: ${response.status} - ${errorText}`)
  }

  const data = await response.json()
  
  // RunwayML returns either task_id or id
  const taskId = data.task_id || data.id || data.task?.id
  if (!taskId) {
    throw new Error('No task ID returned from RunwayML API')
  }

  return taskId
}

export async function checkRunwayTaskStatus(taskId: string): Promise<RunwayTask> {
  const apiKey = process.env.RUNWAY_API_KEY
  if (!apiKey) {
    throw new Error('Runway API key not configured')
  }

  const response = await fetch(`${RUNWAY_API_URL}/tasks/${taskId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('RunwayML API error:', errorText)
    throw new Error(`RunwayML API error: ${response.status} - ${errorText}`)
  }

  const data = await response.json()
  
  // Map RunwayML status to our status format
  let status: 'pending' | 'processing' | 'succeeded' | 'failed' = 'pending'
  if (data.status === 'succeeded' || data.status === 'completed') {
    status = 'succeeded'
  } else if (data.status === 'failed' || data.status === 'error') {
    status = 'failed'
  } else if (data.status === 'processing' || data.status === 'running') {
    status = 'processing'
  }

  return {
    id: data.id || taskId,
    status,
    output: data.output || data.video_url ? [data.video_url || data.output] : undefined,
    error: data.error || data.message,
  }
}
