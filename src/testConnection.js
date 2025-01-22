const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

async function testQueries() {
  try {
    // Test 1: Count users by role (fixed query)
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('role');

    if (userError) throw userError;
    // Count roles manually
    const roleCounts = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});
    console.log('\nUsers by role:', roleCounts);

    // Test 2: Get high priority tickets with customer and agent info
    const { data: tickets, error: ticketError } = await supabase
      .from('tickets')
      .select(`
        *,
        customer:users!tickets_created_by_fkey(full_name, email),
        agent:users!tickets_assigned_to_fkey(full_name)
      `)
      .eq('priority', 'high');

    if (ticketError) throw ticketError;
    console.log('\nHigh priority tickets:', tickets);

  } catch (err) {
    console.error('Error:', err.message);
  }
}

testQueries();
