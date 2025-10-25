-- AgriTrack Sample Data
-- Use this to populate your database with test data for development

-- NOTE: Before running this, you need to create actual users via the signup endpoint
-- Replace the UUIDs below with actual user IDs from your auth.users table

-- Example: After creating users, get their IDs:
-- SELECT id, email, role FROM users;

-- ============================================
-- SAMPLE DATA INSTRUCTIONS
-- ============================================
-- 1. Create 3 users via the signup endpoint:
--    - farmer@test.com (role: farmer)
--    - vet@test.com (role: vet)
--    - supplier@test.com (role: agrovets)
-- 2. Get their UUIDs from the users table
-- 3. Replace the placeholder UUIDs below
-- 4. Run this script

-- ============================================
-- PLACEHOLDER UUIDs (REPLACE THESE!)
-- ============================================
-- FARMER_UUID = 'replace-with-farmer-uuid'
-- VET_UUID = 'replace-with-vet-uuid'
-- AGROVETS_UUID = 'replace-with-agrovets-uuid'

-- ============================================
-- SAMPLE FARMS
-- ============================================
-- INSERT INTO farms (farmer_id, name, location_text, location_coords, description) VALUES
-- ('FARMER_UUID', 'Green Valley Farm', '123 Farm Road, Countryside', '{"lat": 40.7128, "lng": -74.0060}', 'A sustainable family farm focusing on dairy and crops'),
-- ('FARMER_UUID', 'Sunshine Acres', '456 Rural Lane, Farmville', '{"lat": 40.7580, "lng": -73.9855}', 'Organic vegetable and poultry farm');

-- ============================================
-- SAMPLE CROPS
-- ============================================
-- INSERT INTO crops (farm_id, crop_type, variety, planting_date, harvest_date, expected_yield, status, field_location) VALUES
-- ((SELECT id FROM farms WHERE name = 'Green Valley Farm'), 'Maize', 'Hybrid 614', '2024-03-15', '2024-08-20', 5000, 'active', 'North Field'),
-- ((SELECT id FROM farms WHERE name = 'Green Valley Farm'), 'Wheat', 'Winter Wheat', '2024-02-01', '2024-07-15', 3000, 'active', 'South Field'),
-- ((SELECT id FROM farms WHERE name = 'Sunshine Acres'), 'Tomatoes', 'Roma', '2024-04-01', '2024-07-30', 2000, 'active', 'Greenhouse A');

-- ============================================
-- SAMPLE LIVESTOCK
-- ============================================
-- INSERT INTO livestock (farm_id, animal_type, id_tag, name, breed, date_of_birth, gender, health_status) VALUES
-- ((SELECT id FROM farms WHERE name = 'Green Valley Farm'), 'Cow', 'COW-001', 'Bessie', 'Holstein', '2021-05-15', 'female', 'healthy'),
-- ((SELECT id FROM farms WHERE name = 'Green Valley Farm'), 'Cow', 'COW-002', 'Daisy', 'Holstein', '2022-03-20', 'female', 'healthy'),
-- ((SELECT id FROM farms WHERE name = 'Green Valley Farm'), 'Cow', 'COW-003', 'Bull', 'Angus', '2020-08-10', 'male', 'healthy'),
-- ((SELECT id FROM farms WHERE name = 'Sunshine Acres'), 'Chicken', 'CHK-001', NULL, 'Rhode Island Red', '2023-01-15', 'female', 'healthy'),
-- ((SELECT id FROM farms WHERE name = 'Sunshine Acres'), 'Chicken', 'CHK-002', NULL, 'Rhode Island Red', '2023-01-15', 'female', 'healthy');

-- ============================================
-- SAMPLE HEALTH RECORDS
-- ============================================
-- INSERT INTO health_records (animal_id, record_type, record_date, diagnosis, treatment, medications) VALUES
-- ((SELECT id FROM livestock WHERE id_tag = 'COW-001'), 'vaccination', '2024-01-15', 'Annual vaccination', 'Administered vaccine', 'Bovine vaccine'),
-- ((SELECT id FROM livestock WHERE id_tag = 'COW-002'), 'checkup', '2024-02-01', 'Regular checkup', 'All healthy', NULL),
-- ((SELECT id FROM livestock WHERE id_tag = 'CHK-001'), 'vaccination', '2024-03-01', 'Poultry vaccination', 'Administered vaccine', 'Newcastle disease vaccine');

-- ============================================
-- SAMPLE SALES
-- ============================================
-- INSERT INTO sales (farm_id, product_name, product_type, quantity, unit, price_per_unit, total_amount, buyer_name, sale_date, payment_status) VALUES
-- ((SELECT id FROM farms WHERE name = 'Green Valley Farm'), 'Fresh Milk', 'dairy', 100, 'liters', 2.50, 250.00, 'Local Dairy Co.', '2024-10-01', 'paid'),
-- ((SELECT id FROM farms WHERE name = 'Green Valley Farm'), 'Maize', 'crop', 500, 'kg', 0.80, 400.00, 'Feed Store', '2024-09-15', 'paid'),
-- ((SELECT id FROM farms WHERE name = 'Sunshine Acres'), 'Fresh Eggs', 'eggs', 200, 'dozen', 5.00, 1000.00, 'Supermarket', '2024-10-20', 'pending'),
-- ((SELECT id FROM farms WHERE name = 'Sunshine Acres'), 'Tomatoes', 'crop', 150, 'kg', 3.00, 450.00, 'Restaurant', '2024-10-18', 'paid');

