/*
  # MessMate Database Schema

  1. New Tables
    - `profiles` - User profile information
    - `messes` - Mess/group information
    - `mess_members` - Junction table for mess membership
    - `deposits` - Member deposits/money additions
    - `meals` - Individual meal records
    - `meal_costs` - Daily meal cost records
    - `bazar_assignments` - Bazar date assignments for members

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Ensure users can only access their own mess data
*/

-- Create profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  phone text,
  gender text CHECK (gender IN ('male', 'female', 'other')),
  address text,
  points integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create messes table
CREATE TABLE IF NOT EXISTS messes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  created_by uuid REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create mess_members table
CREATE TABLE IF NOT EXISTS mess_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mess_id uuid REFERENCES messes(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  role text CHECK (role IN ('manager', 'member')) DEFAULT 'member',
  joined_at timestamptz DEFAULT now(),
  UNIQUE(mess_id, user_id)
);

-- Create deposits table
CREATE TABLE IF NOT EXISTS deposits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mess_id uuid REFERENCES messes(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  amount decimal(10,2) NOT NULL,
  details text,
  deposit_date date DEFAULT CURRENT_DATE,
  created_by uuid REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Create meals table
CREATE TABLE IF NOT EXISTS meals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mess_id uuid REFERENCES messes(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  meal_date date DEFAULT CURRENT_DATE,
  breakfast decimal(3,2) DEFAULT 0,
  lunch decimal(3,2) DEFAULT 0,
  dinner decimal(3,2) DEFAULT 0,
  created_by uuid REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(mess_id, user_id, meal_date)
);

-- Create meal_costs table
CREATE TABLE IF NOT EXISTS meal_costs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mess_id uuid REFERENCES messes(id) ON DELETE CASCADE,
  cost_date date DEFAULT CURRENT_DATE,
  amount decimal(10,2) NOT NULL,
  details text,
  shopper_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  created_by uuid REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Create bazar_assignments table
CREATE TABLE IF NOT EXISTS bazar_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mess_id uuid REFERENCES messes(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  assigned_date date NOT NULL,
  created_by uuid REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(mess_id, assigned_date)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE messes ENABLE ROW LEVEL SECURITY;
ALTER TABLE mess_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE bazar_assignments ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Messes policies
CREATE POLICY "Users can read messes they belong to"
  ON messes FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT mess_id FROM mess_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messes"
  ON messes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Mess members policies
CREATE POLICY "Users can read mess members of their messes"
  ON mess_members FOR SELECT
  TO authenticated
  USING (
    mess_id IN (
      SELECT mess_id FROM mess_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Managers can insert mess members"
  ON mess_members FOR INSERT
  TO authenticated
  WITH CHECK (
    mess_id IN (
      SELECT mess_id FROM mess_members 
      WHERE user_id = auth.uid() AND role = 'manager'
    )
  );

-- Deposits policies
CREATE POLICY "Users can read deposits of their messes"
  ON deposits FOR SELECT
  TO authenticated
  USING (
    mess_id IN (
      SELECT mess_id FROM mess_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Managers can insert deposits"
  ON deposits FOR INSERT
  TO authenticated
  WITH CHECK (
    mess_id IN (
      SELECT mess_id FROM mess_members 
      WHERE user_id = auth.uid() AND role = 'manager'
    )
  );

-- Meals policies
CREATE POLICY "Users can read meals of their messes"
  ON meals FOR SELECT
  TO authenticated
  USING (
    mess_id IN (
      SELECT mess_id FROM mess_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Managers can insert/update meals"
  ON meals FOR ALL
  TO authenticated
  USING (
    mess_id IN (
      SELECT mess_id FROM mess_members 
      WHERE user_id = auth.uid() AND role = 'manager'
    )
  );

-- Meal costs policies
CREATE POLICY "Users can read meal costs of their messes"
  ON meal_costs FOR SELECT
  TO authenticated
  USING (
    mess_id IN (
      SELECT mess_id FROM mess_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Managers can insert meal costs"
  ON meal_costs FOR INSERT
  TO authenticated
  WITH CHECK (
    mess_id IN (
      SELECT mess_id FROM mess_members 
      WHERE user_id = auth.uid() AND role = 'manager'
    )
  );

-- Bazar assignments policies
CREATE POLICY "Users can read bazar assignments of their messes"
  ON bazar_assignments FOR SELECT
  TO authenticated
  USING (
    mess_id IN (
      SELECT mess_id FROM mess_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Managers can manage bazar assignments"
  ON bazar_assignments FOR ALL
  TO authenticated
  USING (
    mess_id IN (
      SELECT mess_id FROM mess_members 
      WHERE user_id = auth.uid() AND role = 'manager'
    )
  );

-- Create functions for automatic profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();