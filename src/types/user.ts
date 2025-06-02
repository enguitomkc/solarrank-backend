export interface Profile {
  id: string;
  name: string;
  email: string;
  profile_image?: string;
  role: 'user' | 'admin';
  total_energy: number;
  created_at: string;
  username?: string;
  bio?: string;
  location?: string;
  company?: string;
  website?: string;
  rank?: string;
  level?: number;
  achievements?: Achievement[];
  certifications?: Certification[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earned_at: string;
  category: 'energy' | 'social' | 'certification' | 'milestone';
}

export interface Certification {
  id: string;
  title: string;
  file_url: string;
  status: 'pending' | 'review' | 'approved' | 'rejected';
  created_at: string;
  approved_at?: string;
  issuer?: string;
  expiry_date?: string;
}

export interface Activity {
  id: string;
  type: 'post' | 'comment' | 'certification' | 'achievement' | 'rank_change';
  title: string;
  description: string;
  created_at: string;
  energy_gained?: number;
  metadata?: Record<string, string | number | boolean>;
}

export interface Stats {
  total_posts: number;
  total_comments: number;
  total_energy: number;
  rank_position: number;
  certifications_approved: number;
  achievements_earned: number;
  join_date: string;
} 

export interface UserProfileResponse {
  success: boolean;
  message: string;
  error: string;
  data?: {
    profile: Profile;
    stats: Stats | null;
    achievements: Achievement[];
    activities: Activity[];
  }
}