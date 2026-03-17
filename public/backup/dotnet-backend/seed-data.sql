-- ============================================================
-- Khetify Data Seed for Azure PostgreSQL (.NET Backend)
-- Run AFTER EF Core migration has created tables
-- ============================================================
-- NOTE: Passwords cannot be exported from Supabase Auth.
-- All users below get a default password. They MUST reset on first login.
-- Default password hash = BCrypt hash of "Khetify@123"
-- Generate with: BCrypt.Net.BCrypt.HashPassword("Khetify@123")
-- ============================================================

-- ===== USERS =====
-- You must generate proper BCrypt hashes. Replace the placeholder below.
-- In C# run: Console.WriteLine(BCrypt.Net.BCrypt.HashPassword("Khetify@123"));

INSERT INTO users (id, email, password_hash, created_at, updated_at) VALUES
('6a8bf873-6c43-4db8-8810-bc03ca23640d', 'khetify@admin.com', '$2a$11$PLACEHOLDER_HASH_REPLACE_ME', NOW(), NOW()),
('e86ec669-739a-40fc-be0f-e7467c5f7c0a', 'sujay@khetify.com', '$2a$11$PLACEHOLDER_HASH_REPLACE_ME', NOW(), NOW()),
('a00ddadd-e056-4afd-9619-e403abcc26b3', 'ram@khetify.com', '$2a$11$PLACEHOLDER_HASH_REPLACE_ME', NOW(), NOW()),
('1ff34348-620f-48b8-8442-bad0fba9fef8', 'ajit@khetify.com', '$2a$11$PLACEHOLDER_HASH_REPLACE_ME', NOW(), NOW()),
('16f08f86-5ea2-40d6-8867-b78fe7011681', 'supesh@khetify.com', '$2a$11$PLACEHOLDER_HASH_REPLACE_ME', NOW(), NOW()),
('dc3e80ae-d646-4136-8ded-5cde40334bd5', 'dhanraj@khetify.com', '$2a$11$PLACEHOLDER_HASH_REPLACE_ME', NOW(), NOW()),
('cbe61988-e557-476a-9aa2-c2dd9254948c', 'gaurav@khetify.com', '$2a$11$PLACEHOLDER_HASH_REPLACE_ME', NOW(), NOW()),
('20a96588-f17f-43eb-a888-20f308ba76f1', 'ankush@khetify.com', '$2a$11$PLACEHOLDER_HASH_REPLACE_ME', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ===== PROFILES =====
INSERT INTO profiles (id, user_id, full_name, phone, avatar_url, shop_image, free_delivery, created_at, updated_at) VALUES
(gen_random_uuid(), '6a8bf873-6c43-4db8-8810-bc03ca23640d', 'Khetify', '2258085280', NULL, NULL, false, NOW(), NOW()),
(gen_random_uuid(), 'e86ec669-739a-40fc-be0f-e7467c5f7c0a', 'Sujay Khond', '7741015729', NULL, NULL, false, NOW(), NOW()),
(gen_random_uuid(), 'a00ddadd-e056-4afd-9619-e403abcc26b3', 'Ram Mangle', '9529509863', NULL, NULL, false, NOW(), NOW()),
(gen_random_uuid(), '1ff34348-620f-48b8-8442-bad0fba9fef8', 'Ajit Automobiles & Agrotech', '9518351082', NULL, NULL, false, NOW(), NOW()),
(gen_random_uuid(), '16f08f86-5ea2-40d6-8867-b78fe7011681', 'Supesh Khumkar', '8767095030', NULL, NULL, false, NOW(), NOW()),
(gen_random_uuid(), 'dc3e80ae-d646-4136-8ded-5cde40334bd5', 'Dhanraj mangale', '7498149631', NULL, NULL, false, NOW(), NOW()),
(gen_random_uuid(), 'cbe61988-e557-476a-9aa2-c2dd9254948c', 'Gaurav sabale', '9834930572', NULL, NULL, false, NOW(), NOW()),
(gen_random_uuid(), '20a96588-f17f-43eb-a888-20f308ba76f1', 'Ankush Wagh', '8830964665', NULL, NULL, false, NOW(), NOW())
ON CONFLICT (user_id) DO NOTHING;

-- ===== USER ROLES =====
INSERT INTO user_roles (id, user_id, role, created_at) VALUES
(gen_random_uuid(), '6a8bf873-6c43-4db8-8810-bc03ca23640d', 'admin', NOW()),
(gen_random_uuid(), 'e86ec669-739a-40fc-be0f-e7467c5f7c0a', 'admin', NOW()),
(gen_random_uuid(), 'a00ddadd-e056-4afd-9619-e403abcc26b3', 'admin', NOW()),
(gen_random_uuid(), '1ff34348-620f-48b8-8442-bad0fba9fef8', 'seller', NOW()),
(gen_random_uuid(), '16f08f86-5ea2-40d6-8867-b78fe7011681', 'customer', NOW()),
(gen_random_uuid(), 'dc3e80ae-d646-4136-8ded-5cde40334bd5', 'customer', NOW()),
(gen_random_uuid(), 'cbe61988-e557-476a-9aa2-c2dd9254948c', 'seller', NOW()),
(gen_random_uuid(), '20a96588-f17f-43eb-a888-20f308ba76f1', 'customer', NOW())
ON CONFLICT (user_id, role) DO NOTHING;

-- ===== PRODUCTS =====
INSERT INTO products (id, seller_id, name, name_hi, description, description_hi, price, original_price, category, image, unit, stock, is_organic, is_approved, created_at, updated_at) VALUES
('77a5ebf9-d863-4402-ad41-526941283710', '1ff34348-620f-48b8-8442-bad0fba9fef8', 'chaff cutter machine', NULL, 'Motor 3 hp\nBlades 4\nSingle phase\nWeight 75 kg\nConveyor belt', NULL, 24000.00, 28000.00, 'tools', 'https://rnnipawqtzbhtgrlajmc.supabase.co/storage/v1/object/public/product-images/1ff34348-620f-48b8-8442-bad0fba9fef8/1771328310179-0.jpg', 'piece', 10, false, true, '2026-02-17 11:38:30+00', NOW()),
('050fb686-3d34-4d95-a404-a5fbdf2c7d4a', '1ff34348-620f-48b8-8442-bad0fba9fef8', 'Gasoline petrol engine 6.5hp', NULL, 'Hp 6.5\nWeight 9 kg\nPetrol tank capacity 5 ltr', NULL, 6500.00, 8500.00, 'tools', 'https://rnnipawqtzbhtgrlajmc.supabase.co/storage/v1/object/public/product-images/1ff34348-620f-48b8-8442-bad0fba9fef8/1771328513974-0.jpg', 'piece', 4, false, true, '2026-02-17 11:41:54+00', NOW()),
('97b03d9b-d0c3-4b1a-84cb-174e30f2762b', '1ff34348-620f-48b8-8442-bad0fba9fef8', 'Htp with engine srayer set', NULL, 'Engine hp 6.5\nHtp no 30\nWeight 20 kg', NULL, 11800.00, 15000.00, 'tools', 'https://rnnipawqtzbhtgrlajmc.supabase.co/storage/v1/object/public/product-images/1ff34348-620f-48b8-8442-bad0fba9fef8/1771328732212-0.jpg', 'piece', 7, false, true, '2026-02-17 11:45:32+00', NOW()),
('98c97a14-5992-4176-b7c9-3b0f95633fea', 'cbe61988-e557-476a-9aa2-c2dd9254948c', 'Drip irrigation pipe', NULL, 'Inline cl1, 16mm', NULL, 1200.00, 1250.00, 'irrigation', 'https://rnnipawqtzbhtgrlajmc.supabase.co/storage/v1/object/public/product-images/cbe61988-e557-476a-9aa2-c2dd9254948c/1772793044242-0.jpg', 'pack', 100, true, true, '2026-03-06 10:24:59+00', NOW())
ON CONFLICT (id) DO NOTHING;

-- ===== ORDERS =====
INSERT INTO orders (id, customer_id, total, status, payment_method, shipping_address, created_at, updated_at) VALUES
('8b9c30d6-a699-42ab-bdcd-7d01c658088e', 'e86ec669-739a-40fc-be0f-e7467c5f7c0a', 530.00, 'delivered', 'cod', '{"address":"khetify.shop@gmail.com","city":"Khetify","fullName":"Khetify","phone":"1234567895","pincode":"444201","state":"Maharashtra"}', '2026-01-29 02:00:29+00', '2026-01-29 02:00:58+00')
ON CONFLICT (id) DO NOTHING;

-- ===== ORDER ITEMS =====
INSERT INTO order_items (id, order_id, product_id, seller_id, product_name, quantity, price, created_at) VALUES
('087da0a7-42b7-4006-b19a-c350e213481e', '8b9c30d6-a699-42ab-bdcd-7d01c658088e', NULL, NULL, 'Roundup', 1, 500.00, '2026-01-29 02:00:29+00')
ON CONFLICT (id) DO NOTHING;

-- ===== NOTIFICATIONS =====
INSERT INTO notifications (id, user_id, title, message, type, order_id, is_read, created_at) VALUES
('a4ce05ad-1e2e-41af-ad93-d80e3694683f', 'a00ddadd-e056-4afd-9619-e403abcc26b3', 'New Order Placed! 📦', 'Sujay Khond placed an order worth ₹530 with 1 item(s).', 'order', '8b9c30d6-a699-42ab-bdcd-7d01c658088e', true, '2026-01-29 02:00:33+00'),
('57b5c0d6-427c-4958-89d3-bf8d5f465364', 'e86ec669-739a-40fc-be0f-e7467c5f7c0a', 'New Order Placed! 📦', 'Sujay Khond placed an order worth ₹530 with 1 item(s).', 'order', '8b9c30d6-a699-42ab-bdcd-7d01c658088e', true, '2026-01-29 02:00:33+00'),
('4bdd4936-ad1d-40d3-a84e-b1ba52830f9e', '6a8bf873-6c43-4db8-8810-bc03ca23640d', 'New Order Placed! 📦', 'Sujay Khond placed an order worth ₹530 with 1 item(s).', 'order', '8b9c30d6-a699-42ab-bdcd-7d01c658088e', false, '2026-01-29 02:00:33+00')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- DONE! 
-- Summary: 8 users, 8 profiles, 8 roles, 4 products, 1 order, 
--          1 order item, 3 notifications
--
-- IMPORTANT NEXT STEPS:
-- 1. Replace ALL "$2a$11$PLACEHOLDER_HASH_REPLACE_ME" with a real
--    BCrypt hash. Generate one in C#:
--    Console.WriteLine(BCrypt.Net.BCrypt.HashPassword("Khetify@123"));
-- 2. Product images still point to Supabase storage URLs.
--    Re-upload images to Azure Blob Storage and update the URLs.
-- 3. Tell all users to reset their passwords on first login.
-- ============================================================
