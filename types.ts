// We add '| string' to all types so the app never crashes on new data
export type AppRole = 'SUPER_ADMIN' | 'ADMIN' | 'MINISTRY_HEAD' | 'SG_LEADER' | 'MEMBER' | string;

export type MinistryName = 'Worship' | 'Kids' | 'Youth' | 'Media' | 'Operations' | 'None' | string;

export interface UserRole {
  id: number;
  user_id: string;
  role: AppRole; 
  assigned_ministry?: MinistryName;
}

export interface Profile {
  id: string;
  updated_at?: string;
  full_name: string;
  avatar_url?: string;
  email?: string;
  sub_group?: 'Kids' | 'Youth' | 'Adults' | string;
  contact_info?: Record<string, any>;
  civil_status?: string;
  manual_group_override?: string;
  dynamic_data?: Record<string, any>;
  status?: 'pending' | 'approved' | 'denied' | string;
  dob?: string;
  gender?: string;
  user_roles?: UserRole[];
}

export interface Song {
  id: string;
  title: string;
  author?: string;
  lyrics?: string;
  bpm?: number;
  time_signature?: string;
  default_key?: string;
  youtube_link?: string;
  themes?: string[];
  created_at: string;
  updated_at: string;
}

export interface SongKeyPreference {
  id: number;
  song_id: string;
  user_id: string;
  preferred_key: string;
}

export interface TrainingRecord {
    id: number;
    user_id: string;
    module_id: string;
    status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
    completed_at?: string;
    quiz_score?: number;
}