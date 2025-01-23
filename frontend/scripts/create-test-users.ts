import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// Load the correct .env file
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

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
      continue;
    }

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

createTestUsers()
  .catch(console.error)
  .finally(() => process.exit());
