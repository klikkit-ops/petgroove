export type User = {
  id: string;
  email: string;
  credits: number;
  subscription_tier: 'trial' | 'weekly' | 'annual' | null;
  subscription_status: 'active' | 'canceled' | 'past_due' | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  created_at: string;
  updated_at: string;
};

export type Generation = {
  id: string;
  user_id: string;
  pet_image_url: string;
  dance_type: string;
  prompt: string;
  video_url: string | null;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  runway_task_id: string | null;
  credits_used: number;
  model_used: 'gen4_turbo' | 'veo3.1_fast';
  created_at: string;
  completed_at: string | null;
};

export type CreditTransaction = {
  id: string;
  user_id: string;
  amount: number;
  type: 'subscription' | 'purchase' | 'usage' | 'refund';
  stripe_payment_intent_id: string | null;
  created_at: string;
};

export type DanceType = {
  id: string;
  name: string;
  description: string;
};

export const DANCE_TYPES: DanceType[] = [
  { id: 'macarena', name: 'Macarena', description: 'The classic 90s dance' },
  { id: 'cha-cha-slide', name: 'Cha-Cha Slide', description: 'Slide to the left, slide to the right' },
  { id: 'robot', name: 'Robot', description: 'Robotic dance moves' },
  { id: 'floss', name: 'Floss', description: 'The viral flossing dance' },
  { id: 'moonwalk', name: 'Moonwalk', description: 'Michael Jackson style' },
  { id: 'disco', name: 'Disco', description: '70s disco dancing' },
  { id: 'breakdance', name: 'Breakdance', description: 'Breakdancing moves' },
  { id: 'salsa', name: 'Salsa', description: 'Salsa dancing' },
  { id: 'tango', name: 'Tango', description: 'Tango dancing' },
  { id: 'hip-hop', name: 'Hip-Hop', description: 'Hip-hop dance moves' },
];

export const CREDIT_COSTS = {
  gen4_turbo: 400, // ~£3 per video
  veo3.1_fast: 500, // ~£3 per video
} as const;