-- ============================================
-- SAMPLE INVENTORY
-- ============================================
-- INSERT INTO inventory (farm_id, item_type, item_name, quantity, unit, supplier, cost, reorder_level) VALUES
-- ((SELECT id FROM farms WHERE name = 'Green Valley Farm'), 'feed', 'Dairy Meal', 500, 'kg', 'Farm Supply Store', 300.00, 100),
-- ((SELECT id FROM farms WHERE name = 'Green Valley Farm'), 'supplement', 'Mineral Mix', 50, 'kg', 'Vet Supplies', 150.00, 20),
-- ((SELECT id FROM farms WHERE name = 'Green Valley Farm'), 'medication', 'Antibiotic Powder', 10, 'kg', 'Vet Clinic', 200.00, 5),
-- ((SELECT id FROM farms WHERE name = 'Sunshine Acres'), 'feed', 'Chicken Feed', 200, 'kg', 'Poultry Supplies', 180.00, 50);

-- ============================================
-- SAMPLE PREGNANCIES
-- ============================================
-- INSERT INTO pregnancies (animal_id, father_id, breeding_date, expected_due_date, status) VALUES
-- ((SELECT id FROM livestock WHERE id_tag = 'COW-001'), (SELECT id FROM livestock WHERE id_tag = 'COW-003'), '2024-07-01', '2025-04-08', 'active'),
-- ((SELECT id FROM livestock WHERE id_tag = 'COW-002'), (SELECT id FROM livestock WHERE id_tag = 'COW-003'), '2024-06-15', '2025-03-23', 'active');

-- ============================================
-- SAMPLE VET CONTACTS
-- ============================================
-- INSERT INTO vets_contacts (farmer_id, vet_name, phone, email, specialty) VALUES
-- ('FARMER_UUID', 'Dr. Sarah Johnson', '555-0101', 'sarah@vetclinic.com', 'Large Animals'),
-- ('FARMER_UUID', 'Dr. Michael Brown', '555-0102', 'michael@animalcare.com', 'Poultry'),
-- ('FARMER_UUID', 'Dr. Emily Davis', '555-0103', 'emily@farmvets.com', 'General Practice');

-- ============================================
-- SAMPLE MARKETPLACE LISTINGS
-- ============================================
-- INSERT INTO marketplace_listings (agrovets_id, product_name, description, category, price, discount_percentage, stock_quantity, unit, status) VALUES
-- ('AGROVETS_UUID', 'Premium Dairy Feed', 'High-quality feed for dairy cattle, enriched with vitamins', 'feed', 45.00, 10, 500, 'bags', 'active'),
-- ('AGROVETS_UUID', 'Organic Chicken Feed', 'GMO-free organic feed for layers and broilers', 'feed', 35.00, 0, 300, 'bags', 'active'),
-- ('AGROVETS_UUID', 'Mineral Supplement', 'Essential minerals for livestock health', 'supplement', 25.00, 15, 200, 'kg', 'active'),
-- ('AGROVETS_UUID', 'Deworming Medication', 'Broad-spectrum dewormer for cattle', 'medication', 60.00, 0, 50, 'bottles', 'active'),
-- ('AGROVETS_UUID', 'Automatic Feeder', 'Time-controlled automatic feeding system', 'equipment', 299.00, 20, 10, 'units', 'active');

-- ============================================
-- SAMPLE FARM-VET ASSOCIATIONS
-- ============================================
-- INSERT INTO farm_vet_associations (farm_id, vet_id, invitation_status, invited_by, last_visit_date) VALUES
-- ((SELECT id FROM farms WHERE name = 'Green Valley Farm'), 'VET_UUID', 'accepted', 'FARMER_UUID', '2024-10-15');

-- ============================================
-- SAMPLE NOTEBOOK ENTRIES
-- ============================================
-- INSERT INTO notebook (user_id, farm_id, title, content, tags) VALUES
-- ('FARMER_UUID', (SELECT id FROM farms WHERE name = 'Green Valley Farm'), 'Winter Preparations', 'Need to prepare winter shelter for cattle. Check heating system in barn.', ARRAY['winter', 'maintenance']),
-- ('FARMER_UUID', (SELECT id FROM farms WHERE name = 'Green Valley Farm'), 'Vaccination Schedule', 'Annual vaccinations due in January. Book vet appointment early.', ARRAY['health', 'reminder']),
-- ('VET_UUID', (SELECT id FROM farms WHERE name = 'Green Valley Farm'), 'Farm Visit Notes', 'All animals in good health. Recommended mineral supplements for breeding cows.', ARRAY['visit', 'recommendations']);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these after inserting sample data to verify:

-- SELECT 'Farms' as table_name, COUNT(*) as count FROM farms
-- UNION ALL
-- SELECT 'Crops', COUNT(*) FROM crops
-- UNION ALL
-- SELECT 'Livestock', COUNT(*) FROM livestock
-- UNION ALL
-- SELECT 'Health Records', COUNT(*) FROM health_records
-- UNION ALL
-- SELECT 'Sales', COUNT(*) FROM sales
-- UNION ALL
-- SELECT 'Inventory', COUNT(*) FROM inventory
-- UNION ALL
-- SELECT 'Pregnancies', COUNT(*) FROM pregnancies
-- UNION ALL
-- SELECT 'Vet Contacts', COUNT(*) FROM vets_contacts
-- UNION ALL
-- SELECT 'Notebook', COUNT(*) FROM notebook
-- UNION ALL
-- SELECT 'Marketplace', COUNT(*) FROM marketplace_listings
-- UNION ALL
-- SELECT 'Associations', COUNT(*) FROM farm_vet_associations;
