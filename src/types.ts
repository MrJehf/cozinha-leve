export interface Subcategory {
  id: number;
  name: string;
}

export interface Category {
  id: number;
  name: string;
  subcategories?: Subcategory[];
}

export interface Recipe {
  id: number;
  title: string;
  subtitle?: string;
  video_url?: string;
  thumbnail_url?: string;
  prep_time?: string;
  calories?: string;
  ingredients?: string[]; // stored as jsonb/array in DB
  steps?: string;
  is_highlight?: boolean;
  created_at?: string;
  // Joins
  categories?: Category[];
  subcategories?: Subcategory[];
}

// Backward compat alias
export type Tag = Subcategory;
