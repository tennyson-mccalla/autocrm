import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || 'http://127.0.0.1:54321',
  process.env.SUPABASE_SERVICE_KEY || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    }
  }
);

async function createTestUsers() {
  try {
    console.log('Creating test users...');

    // Create admin user
    const { data: admin, error: adminError } = await supabase.auth.admin.createUser({
      email: 'admin@test.com',
      password: 'password123',
      email_confirm: true,
      user_metadata: {
        full_name: 'Admin User',
        role: 'admin',
        email_verified: true
      }
    });
    if (adminError) throw adminError;
    console.log('Created admin user:', admin);

    // Create worker users
    const { data: alice, error: aliceError } = await supabase.auth.admin.createUser({
      email: 'alice@test.com',
      password: 'password123',
      email_confirm: true,
      user_metadata: {
        full_name: 'Alice Worker',
        role: 'worker',
        email_verified: true
      }
    });
    if (aliceError) throw aliceError;
    console.log('Created worker user (Alice):', alice);

    const { data: bob, error: bobError } = await supabase.auth.admin.createUser({
      email: 'bob@test.com',
      password: 'password123',
      email_confirm: true,
      user_metadata: {
        full_name: 'Bob Worker',
        role: 'worker',
        email_verified: true
      }
    });
    if (bobError) throw bobError;
    console.log('Created worker user (Bob):', bob);

    // Create customer users
    const { data: charlie, error: charlieError } = await supabase.auth.admin.createUser({
      email: 'charlie@test.com',
      password: 'password123',
      email_confirm: true,
      user_metadata: {
        full_name: 'Charlie Customer',
        role: 'customer',
        email_verified: true
      }
    });
    if (charlieError) throw charlieError;
    console.log('Created customer user (Charlie):', charlie);

    const { data: diana, error: dianaError } = await supabase.auth.admin.createUser({
      email: 'diana@test.com',
      password: 'password123',
      email_confirm: true,
      user_metadata: {
        full_name: 'Diana Customer',
        role: 'customer',
        email_verified: true
      }
    });
    if (dianaError) throw dianaError;
    console.log('Created customer user (Diana):', diana);

    console.log('All test users created successfully!');

  } catch (error) {
    console.error('Error creating test users:', error);
  }
}

createTestUsers();
