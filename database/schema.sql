-- AgriTrack Database Schema for Supabase PostgreSQL
-- Run this script in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('farmer', 'vet', 'agrovets')),
  full_name VARCHAR(255),
  phone VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- FARMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS farms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farmer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  location_text TEXT,
  location_coords JSONB, -- {lat: number, lng: number}
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- CROPS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS crops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  crop_type VARCHAR(255) NOT NULL,
  variety VARCHAR(255),
  planting_date DATE,
  harvest_date DATE,
  expected_yield DECIMAL(10, 2),
  actual_yield DECIMAL(10, 2),
  field_location TEXT,
  field_coords JSONB,
  notes TEXT,
  status VARCHAR(50) DEFAULT 'active', -- active, harvested, failed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- LIVESTOCK TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS livestock (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  animal_type VARCHAR(100) NOT NULL, -- cow, chicken, goat, etc.
  id_tag VARCHAR(100) UNIQUE,
  name VARCHAR(255),
  breed VARCHAR(255),
  date_of_birth DATE,
  gender VARCHAR(20) CHECK (gender IN ('male', 'female')),
  location_on_farm TEXT,
  health_status VARCHAR(50) DEFAULT 'healthy', -- healthy, sick, under_treatment, deceased
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- HEALTH RECORDS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS health_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  animal_id UUID NOT NULL REFERENCES livestock(id) ON DELETE CASCADE,
  vet_id UUID REFERENCES users(id) ON DELETE SET NULL,
  record_date DATE NOT NULL DEFAULT CURRENT_DATE,
  record_type VARCHAR(50) NOT NULL, -- vaccination, illness, treatment, checkup
  diagnosis TEXT,
  treatment TEXT,
  medications TEXT,
  notes TEXT,
  next_visit_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- SALES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  product_name VARCHAR(255) NOT NULL,
  product_type VARCHAR(100), -- crop, livestock, dairy, eggs, etc.
  quantity DECIMAL(10, 2) NOT NULL,
  unit VARCHAR(50), -- kg, liters, pieces, etc.
  price_per_unit DECIMAL(10, 2) NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  buyer_name VARCHAR(255),
  buyer_contact VARCHAR(255),
  sale_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_status VARCHAR(50) DEFAULT 'pending', -- pending, paid, partial
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INVENTORY TABLE (Feed & Supplements)
-- ============================================
CREATE TABLE IF NOT EXISTS inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  item_type VARCHAR(50) NOT NULL, -- feed, supplement, medication
  item_name VARCHAR(255) NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL,
  unit VARCHAR(50), -- kg, bags, liters
  supplier VARCHAR(255),
  purchase_date DATE,
  cost DECIMAL(10, 2),
  consumption_log JSONB DEFAULT '[]', -- [{date, quantity, notes}]
  reorder_level DECIMAL(10, 2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- PREGNANCIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS pregnancies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  animal_id UUID NOT NULL REFERENCES livestock(id) ON DELETE CASCADE,
  father_id UUID REFERENCES livestock(id) ON DELETE SET NULL,
  breeding_date DATE,
  expected_due_date DATE NOT NULL,
  actual_birth_date DATE,
  status VARCHAR(50) DEFAULT 'active', -- active, completed, failed
  complications TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- CALVES TABLE (Birth Records)
-- ============================================
CREATE TABLE IF NOT EXISTS calves (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pregnancy_id UUID REFERENCES pregnancies(id) ON DELETE SET NULL,
  mother_id UUID NOT NULL REFERENCES livestock(id) ON DELETE CASCADE,
  livestock_id UUID REFERENCES livestock(id) ON DELETE SET NULL, -- Links to livestock table once registered
  birth_date DATE NOT NULL,
  gender VARCHAR(20) CHECK (gender IN ('male', 'female')),
  birth_weight DECIMAL(10, 2),
  health_status_at_birth VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- VETS CONTACTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS vets_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farmer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vet_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  email VARCHAR(255),
  specialty VARCHAR(255),
  address TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- NOTEBOOK TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS notebook (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
  title VARCHAR(255),
  content TEXT NOT NULL,
  tags TEXT[], -- Array of tags
  is_private BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- MARKETPLACE LISTINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS marketplace_listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agrovets_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100), -- feed, supplement, equipment, medication
  price DECIMAL(10, 2) NOT NULL,
  discount_percentage DECIMAL(5, 2) DEFAULT 0,
  discount_fixed DECIMAL(10, 2) DEFAULT 0,
  stock_quantity DECIMAL(10, 2),
  unit VARCHAR(50),
  image_url TEXT,
  status VARCHAR(50) DEFAULT 'active', -- active, sold_out, inactive
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- FARM-VET ASSOCIATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS farm_vet_associations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  vet_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  invitation_status VARCHAR(50) DEFAULT 'pending', -- pending, accepted, rejected
  invited_by UUID REFERENCES users(id) ON DELETE SET NULL,
  last_visit_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(farm_id, vet_id)
);

-- ============================================
-- MARKETPLACE INQUIRIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS marketplace_inquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID NOT NULL REFERENCES marketplace_listings(id) ON DELETE CASCADE,
  farmer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'open', -- open, responded, closed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_farms_farmer_id ON farms(farmer_id);
CREATE INDEX idx_crops_farm_id ON crops(farm_id);
CREATE INDEX idx_livestock_farm_id ON livestock(farm_id);
CREATE INDEX idx_health_records_animal_id ON health_records(animal_id);
CREATE INDEX idx_health_records_vet_id ON health_records(vet_id);
CREATE INDEX idx_sales_farm_id ON sales(farm_id);
CREATE INDEX idx_inventory_farm_id ON inventory(farm_id);
CREATE INDEX idx_pregnancies_animal_id ON pregnancies(animal_id);
CREATE INDEX idx_calves_mother_id ON calves(mother_id);
CREATE INDEX idx_vets_contacts_farmer_id ON vets_contacts(farmer_id);
CREATE INDEX idx_notebook_user_id ON notebook(user_id);
CREATE INDEX idx_marketplace_listings_agrovets_id ON marketplace_listings(agrovets_id);
CREATE INDEX idx_farm_vet_associations_farm_id ON farm_vet_associations(farm_id);
CREATE INDEX idx_farm_vet_associations_vet_id ON farm_vet_associations(vet_id);
CREATE INDEX idx_marketplace_inquiries_listing_id ON marketplace_inquiries(listing_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE livestock ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE pregnancies ENABLE ROW LEVEL SECURITY;
ALTER TABLE calves ENABLE ROW LEVEL SECURITY;
ALTER TABLE vets_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE notebook ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_listings ENABLE ROW LEVEL SECURITY;
-- Note: farm_vet_associations RLS is disabled to avoid circular dependency
ALTER TABLE marketplace_inquiries ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own data" ON users FOR UPDATE USING (auth.uid() = id);

-- Farms policies - Simplified to avoid circular dependencies
CREATE POLICY "Farmers can manage their own farms" ON farms FOR ALL USING (farmer_id = auth.uid());
-- Note: Vet access to farms temporarily disabled to avoid circular dependency with farm_vet_associations table

-- Crops policies
CREATE POLICY "Farmers can manage crops on their farms" ON crops FOR ALL USING (
  EXISTS (SELECT 1 FROM farms WHERE farms.id = crops.farm_id AND farms.farmer_id = auth.uid())
);

-- Livestock policies - Simplified to avoid circular dependencies
CREATE POLICY "Farmers can manage livestock on their farms" ON livestock FOR ALL USING (
  EXISTS (SELECT 1 FROM farms WHERE farms.id = livestock.farm_id AND farms.farmer_id = auth.uid())
);
-- Note: Vet access to livestock temporarily removed to avoid circular dependency

-- Health records policies - Simplified to avoid circular dependencies
CREATE POLICY "Farmers can manage health records for their animals" ON health_records FOR ALL USING (
  EXISTS (
    SELECT 1 FROM livestock l
    JOIN farms f ON f.id = l.farm_id
    WHERE l.id = health_records.animal_id AND f.farmer_id = auth.uid()
  )
);
-- Note: Vet access to health records temporarily removed to avoid circular dependency

-- Sales policies
CREATE POLICY "Farmers can manage sales on their farms" ON sales FOR ALL USING (
  EXISTS (SELECT 1 FROM farms WHERE farms.id = sales.farm_id AND farms.farmer_id = auth.uid())
);

-- Inventory policies
CREATE POLICY "Farmers can manage inventory on their farms" ON inventory FOR ALL USING (
  EXISTS (SELECT 1 FROM farms WHERE farms.id = inventory.farm_id AND farms.farmer_id = auth.uid())
);

-- Pregnancies policies - Simplified to avoid circular dependencies
CREATE POLICY "Farmers can manage pregnancies on their farms" ON pregnancies FOR ALL USING (
  EXISTS (
    SELECT 1 FROM livestock l
    JOIN farms f ON f.id = l.farm_id
    WHERE l.id = pregnancies.animal_id AND f.farmer_id = auth.uid()
  )
);
-- Note: Vet access to pregnancies temporarily removed to avoid circular dependency

-- Calves policies
CREATE POLICY "Farmers can manage calves on their farms" ON calves FOR ALL USING (
  EXISTS (
    SELECT 1 FROM livestock l
    JOIN farms f ON f.id = l.farm_id
    WHERE l.id = calves.mother_id AND f.farmer_id = auth.uid()
  )
);

-- Vets contacts policies
CREATE POLICY "Farmers can manage their vet contacts" ON vets_contacts FOR ALL USING (farmer_id = auth.uid());

-- Notebook policies
CREATE POLICY "Users can manage their own notes" ON notebook FOR ALL USING (user_id = auth.uid());

-- Marketplace listings policies
CREATE POLICY "Everyone can view active marketplace listings" ON marketplace_listings FOR SELECT USING (status = 'active');
CREATE POLICY "Agrovets can manage their own listings" ON marketplace_listings FOR ALL USING (agrovets_id = auth.uid());

-- Farm-vet associations policies - Temporarily disable RLS to avoid circular dependency
-- This breaks the infinite recursion loop between farms and farm_vet_associations tables
ALTER TABLE farm_vet_associations DISABLE ROW LEVEL SECURITY;

-- Note: Since RLS is disabled on farm_vet_associations, all authenticated users can access this table
-- This is a temporary measure to fix the infinite recursion issue
-- In a production environment, you should implement proper RLS policies or use a different approach

-- Marketplace inquiries policies
CREATE POLICY "Farmers can create inquiries" ON marketplace_inquiries FOR INSERT WITH CHECK (farmer_id = auth.uid());
CREATE POLICY "Farmers can view their own inquiries" ON marketplace_inquiries FOR SELECT USING (farmer_id = auth.uid());
CREATE POLICY "Agrovets can view inquiries for their listings" ON marketplace_inquiries FOR SELECT USING (
  EXISTS (SELECT 1 FROM marketplace_listings WHERE marketplace_listings.id = listing_id AND agrovets_id = auth.uid())
);

-- ============================================
-- FUNCTIONS AND TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update_updated_at trigger to all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_farms_updated_at BEFORE UPDATE ON farms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_crops_updated_at BEFORE UPDATE ON crops FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_livestock_updated_at BEFORE UPDATE ON livestock FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_health_records_updated_at BEFORE UPDATE ON health_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sales_updated_at BEFORE UPDATE ON sales FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON inventory FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pregnancies_updated_at BEFORE UPDATE ON pregnancies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_calves_updated_at BEFORE UPDATE ON calves FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vets_contacts_updated_at BEFORE UPDATE ON vets_contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notebook_updated_at BEFORE UPDATE ON notebook FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_marketplace_listings_updated_at BEFORE UPDATE ON marketplace_listings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_farm_vet_associations_updated_at BEFORE UPDATE ON farm_vet_associations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_marketplace_inquiries_updated_at BEFORE UPDATE ON marketplace_inquiries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================

-- Note: Run the following only if you want sample data
-- You'll need to replace UUIDs with actual user IDs from auth.users after creating accounts

-- Example:
-- INSERT INTO users (id, email, role, full_name) VALUES 
-- ('uuid-from-auth-users', 'farmer@example.com', 'farmer', 'John Farmer');
