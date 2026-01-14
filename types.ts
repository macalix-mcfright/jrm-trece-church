export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  MINISTRY_HEAD = 'MINISTRY_HEAD',
  SG_LEADER = 'SG_LEADER',
  MEMBER = 'MEMBER'
}

export enum AgeGroup {
  KIDS = 'Kids (0-12)',
  YOUTH = 'Youth (13-22)',
  YOUNG_ADULT = 'Young Adult (23+)',
  ADULT = 'Adult'
}

export interface CustomFieldDefinition {
  id: string;
  key: string;
  label: string;
  type: 'text' | 'date' | 'boolean' | 'number';
}

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: Role;
  dob: string; // ISO Date
  avatar_url?: string;
  manual_group_override?: AgeGroup | null; // For the "25yo Student in Youth" case
  // JSONB dynamic data
  dynamic_data: Record<string, any>; 
  
  // Computed on frontend or view
  computed_group?: AgeGroup;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  default_key: string;
  lyrics_url?: string;
  youtube_url?: string;
  bpm?: number;
  tags?: string[];
}

export interface SongPreferredKey {
  id: string;
  song_id: string;
  profile_id: string;
  key_value: string;
  
  // Joins
  profile?: Profile;
}

export interface SongWithKeys extends Song {
  preferred_keys: SongPreferredKey[];
}

export interface TrainingRecord {
  id: string;
  profile_id: string;
  module_name: string; // e.g., "EGPR", "T4T"
  status: 'Not Started' | 'In Progress' | 'Completed';
  completion_date?: string;
}

export interface ProfileWithTraining extends Profile {
  training_records: TrainingRecord[];
}