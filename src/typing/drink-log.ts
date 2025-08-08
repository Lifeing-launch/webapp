/* eslint-disable @typescript-eslint/no-explicit-any */
export interface DrinkType {
  id: number;
  name: string;
}

export interface DrinkBrand {
  id: number;
  drink_type_id: number;
  name: string;
}

export interface Mood {
  id: number;
  name: string;
}

export interface Trigger {
  id: number;
  name: string;
}

export interface Location {
  id: number;
  name: string;
}

export interface DrinkGoals {
  id: string;
  user_id: string;
  daily_goal: number;
  weekly_goal: number;
  monthly_goal: number;
  created_at: string;
  updated_at: string;
}

export interface DrinkEntry {
  id: string;
  user_id: string;
  drank_at: string;
  drink_type_id: number;
  drink_brand_id?: number;
  quantity: number;
  mood_id?: number;
  trigger_id?: number;
  location_id?: number;
  notes?: string;
  created_at: string;
}

export interface DrinkEntryWithRelations extends DrinkEntry {
  drink_type: DrinkType;
  drink_brand?: DrinkBrand;
  mood?: Mood;
  trigger?: Trigger;
  location?: Location;
}

export interface Badge {
  id: number;
  code: string;
  name: string;
  description: string | null;
  icon_url: string | null;
  scope: "daily" | "weekly" | "monthly" | "none";
  active: boolean;
  created_at: string;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: number;
  period_key: string;
  period_start: string;
  period_end: string;
  earned_at: string;
  goal_snapshot: Record<string, any>;
  metrics: Record<string, any> | null;
}

export interface BadgeStats {
  count: number;
  last_earned: string | null;
}

export interface BadgeWithStats extends Badge {
  stats: BadgeStats;
}

export interface RecomputeRequest {
  from?: string;
  to?: string;
}

export interface RecomputeResponse {
  inserted: number;
  from: string;
  to: string;
  message: string;
}
