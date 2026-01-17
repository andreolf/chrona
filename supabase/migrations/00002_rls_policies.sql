-- Chrona RLS Policies
-- Version 1.0.0

-- Helper function to get user's org_id
CREATE OR REPLACE FUNCTION get_user_org_id()
RETURNS UUID AS $$
  SELECT org_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT role = 'admin' FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================
-- ORGANIZATIONS POLICIES
-- ============================================
CREATE POLICY "Users can view their organization"
  ON organizations FOR SELECT
  USING (id = get_user_org_id());

-- ============================================
-- PROFILES POLICIES
-- ============================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (id = auth.uid());

-- Admins can view all profiles in their org
CREATE POLICY "Admins can view all org profiles"
  ON profiles FOR SELECT
  USING (
    org_id = get_user_org_id() 
    AND is_admin()
  );

-- Users can update their own profile (except role and is_active)
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    -- Role and is_active changes handled by admin policy
  );

-- Admins can update any profile in their org
CREATE POLICY "Admins can update org profiles"
  ON profiles FOR UPDATE
  USING (
    org_id = get_user_org_id() 
    AND is_admin()
  );

-- Allow profile creation during signup
CREATE POLICY "Allow profile creation on signup"
  ON profiles FOR INSERT
  WITH CHECK (id = auth.uid());

-- ============================================
-- PROJECTS POLICIES
-- ============================================

-- All authenticated users can view active projects in their org
CREATE POLICY "Users can view org projects"
  ON projects FOR SELECT
  USING (org_id = get_user_org_id());

-- Only admins can create projects
CREATE POLICY "Admins can create projects"
  ON projects FOR INSERT
  WITH CHECK (
    org_id = get_user_org_id() 
    AND is_admin()
  );

-- Only admins can update projects
CREATE POLICY "Admins can update projects"
  ON projects FOR UPDATE
  USING (
    org_id = get_user_org_id() 
    AND is_admin()
  );

-- Only admins can delete projects
CREATE POLICY "Admins can delete projects"
  ON projects FOR DELETE
  USING (
    org_id = get_user_org_id() 
    AND is_admin()
  );

-- ============================================
-- TIME_ENTRIES POLICIES
-- ============================================

-- Freelancers can view their own entries
CREATE POLICY "Users can view own time entries"
  ON time_entries FOR SELECT
  USING (user_id = auth.uid());

-- Admins can view all entries in org
CREATE POLICY "Admins can view all org time entries"
  ON time_entries FOR SELECT
  USING (
    org_id = get_user_org_id() 
    AND is_admin()
  );

-- Users can create entries for themselves
CREATE POLICY "Users can create own time entries"
  ON time_entries FOR INSERT
  WITH CHECK (
    org_id = get_user_org_id() 
    AND user_id = auth.uid()
  );

-- Admins can create entries for anyone in org
CREATE POLICY "Admins can create time entries for anyone"
  ON time_entries FOR INSERT
  WITH CHECK (
    org_id = get_user_org_id() 
    AND is_admin()
  );

-- Users can update their own entries (only if timesheet not submitted)
CREATE POLICY "Users can update own time entries"
  ON time_entries FOR UPDATE
  USING (
    user_id = auth.uid()
    AND (
      timesheet_id IS NULL
      OR EXISTS (
        SELECT 1 FROM timesheets 
        WHERE id = time_entries.timesheet_id 
        AND status IN ('draft', 'changes_requested')
      )
    )
  );

-- Admins can update any entry in org
CREATE POLICY "Admins can update org time entries"
  ON time_entries FOR UPDATE
  USING (
    org_id = get_user_org_id() 
    AND is_admin()
  );

-- Users can delete their own entries (only if timesheet not submitted)
CREATE POLICY "Users can delete own time entries"
  ON time_entries FOR DELETE
  USING (
    user_id = auth.uid()
    AND (
      timesheet_id IS NULL
      OR EXISTS (
        SELECT 1 FROM timesheets 
        WHERE id = time_entries.timesheet_id 
        AND status IN ('draft', 'changes_requested')
      )
    )
  );

