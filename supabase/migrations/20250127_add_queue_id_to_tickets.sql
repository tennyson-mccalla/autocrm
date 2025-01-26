-- Add queue_id to tickets table
ALTER TABLE tickets ADD COLUMN queue_id UUID REFERENCES queues(id);
CREATE INDEX idx_tickets_queue_id ON tickets(queue_id);
