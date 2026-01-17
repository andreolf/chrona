// Chrona Database Types
// Auto-generated types for Supabase

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          org_id: string | null;
          role: 'admin' | 'freelancer';
          full_name: string;
          email: string;
          is_active: boolean;
          default_hourly_rate: number | null;
          preferred_currency: 'USD' | 'USDC' | 'USDT' | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          org_id?: string | null;
          role?: 'admin' | 'freelancer';
          full_name: string;
          email: string;
          is_active?: boolean;
          default_hourly_rate?: number | null;
          preferred_currency?: 'USD' | 'USDC' | 'USDT' | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string | null;
          role?: 'admin' | 'freelancer';
          full_name?: string;
          email?: string;
          is_active?: boolean;
          default_hourly_rate?: number | null;
          preferred_currency?: 'USD' | 'USDC' | 'USDT' | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          org_id: string;
          name: string;
          description: string | null;
          status: 'active' | 'archived';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          name: string;
          description?: string | null;
          status?: 'active' | 'archived';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          name?: string;
          description?: string | null;
          status?: 'active' | 'archived';
          created_at?: string;
          updated_at?: string;
        };
      };
      time_entries: {
        Row: {
          id: string;
          org_id: string;
          user_id: string;
          project_id: string;
          date: string;
          minutes: number;
          description: string | null;
          deliverable_url: string | null;
          timesheet_id: string | null;
          source: 'manual' | 'timer' | 'import';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          user_id: string;
          project_id: string;
          date: string;
          minutes: number;
          description?: string | null;
          deliverable_url?: string | null;
          timesheet_id?: string | null;
          source?: 'manual' | 'timer' | 'import';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          user_id?: string;
          project_id?: string;
          date?: string;
          minutes?: number;
          description?: string | null;
          deliverable_url?: string | null;
          timesheet_id?: string | null;
          source?: 'manual' | 'timer' | 'import';
          created_at?: string;
          updated_at?: string;
        };
      };
      timesheets: {
        Row: {
          id: string;
          org_id: string;
          user_id: string;
          week_start: string;
          status: 'draft' | 'submitted' | 'changes_requested' | 'approved';
          summary: string | null;
          submitted_at: string | null;
          approved_at: string | null;
          approved_by: string | null;
          payment_mode: 'manual' | 'streaming' | 'vesting' | null;
          payment_status: 'inactive' | 'active' | 'paused' | 'completed' | null;
          external_payment_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          user_id: string;
          week_start: string;
          status?: 'draft' | 'submitted' | 'changes_requested' | 'approved';
          summary?: string | null;
          submitted_at?: string | null;
          approved_at?: string | null;
          approved_by?: string | null;
          payment_mode?: 'manual' | 'streaming' | 'vesting' | null;
          payment_status?: 'inactive' | 'active' | 'paused' | 'completed' | null;
          external_payment_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          user_id?: string;
          week_start?: string;
          status?: 'draft' | 'submitted' | 'changes_requested' | 'approved';
          summary?: string | null;
          submitted_at?: string | null;
          approved_at?: string | null;
          approved_by?: string | null;
          payment_mode?: 'manual' | 'streaming' | 'vesting' | null;
          payment_status?: 'inactive' | 'active' | 'paused' | 'completed' | null;
          external_payment_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      timesheet_comments: {
        Row: {
          id: string;
          org_id: string;
          timesheet_id: string;
          author_id: string;
          body: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          timesheet_id: string;
          author_id: string;
          body: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          timesheet_id?: string;
          author_id?: string;
          body?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      attachments: {
        Row: {
          id: string;
          org_id: string;
          uploader_id: string;
          timesheet_id: string | null;
          time_entry_id: string | null;
          storage_path: string;
          file_name: string;
          mime_type: string;
          size_bytes: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          uploader_id: string;
          timesheet_id?: string | null;
          time_entry_id?: string | null;
          storage_path: string;
          file_name: string;
          mime_type: string;
          size_bytes: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          uploader_id?: string;
          timesheet_id?: string | null;
          time_entry_id?: string | null;
          storage_path?: string;
          file_name?: string;
          mime_type?: string;
          size_bytes?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      project_members: {
        Row: {
          id: string;
          project_id: string;
          user_id: string;
          hourly_rate: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          user_id: string;
          hourly_rate?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          user_id?: string;
          hourly_rate?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

// Convenience types
export type Organization = Database['public']['Tables']['organizations']['Row'];
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Project = Database['public']['Tables']['projects']['Row'];
export type TimeEntry = Database['public']['Tables']['time_entries']['Row'];
export type Timesheet = Database['public']['Tables']['timesheets']['Row'];
export type TimesheetComment = Database['public']['Tables']['timesheet_comments']['Row'];
export type Attachment = Database['public']['Tables']['attachments']['Row'];
export type ProjectMember = Database['public']['Tables']['project_members']['Row'];

// Extended types with relations
export type TimeEntryWithProject = TimeEntry & {
  project: Project;
};

export type TimesheetWithUser = Timesheet & {
  user: Profile;
};

export type TimesheetWithDetails = Timesheet & {
  user: Profile;
  entries: TimeEntryWithProject[];
  comments: (TimesheetComment & { author: Profile })[];
};

export type TimesheetCommentWithAuthor = TimesheetComment & {
  author: Profile;
};
