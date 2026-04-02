// UrbanServe — PocketBase TypeScript Types
// All relation fields store the record ID string.
// Use expand: 'field_name' in queries to populate them.

export type Profile = {
  id: string;
  user: string;           // Relation → users
  name: string;
  dob?: string;
  contact?: string;
  skills?: string;
  interests?: string;
  location?: string;
  role: 'worker' | 'employer' | 'both';
  available: boolean;
  verified: boolean;
  verified_at?: string;
  rating: number;
  created: string;
  updated: string;
  // aadhaar is a hidden field — never returned in list responses
};

export type Job = {
  id: string;
  posted_by: string;      // Relation → users
  title: string;
  company?: string;
  type: 'Daily Wage' | 'Hourly' | 'Part-Time' | 'Contract' | 'Full-Time' | 'Team Hire';
  pay: string;
  location: string;
  skills?: string;
  category?: string;
  urgent: boolean;
  status: 'open' | 'filled' | 'closed';
  created: string;
  updated: string;
  expand?: { posted_by?: any };
};

export type Application = {
  id: string;
  job: string;            // Relation → jobs
  applicant: string;      // Relation → users
  status: 'pending' | 'accepted' | 'rejected';
  created: string;
  updated: string;
  expand?: { job?: Job; applicant?: any };
};

export type RunnerLive = {
  id: string;
  user: string;           // Relation → users
  name?: string;
  phone?: string;
  lat: number;
  lng: number;
  task?: string;
  available: boolean;
  last_seen?: string;
  created: string;
  updated: string;
};

export type Review = {
  id: string;
  reviewer: string;       // Relation → users
  reviewed: string;       // Relation → users
  job?: string;           // Relation → jobs
  rating: number;
  comment?: string;
  role: 'worker' | 'employer';
  created: string;
  updated: string;
};

export type SavedJob = {
  id: string;
  user: string;           // Relation → users
  job: string;            // Relation → jobs
  created: string;
  expand?: { job?: Job };
};

export type Notification = {
  id: string;
  user: string;           // Relation → users
  type: 'new_application' | 'accepted' | 'rejected' | 'review';
  title: string;
  body?: string;
  link?: string;
  read: boolean;
  ref_id?: string;
  created: string;
  updated: string;
};
