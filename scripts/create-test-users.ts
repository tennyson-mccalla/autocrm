import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const TEST_USERS = [
  {
    email: 'admin@test.com',
    password: 'Admin123!',
    role: 'admin'
  },
  {
    email: 'worker@test.com',
    password: 'Worker123!',
    role: 'worker'
  },
  {
    email: 'customer@test.com',
    password: 'Customer123!',
    role: 'customer'
  }
];

async function createTestUsers() {
  for (const user of TEST_USERS) {
    console.log(`Creating user: ${user.email}`);

    const { data, error } = await supabase.auth.signUp({
      email: user.email,
      password: user.password,
      options: {
        data: { role: user.role }
      }
    });

    if (error) {
      console.error(`Error creating user ${user.email}:`, error.message);
    } else {
      console.log(`Successfully created user: ${user.email}`);

      // Create user profile in users table
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: data.user!.id,
          email: user.email,
          role: user.role,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (profileError) {
        console.error(`Error creating profile for ${user.email}:`, profileError.message);
      } else {
        console.log(`Successfully created profile for: ${user.email}`);
      }
    }
  }
}

createTestUsers()
  .catch(console.error)
  .finally(() => process.exit());
