import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env from frontend directory
dotenv.config({ path: path.resolve(__dirname, '../frontend/.env.local') });

const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function createTestData() {
  try {
    // Create admin user
    const { data: adminData, error: adminError } = await supabaseClient.auth.admin.createUser({
      email: 'admin_test@example.com',
      password: 'password123',
      email_confirm: true,
      user_metadata: {
        role: 'admin',
        full_name: 'Test Admin'
      }
    });

    if (adminError) throw adminError;
    console.log('Created admin user:', adminData.user.email);

    // Create test ticket
    const { data: ticketData, error: ticketError } = await supabaseClient
      .from('tickets')
      .insert({
        title: 'Test Ticket',
        description: 'Initial test ticket',
        created_by: adminData.user.id
      })
      .select()
      .single();

    if (ticketError) throw ticketError;
    console.log('Created test ticket:', ticketData.title);

    console.log('All test data created successfully!');
  } catch (error) {
    console.error('Error creating test data:', error);
  }
}

createTestData()
  .catch(console.error)
  .finally(() => process.exit());
