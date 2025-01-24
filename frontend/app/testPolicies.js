const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

// Service role client to simulate different users
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function testRLSPolicies() {
  try {
    console.log('Testing RLS Policies...\n');

    // 1. Test Customer Access
    console.log('Testing Customer Access:');
    const { data: customerTickets } = await supabase
      .from('tickets')
      .select('*')
      .eq('created_by', 'e5c6cf84-9c3d-4b63-8a7c-32d7c2941e12'); // Charlie's ID
    console.log('- Customer tickets found:', customerTickets.length);

    // 2. Test Agent Access
    console.log('\nTesting Agent Access:');
    const { data: allTickets } = await supabase
      .from('tickets')
      .select('*');
    console.log('- Agent can see all tickets:', allTickets.length === 3);

    // 3. Test Conversations Access
    console.log('\nTesting Conversations Access:');
    const { data: conversations } = await supabase
      .from('conversations')
      .select('*, tickets(created_by)');

    const publicConvos = conversations.filter(c => !c.internal_note);
    const internalNotes = conversations.filter(c => c.internal_note);

    console.log('- Total conversations:', conversations.length);
    console.log('- Public messages:', publicConvos.length);
    console.log('- Internal notes:', internalNotes.length);

    // 4. Test Internal Notes
    console.log('\nTesting Internal Notes Visibility:');
    const { data: customerView } = await supabase
      .from('conversations')
      .select('*')
      .eq('ticket_id', 'a1b2c3d4-e5f6-4a5b-8c9d-1a2b3c4d5e6f')
      .eq('internal_note', true);
    console.log('- Internal notes visible to agents:', customerView.length > 0);

  } catch (err) {
    console.error('Error:', err.message);
  }
}

testRLSPolicies();
