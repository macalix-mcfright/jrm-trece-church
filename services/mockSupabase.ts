import { Profile, AgeGroup, SongWithKeys, CustomFieldDefinition, ProfileWithTraining } from '../types';

// --- MOCK DATA ---

const MOCK_CUSTOM_FIELDS: CustomFieldDefinition[] = [
  { id: '1', key: 'baptism_date', label: 'Baptism Date', type: 'date' },
  { id: '2', key: 'campus', label: 'Daughter Church', type: 'text' },
];

// FIX: Restructured MOCK_PROFILES to match the Profile type in types.ts.
// Replaced top-level `role` and `assigned_ministry` with a `user_roles` array.
const MOCK_PROFILES: Profile[] = [
  {
    id: 'p1',
    full_name: 'Pastor John (Admin)',
    email: 'john@jrm-trece.com',
    dob: '1980-05-15',
    dynamic_data: { baptism_date: '2000-01-01', campus: 'Trece Martires (Main)' },
    user_roles: [{ id: 1, user_id: 'p1', role: 'SUPER_ADMIN', assigned_ministry: 'None' }]
  },
  {
    id: 'p2',
    full_name: 'Sarah Worship (Head)',
    email: 'sarah@jrm-trece.com',
    dob: '1995-08-20',
    dynamic_data: { campus: 'Conchu - House Church' },
    user_roles: [{ id: 2, user_id: 'p2', role: 'MINISTRY_HEAD', assigned_ministry: 'Worship' }]
  },
  {
    id: 'p3',
    full_name: 'Mike Guitar (Leader)',
    email: 'mike@jrm-trece.com',
    dob: '1998-02-10',
    dynamic_data: { campus: 'Solar House Church' },
    user_roles: [{ id: 3, user_id: 'p3', role: 'SG_LEADER', assigned_ministry: 'Worship' }]
  },
  {
    id: 'p4',
    full_name: 'Timmy Kid',
    email: 'timmy@gmail.com',
    dob: '2015-06-01',
    dynamic_data: { campus: 'Golden Horizon' },
    user_roles: [{ id: 4, user_id: 'p4', role: 'MEMBER', assigned_ministry: 'None' }]
  },
  {
    id: 'p5',
    full_name: 'Jessica Student (25yo)',
    email: 'jess@uni.edu',
    dob: '1999-01-01',
    manual_group_override: AgeGroup.YOUTH, // OVERRIDE EXAMPLE
    dynamic_data: { baptism_date: '2015-05-20', campus: 'Trece Martires (Main)' },
    user_roles: [{ id: 5, user_id: 'p5', role: 'MEMBER', assigned_ministry: 'None' }]
  }
];

// FIX: Renamed `preferred_keys` to `song_preferred_keys` to match the SongWithKeys type.
const MOCK_SONGS: SongWithKeys[] = [
  {
    id: 's1',
    title: 'Way Maker',
    artist: 'Sinach',
    original_key: 'E',
    bpm: 68,
    lyrics_url: 'https://genius.com/Sinach-way-maker-lyrics',
    song_preferred_keys: [
      { id: 'k1', song_id: 's1', leader_id: 'p2', preferred_key: 'D', capo_position: 2, leader: MOCK_PROFILES[1] },
      { id: 'k2', song_id: 's1', leader_id: 'p3', preferred_key: 'E', capo_position: 0, leader: MOCK_PROFILES[2] }
    ]
  },
  {
    id: 's2',
    title: 'Build My Life',
    artist: 'Housefires',
    original_key: 'G',
    bpm: 72,
    youtube_link: 'https://youtube.com/watch?v=12345',
    song_preferred_keys: [
      { id: 'k3', song_id: 's2', leader_id: 'p2', preferred_key: 'F#', capo_position: 1, leader: MOCK_PROFILES[1] }
    ]
  },
  {
    id: 's3',
    title: 'Goodness of God',
    artist: 'Bethel Music',
    original_key: 'A',
    bpm: 63,
    song_preferred_keys: []
  }
];

// --- LOGIC HELPERS ---

export const calculateAgeGroup = (dob: string, override?: AgeGroup | null): AgeGroup => {
  if (override) return override;

  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  if (age <= 12) return AgeGroup.KIDS;
  if (age <= 22) return AgeGroup.YOUTH;
  if (age >= 23) return AgeGroup.YOUNG_ADULT;
  return AgeGroup.ADULT;
};

// --- API SIMULATION ---

export const api = {
  fetchProfiles: async (): Promise<Profile[]> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return MOCK_PROFILES.map(p => ({
      ...p,
      computed_group: calculateAgeGroup(p.dob, p.manual_group_override)
    }));
  },

  fetchSongs: async (): Promise<SongWithKeys[]> => {
    await new Promise(resolve => setTimeout(resolve, 600));
    return MOCK_SONGS;
  },

  fetchCustomFields: async (): Promise<CustomFieldDefinition[]> => {
    return MOCK_CUSTOM_FIELDS;
  },

  // Simulates the Matrix view query
  fetchTrainingMatrix: async (): Promise<ProfileWithTraining[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return MOCK_PROFILES.map(p => ({
      ...p,
      computed_group: calculateAgeGroup(p.dob, p.manual_group_override),
      training_records: [
        { id: `tr_${p.id}_1`, profile_id: p.id, module_name: 'EGPR', status: Math.random() > 0.5 ? 'Completed' : 'In Progress' },
        { id: `tr_${p.id}_2`, profile_id: p.id, module_name: 'T4T', status: Math.random() > 0.7 ? 'Completed' : 'Not Started' },
      ]
    }));
  }
};