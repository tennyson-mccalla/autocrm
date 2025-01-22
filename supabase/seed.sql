-- Seed Users
INSERT INTO users (id, email, role, full_name, metadata) VALUES
  -- Admin
  ('d0d4671e-3b1d-4b39-b9a1-df62a6651a56', 'admin@autocrm.com', 'admin', 'Admin User', '{"department": "Management"}'),

  -- Workers
  ('8f9c55da-5c13-4f28-9e4e-74a8c1834875', 'worker1@autocrm.com', 'worker', 'Alice Worker', '{"department": "Support", "specialty": "Technical"}'),
  ('b4c45d3a-7d2f-4b6c-9f24-60d0f6e7d723', 'worker2@autocrm.com', 'worker', 'Bob Worker', '{"department": "Support", "specialty": "Billing"}'),

  -- Customers
  ('e5c6cf84-9c3d-4b63-8a7c-32d7c2941e12', 'customer1@example.com', 'customer', 'Charlie Customer', '{"company": "TechCorp"}'),
  ('f7d8e9a2-6b5c-4f3d-8e9f-1a2b3c4d5e6f', 'customer2@example.com', 'customer', 'Diana Customer', '{"company": "StartupInc"}');

-- Seed Tickets
INSERT INTO tickets (id, title, description, status, priority, created_by, assigned_to, metadata) VALUES
  -- High priority ticket
  ('a1b2c3d4-e5f6-4a5b-8c9d-1a2b3c4d5e6f',
   'Unable to access account',
   'Getting 403 error when trying to log in',
   'open',
   'high',
   'e5c6cf84-9c3d-4b63-8a7c-32d7c2941e12', -- Charlie
   '8f9c55da-5c13-4f28-9e4e-74a8c1834875', -- Alice
   '{"browser": "Chrome", "version": "120.0"}'),

  -- Medium priority ticket
  ('b2c3d4e5-f6a7-5b6c-9d0e-2b3c4d5e6f7a',
   'Billing inquiry',
   'Question about last month''s invoice',
   'in_progress',
   'medium',
   'f7d8e9a2-6b5c-4f3d-8e9f-1a2b3c4d5e6f', -- Diana
   'b4c45d3a-7d2f-4b6c-9f24-60d0f6e7d723', -- Bob
   '{"invoice_id": "INV-2024-01"}'),

  -- Resolved ticket
  ('c3d4e5f6-a7b8-6c7d-0e1f-3b4c5d6e7f8a',
   'Feature request: Dark mode',
   'Would like dark mode option in dashboard',
   'resolved',
   'low',
   'e5c6cf84-9c3d-4b63-8a7c-32d7c2941e12', -- Charlie
   '8f9c55da-5c13-4f28-9e4e-74a8c1834875', -- Alice
   '{"area": "UI", "theme": "Dark"}');

-- Seed Conversations
INSERT INTO conversations (ticket_id, user_id, message, internal_note) VALUES
  -- High priority ticket conversation
  ('a1b2c3d4-e5f6-4a5b-8c9d-1a2b3c4d5e6f', 'e5c6cf84-9c3d-4b63-8a7c-32d7c2941e12', 'I keep getting locked out of my account', FALSE),
  ('a1b2c3d4-e5f6-4a5b-8c9d-1a2b3c4d5e6f', '8f9c55da-5c13-4f28-9e4e-74a8c1834875', 'Checking security logs now', FALSE),
  ('a1b2c3d4-e5f6-4a5b-8c9d-1a2b3c4d5e6f', '8f9c55da-5c13-4f28-9e4e-74a8c1834875', 'Multiple failed login attempts detected', TRUE),

  -- Medium priority ticket conversation
  ('b2c3d4e5-f6a7-5b6c-9d0e-2b3c4d5e6f7a', 'f7d8e9a2-6b5c-4f3d-8e9f-1a2b3c4d5e6f', 'I think I was overcharged last month', FALSE),
  ('b2c3d4e5-f6a7-5b6c-9d0e-2b3c4d5e6f7a', 'b4c45d3a-7d2f-4b6c-9f24-60d0f6e7d723', 'Looking into the billing records', FALSE),
  ('b2c3d4e5-f6a7-5b6c-9d0e-2b3c4d5e6f7a', 'b4c45d3a-7d2f-4b6c-9f24-60d0f6e7d723', 'Found duplicate charge - will process refund', TRUE),

  -- Resolved ticket conversation
  ('c3d4e5f6-a7b8-6c7d-0e1f-3b4c5d6e7f8a', 'e5c6cf84-9c3d-4b63-8a7c-32d7c2941e12', 'Dark mode would be great for night work', FALSE),
  ('c3d4e5f6-a7b8-6c7d-0e1f-3b4c5d6e7f8a', '8f9c55da-5c13-4f28-9e4e-74a8c1834875', 'Feature request logged with development team', FALSE),
  ('c3d4e5f6-a7b8-6c7d-0e1f-3b4c5d6e7f8a', '8f9c55da-5c13-4f28-9e4e-74a8c1834875', 'Scheduled for next sprint', TRUE);
