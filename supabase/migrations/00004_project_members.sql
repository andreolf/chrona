-- Project Members table for assigning freelancers to projects
CREATE TABLE project_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  hourly_rate NUMERIC(10, 2), -- Optional override of user's default rate
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

-- Create indexes
CREATE INDEX idx_project_members_project_id ON project_members(project_id);
CREATE INDEX idx_project_members_user_id ON project_members(user_id);

-- Apply updated_at trigger
CREATE TRIGGER project_members_updated_at BEFORE UPDATE ON project_members FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Enable RLS
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "project_members_select" ON project_members FOR SELECT USING (true);
CREATE POLICY "project_members_insert" ON project_members FOR INSERT WITH CHECK (true);
CREATE POLICY "project_members_delete" ON project_members FOR DELETE USING (true);
