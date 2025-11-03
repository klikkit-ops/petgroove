import OpenAI from 'openai'
import { DANCE_TYPES } from '@/types'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function generateDancePrompt(
  imageUrl: string,
  danceType: string
): Promise<string> {
  const dance = DANCE_TYPES.find((d) => d.id === danceType)
  const danceName = dance?.name || danceType

  const response = await openai.chat.completions.create({
    model: 'gpt-4-vision-preview',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `You are analyzing a pet image. Please describe the pet in detail, including:
1. Breed or type of animal (dog, cat, etc.)
2. Color and markings
3. Physical characteristics (size, fur length, distinctive features)
4. Facial features
5. Any unique characteristics

Then, create a detailed prompt for generating a video of this exact pet doing the ${danceName} dance. The prompt must ensure the pet in the video looks exactly like the pet in the source image - same breed, colors, markings, and features. The pet should be performing the ${danceName} dance moves.

Return only the prompt, nothing else. The prompt should be descriptive and focus on maintaining the pet's exact appearance while performing the dance.`,
          },
          {
            type: 'image_url',
            image_url: {
              url: imageUrl,
            },
          },
        ],
      },
    ],
    max_tokens: 500,
  })

  const prompt = response.choices[0]?.message?.content
  if (!prompt) {
    throw new Error('Failed to generate prompt from OpenAI')
  }

  return prompt
}

