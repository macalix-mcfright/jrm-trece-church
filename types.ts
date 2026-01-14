
export type AppRole = 'SUPER_ADMIN' | 'ADMIN' | 'MINISTRY_HEAD' | 'SG_LEADER' | 'MEMBER';
export type MinistryName = 'Worship' | 'Kids' | 'Ushering' | 'None';

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

export interface UserRole {
  id: number;
  user_id: string;
  role: AppRole;
  assigned_ministry: MinistryName;
}

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  dob: string; // ISO Date
  avatar_url?: string;
  manual_group_override?: AgeGroup | null;
  status?: 'pending' | 'approved' | 'denied'; // Added status field
  dynamic_data: Record<string, any>;
  user_roles: UserRole[]; // Joined from user_roles table
  computed_group?: AgeGroup; // Client-side computed value
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  original_key: string;
  bpm?: number;
  lyrics_url?: string;
  youtube_link?: string;
  tags?: string[];
}

export interface SongPreferredKey {
  id: string;
  song_id: string;
  leader_id: string;
  preferred_key: string;
  capo_position?: number;
  leader?: { full_name: string }; // Joined from profiles table
}

export interface SongWithKeys extends Song {
  song_preferred_keys: SongPreferredKey[];
}

export interface TrainingRecord {
  id: string;
  profile_id: string;
  module_name: string;
  status: 'Not Started' | 'In Progress' | 'Completed';
  completion_date?: string;
}

export interface ProfileWithTraining extends Profile {
  training_records: TrainingRecord[];
}
