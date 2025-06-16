export interface User {
  id: string;
  name: string;
  address: string;
  phone?: string;
  facebook?: string;
  website?: string;
  company?: string;
  bio?: string;
  profile_image?: string;
  role: 'user' | 'admin';
  total_energy: number;
  created_at: string;
  updated_at: string;
}