-- Update Profiles Table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS surname TEXT,
ADD COLUMN IF NOT EXISTS contact_details TEXT,
ADD COLUMN IF NOT EXISTS stand_number TEXT;

-- Create Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  group_name TEXT NOT NULL, -- 'Professional', 'Contractor', 'Accommodation', 'Business', 'Municipal', 'Emergency'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Suppliers Table
CREATE TABLE IF NOT EXISTS suppliers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category_id UUID REFERENCES categories(id),
  contact_details TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('active', 'inactive', 'pending', 'defunct')),
  upvotes INT DEFAULT 0,
  downvotes INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Votes Table
CREATE TABLE IF NOT EXISTS supplier_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  supplier_id UUID REFERENCES suppliers(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  vote_direction TEXT CHECK (vote_direction IN ('up', 'down')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(supplier_id, user_id)
);

-- Create Reports/Notifications Table
CREATE TABLE IF NOT EXISTS reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  supplier_id UUID REFERENCES suppliers(id), -- Optional
  description TEXT NOT NULL,
  type TEXT CHECK (type IN ('snag', 'suggestion', 'incorrect_details', 'recommendation_request')),
  status TEXT DEFAULT 'open', -- 'open', 'resolved'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS Policies (Basic)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public categories are viewable by everyone" ON categories FOR SELECT USING (true);
CREATE POLICY "Admins can insert categories" ON categories FOR INSERT WITH CHECK (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));
CREATE POLICY "Admins can update categories" ON categories FOR UPDATE USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Suppliers are viewable by everyone" ON suppliers FOR SELECT USING (true);
CREATE POLICY "Admins can insert suppliers" ON suppliers FOR INSERT WITH CHECK (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));
CREATE POLICY "Admins can update suppliers" ON suppliers FOR UPDATE USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

ALTER TABLE supplier_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Votes are viewable by everyone" ON supplier_votes FOR SELECT USING (true);
CREATE POLICY "Users can vote" ON supplier_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own vote" ON supplier_votes FOR UPDATE USING (auth.uid() = user_id);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can create reports" ON reports FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view reports" ON reports FOR SELECT USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));
CREATE POLICY "Users can view own reports" ON reports FOR SELECT USING (auth.uid() = user_id);

-- Seed Categories
INSERT INTO categories (name, group_name) VALUES
('GP', 'Professional'),
('Specialist', 'Professional'),
('Lawyer', 'Professional'),
('IT', 'Professional'),
('Architect', 'Professional'),
('Plumber', 'Contractor'),
('Electrician', 'Contractor'),
('Handyman', 'Contractor'),
('Buying', 'Accommodation'),
('Renting', 'Accommodation'),
('Water', 'Municipal'),
('Electricity', 'Municipal'),
('Police', 'Emergency'),
('Ambulance', 'Emergency'),
('Fire', 'Emergency');

