import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load env from frontend directory
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Create admin client with service role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // Make sure this is set in your .env.local
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
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
  try {
    for (const user of TEST_USERS) {
      console.log(`Creating user: ${user.email}`);

      // First check if user exists in auth
      const { data: existingUser } = await supabaseAdmin.auth.signInWithPassword({
        email: user.email,
        password: user.password,
      });

      if (existingUser.user) {
        console.log(`User ${user.email} already exists in auth`);
        
        // Confirm email if not already confirmed
        if (!existingUser.user.email_confirmed_at) {
          const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
            existingUser.user.id,
            { email_confirm: true }
          );

          if (updateError) {
            console.error(`Error confirming email for ${user.email}:`, updateError.message);
          } else {
            console.log(`Confirmed email for ${user.email}`);
          }
        }
        
        continue;
      }

      // Create user in auth
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: { role: user.role }
      });

      if (error) {
        console.error(`Error creating user ${user.email} in auth:`, error.message);
        continue;
      }

      console.log(`Successfully created user in auth: ${user.email}`);

      // Check if user exists in users table
      const { data: existingProfile } = await supabaseAdmin
        .from('users')
        .select()
        .eq('email', user.email)
        .single();

      if (existingProfile) {
        console.log(`User ${user.email} already exists in users table`);
        continue;
      }

      // Create user profile in users table
      const { error: profileError } = await supabaseAdmin
        .from('users')
        .insert({
          id: data.user.id,
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

    console.log('\nTest Users:');
    console.log('Admin: admin@test.com / Admin123!');
    console.log('Worker: worker@test.com / Worker123!');
    console.log('Customer: customer@test.com / Customer123!');
  } catch (error) {
    console.error('Error in createTestUsers:', error);
  }
}

createTestUsers()
  .catch(console.error)
  .finally(() => process.exit());
