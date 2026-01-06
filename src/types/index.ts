export interface User {
  id: number;
  email: string;
  name?: string;
  created_at: string;
}

export interface Intent {
  id: number;
  user_id: number;
  title: string;
  description: string;
  category: string;
  time_window_days: number;
  credibility_score: number;
  status: 'active' | 'completed' | 'abandoned' | 'paused';
  stage: string;
  created_at: string;
  updated_at: string;
}

export interface IntentStage {
  id: number;
  intent_id: number;
  stage_name: string;
  stage_order: number;
  description?: string;
  verification_points?: string;
  completed: boolean;
  completed_at?: string;
}

export interface VerificationRecord {
  id: number;
  intent_id: number;
  verification_type: string;
  verification_data?: string;
  ai_analysis?: string;
  passed: boolean;
  created_at: string;
}

export interface AIConversation {
  id: number;
  intent_id: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
}

export interface IntentProfile {
  intent: Intent;
  stages: IntentStage[];
  credibility_score: number;
  progress_percentage: number;
  recent_verifications: VerificationRecord[];
}

export interface IntentMarketplace {
  id: number;
  intent_id: number;
  seller_id: number;
  buyer_id?: number;
  price?: number;
  status: 'available' | 'purchased' | 'expired';
  transaction_type: 'subscription' | 'one-time';
  created_at: string;
}
