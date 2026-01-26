-- Food Assistance Directory Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Organizations table
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  town TEXT NOT NULL,
  zip TEXT NOT NULL,
  contact_name TEXT,
  phone TEXT NOT NULL,
  email TEXT,
  website TEXT,
  facebook TEXT,
  assistance_types TEXT[] NOT NULL,
  who_served TEXT[],
  cost TEXT DEFAULT 'free',
  num_meals_available INTEGER,
  operating_hours JSONB,
  hours_notes TEXT,
  donations_accepted TEXT[],
  storage_capacity JSONB,
  comments TEXT,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by TEXT,
  is_active BOOLEAN DEFAULT true,
  spanish_available BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Council donations table
CREATE TABLE council_donations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  donation_date DATE NOT NULL,
  amount DECIMAL(10,2),
  donation_type TEXT NOT NULL,
  description TEXT,
  recorded_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Volunteer needs table
CREATE TABLE volunteer_needs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  needed_date DATE,
  needed_skills TEXT[],
  time_commitment TEXT,
  is_active BOOLEAN DEFAULT true,
  posted_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  contact_email TEXT
);

-- User profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT NOT NULL DEFAULT 'public' CHECK (role IN ('admin', 'organization', 'public')),
  organization_id UUID REFERENCES organizations(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX idx_org_town ON organizations(town);
CREATE INDEX idx_org_zip ON organizations(zip);
CREATE INDEX idx_org_active ON organizations(is_active);
CREATE INDEX idx_org_assistance_types ON organizations USING GIN(assistance_types);
CREATE INDEX idx_donations_org ON council_donations(organization_id);
CREATE INDEX idx_donations_date ON council_donations(donation_date);
CREATE INDEX idx_volunteer_org ON volunteer_needs(organization_id);
CREATE INDEX idx_volunteer_active ON volunteer_needs(is_active);
CREATE INDEX idx_profiles_org ON profiles(organization_id);
CREATE INDEX idx_profiles_role ON profiles(role);

-- Enable Row Level Security
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE council_donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteer_needs ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for organizations

-- Public can read active organizations
CREATE POLICY "Public read active orgs"
  ON organizations FOR SELECT
  USING (is_active = true);

-- Organizations can update their own record
CREATE POLICY "Orgs update own record"
  ON organizations FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT id FROM profiles
      WHERE organization_id = organizations.id
    )
  );

-- Admins can do everything on organizations
CREATE POLICY "Admins full access orgs"
  ON organizations FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

-- RLS Policies for council_donations

-- Only admins can view donations
CREATE POLICY "Admins view donations"
  ON council_donations FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

-- Only admins can manage donations
CREATE POLICY "Admins manage donations"
  ON council_donations FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

-- RLS Policies for volunteer_needs

-- Public can read active volunteer needs
CREATE POLICY "Public read active volunteer needs"
  ON volunteer_needs FOR SELECT
  USING (is_active = true);

-- Organizations can manage their own volunteer needs
CREATE POLICY "Orgs manage own volunteer needs"
  ON volunteer_needs FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM profiles
      WHERE organization_id = volunteer_needs.organization_id
    )
  );

-- Admins can do everything on volunteer needs
CREATE POLICY "Admins full access volunteer needs"
  ON volunteer_needs FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

-- RLS Policies for profiles

-- Users can read their own profile
CREATE POLICY "Users read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile (limited fields)
CREATE POLICY "Users update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins view all profiles"
  ON profiles FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

-- Admins can manage all profiles
CREATE POLICY "Admins manage all profiles"
  ON profiles FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    'public'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update last_updated timestamp
CREATE OR REPLACE FUNCTION update_last_updated()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update last_updated on organizations
CREATE TRIGGER update_org_last_updated
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_last_updated();
