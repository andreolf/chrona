-- ============================================
-- COMPLETE FIX - Run this entire script
-- ============================================

-- 1. Create default organization
INSERT INTO organizations (id, name)
VALUES ('11111111-1111-1111-1111-111111111111', 'Chrona Workspace')
ON CONFLICT (id) DO NOTHING;

-- 2. Update ALL profiles to use this organization
UPDATE profiles 
SET org_id = '11111111-1111-1111-1111-111111111111';

-- 3. Drop old restrictive policies on profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all org profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can update org profiles" ON profiles;

-- 4. Create simple policies that WORK
-- Allow all authenticated users to view all profiles (single-org system for v0)
CREATE POLICY "profiles_select_all"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

-- Allow users to update their own profile
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Allow admins to update any profile
CREATE POLICY "profiles_update_admin"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Allow profile creation during signup
CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- 5. Fix organizations policies
DROP POLICY IF EXISTS "Users can view their organization" ON organizations;
DROP POLICY IF EXISTS "Authenticated users can view organizations for signup" ON organizations;
DROP POLICY IF EXISTS "Users can create organization" ON organizations;

CREATE POLICY "organizations_select_all"
  ON organizations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "organizations_insert"
  ON organizations FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 6. Verify the fix
SELECT 'Profiles after fix:' as info;
SELECT id, full_name, email, role, org_id FROM profiles;

SELECT 'Organizations:' as info;
SELECT id, name FROM organizations;
