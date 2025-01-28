import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseServiceKey) {
  console.error('Error: SUPABASE_SERVICE_KEY environment variable is required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTestUsers() {
  try {
    // Create worker
    const { data: worker, error: workerError } = await supabase.auth.admin.createUser({
      email: 'worker@test.com',
      password: 'Worker123!',
      user_metadata: {
        role: 'worker',
        full_name: 'Alice Worker'
      },
      email_confirm: true
    });
    if (workerError) {
      console.error('Error creating worker:', workerError);
      return;
    }
    console.log('Created worker:', worker);

    // Create second worker
    const { data: worker2, error: worker2Error } = await supabase.auth.admin.createUser({
      email: 'worker2@test.com',
      password: 'Worker123!',
      user_metadata: {
        role: 'worker',
        full_name: 'Bob Worker'
      },
      email_confirm: true
    });
    if (worker2Error) {
      console.error('Error creating second worker:', worker2Error);
      return;
    }
    console.log('Created second worker:', worker2);

    // Create customer
    const { data: customer, error: customerError } = await supabase.auth.admin.createUser({
      email: 'customer@test.com',
      password: 'Customer123!',
      user_metadata: {
        role: 'customer',
        full_name: 'Charlie Customer'
      },
      email_confirm: true
    });
    if (customerError) {
      console.error('Error creating customer:', customerError);
      return;
    }
    console.log('Created customer:', customer);

    // Create second customer
    const { data: customer2, error: customer2Error } = await supabase.auth.admin.createUser({
      email: 'customer2@test.com',
      password: 'Customer123!',
      user_metadata: {
        role: 'customer',
        full_name: 'Diana Customer'
      },
      email_confirm: true
    });
    if (customer2Error) {
      console.error('Error creating second customer:', customer2Error);
      return;
    }
    console.log('Created second customer:', customer2);

    // Create admin
    const { data: admin, error: adminError } = await supabase.auth.admin.createUser({
      email: 'admin@test.com',
      password: 'Admin123!',
      user_metadata: {
        role: 'admin',
        full_name: 'Admin User'
      },
      email_confirm: true
    });
    if (adminError) {
      console.error('Error creating admin:', adminError);
      return;
    }
    console.log('Created admin:', admin);

    console.log('All test users created successfully!');
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

createTestUsers();
