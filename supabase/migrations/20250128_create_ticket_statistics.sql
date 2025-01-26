-- Safety check function
DO $$
BEGIN
    -- Check if the view exists and has different columns
    IF EXISTS (
        SELECT 1
        FROM information_schema.views
        WHERE table_schema = 'public'
        AND table_name = 'ticket_statistics'
    ) THEN
        -- Log that we're replacing the view
        RAISE NOTICE 'Replacing existing ticket_statistics view';
    END IF;
END $$;

-- Create ticket statistics view
CREATE OR REPLACE VIEW ticket_statistics AS
SELECT
    status,
    COUNT(*) as count,
    queue_id,
    COUNT(CASE WHEN assigned_to IS NULL THEN 1 END) as unassigned_count,
    COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved_count,
    AVG(EXTRACT(EPOCH FROM (updated_at - created_at))/3600)::numeric(10,2) as avg_resolution_time_hours
FROM tickets
GROUP BY status, queue_id;

-- Safety check for worker performance view
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.views
        WHERE table_schema = 'public'
        AND table_name = 'worker_performance'
    ) THEN
        RAISE NOTICE 'Replacing existing worker_performance view';
    END IF;
END $$;

-- Create worker performance view
CREATE OR REPLACE VIEW worker_performance AS
SELECT
    u.id as worker_id,
    u.email,
    COUNT(t.id) as total_assigned,
    COUNT(CASE WHEN t.status = 'resolved' THEN 1 END) as total_resolved,
    AVG(EXTRACT(EPOCH FROM (t.updated_at - t.created_at))/3600)::numeric(10,2) as avg_resolution_time_hours
FROM users u
LEFT JOIN tickets t ON t.assigned_to = u.id
WHERE u.role = 'worker'
GROUP BY u.id, u.email;

-- Add performance indexes
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_queue_id ON tickets(queue_id);
CREATE INDEX IF NOT EXISTS idx_tickets_assigned_to ON tickets(assigned_to);

-- Rollback section
-- To rollback, run the following:
/*
-- Drop new indexes
DROP INDEX IF EXISTS idx_tickets_status;
DROP INDEX IF EXISTS idx_tickets_queue_id;
DROP INDEX IF EXISTS idx_tickets_assigned_to;

-- Drop new views
DROP VIEW IF EXISTS ticket_statistics;
DROP VIEW IF EXISTS worker_performance;

-- Recreate original views if needed
-- Note: Add original view definitions here if they existed before
*/