-- Admins can delete any entry in org
CREATE POLICY "Admins can delete org time entries"
  ON time_entries FOR DELETE
  USING (
    org_id = get_user_org_id() 
    AND is_admin()
  );

-- ============================================
-- TIMESHEETS POLICIES
-- ============================================

-- Users can view their own timesheets
CREATE POLICY "Users can view own timesheets"
  ON timesheets FOR SELECT
  USING (user_id = auth.uid());

-- Admins can view all timesheets in org
CREATE POLICY "Admins can view all org timesheets"
  ON timesheets FOR SELECT
  USING (
    org_id = get_user_org_id() 
    AND is_admin()
  );

-- Users can create their own timesheets
CREATE POLICY "Users can create own timesheets"
  ON timesheets FOR INSERT
  WITH CHECK (
    org_id = get_user_org_id() 
    AND user_id = auth.uid()
  );

-- Users can update their own timesheets (only if draft or changes_requested)
CREATE POLICY "Users can update own timesheets"
  ON timesheets FOR UPDATE
  USING (
    user_id = auth.uid()
    AND status IN ('draft', 'changes_requested')
  );

-- Admins can update any timesheet in org (for approvals)
CREATE POLICY "Admins can update org timesheets"
  ON timesheets FOR UPDATE
  USING (
    org_id = get_user_org_id() 
    AND is_admin()
  );

-- Users can delete their own draft timesheets
CREATE POLICY "Users can delete own draft timesheets"
  ON timesheets FOR DELETE
  USING (
    user_id = auth.uid()
    AND status = 'draft'
  );

-- ============================================
-- TIMESHEET_COMMENTS POLICIES
-- ============================================

-- Users can view comments on their timesheets
CREATE POLICY "Users can view comments on own timesheets"
  ON timesheet_comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM timesheets 
      WHERE id = timesheet_comments.timesheet_id 
      AND user_id = auth.uid()
    )
  );

-- Admins can view all comments in org
CREATE POLICY "Admins can view all org comments"
  ON timesheet_comments FOR SELECT
  USING (
    org_id = get_user_org_id() 
    AND is_admin()
  );

-- Users can add comments to accessible timesheets
CREATE POLICY "Users can add comments to accessible timesheets"
  ON timesheet_comments FOR INSERT
  WITH CHECK (
    org_id = get_user_org_id()
    AND author_id = auth.uid()
    AND (
      -- Can comment on own timesheets
      EXISTS (
        SELECT 1 FROM timesheets 
        WHERE id = timesheet_comments.timesheet_id 
        AND user_id = auth.uid()
      )
      -- Or is admin
      OR is_admin()
    )
  );

-- ============================================
-- ATTACHMENTS POLICIES
-- ============================================

-- Users can view their own attachments
CREATE POLICY "Users can view own attachments"
  ON attachments FOR SELECT
  USING (uploader_id = auth.uid());

-- Admins can view all attachments in org
CREATE POLICY "Admins can view all org attachments"
  ON attachments FOR SELECT
  USING (
    org_id = get_user_org_id() 
    AND is_admin()
  );

-- Users can create attachments
CREATE POLICY "Users can create attachments"
  ON attachments FOR INSERT
  WITH CHECK (
    org_id = get_user_org_id() 
    AND uploader_id = auth.uid()
  );

-- Users can delete their own attachments
CREATE POLICY "Users can delete own attachments"
  ON attachments FOR DELETE
  USING (uploader_id = auth.uid());

-- Admins can delete any attachment in org
CREATE POLICY "Admins can delete org attachments"
  ON attachments FOR DELETE
  USING (
    org_id = get_user_org_id() 
    AND is_admin()
  );
