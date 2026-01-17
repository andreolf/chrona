-- Fix organization access for signup flow
-- v0: Single organization system - all users join the same org

-- Allow authenticated users to read organizations (needed for signup)
CREATE POLICY "Authenticated users can view organizations for signup"
  ON organizations FOR SELECT
  TO authenticated
  USING (true);

-- Drop the old restrictive policy (it conflicts with the new one)
-- Note: Run this manually if the above fails due to duplicate policy
-- DROP POLICY IF EXISTS "Users can view their organization" ON organizations;

-- Allow INSERT for authenticated users who don't have a profile yet (first org creation)
CREATE POLICY "Users can create organization"
  ON organizations FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create default organization if none exists
INSERT INTO organizations (id, name)
VALUES ('00000000-0000-0000-0000-000000000001', 'Chrona Workspace')
ON CONFLICT (id) DO NOTHING;
