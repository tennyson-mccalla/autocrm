const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function createTicket(data) {
  const { data: ticket, error } = await supabase
    .from('tickets')
    .insert([data])
    .select()
    .single();

  if (error) throw error;
  return ticket;
}

async function getTicketById(id) {
  const { data: ticket, error } = await supabase
    .from('tickets')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return ticket;
}

async function updateTicket(id, updates) {
  const { data: ticket, error } = await supabase
    .from('tickets')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return ticket;
}

async function deleteTicket(id) {
  const { error } = await supabase
    .from('tickets')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
}

module.exports = {
  createTicket,
  getTicketById,
  updateTicket,
  deleteTicket
};
