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
