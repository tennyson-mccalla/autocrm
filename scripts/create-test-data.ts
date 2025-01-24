import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env from frontend directory
dotenv.config({ path: path.resolve(__dirname, '../frontend/.env.local') });

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

const TEST_TICKETS = [
  {
    title: 'Urgent Issue - System Down',
    description: 'The entire system is not responding to user requests.',
    priority: 'urgent',
    status: 'new'
  },
  {
    title: 'High Priority Bug',
    description: 'Users cannot save their work in the editor.',
    priority: 'high',
    status: 'open'
  },
  {
    title: 'Feature Request',
    description: 'Would like to have dark mode support.',
    priority: 'medium',
    status: 'new'
  },
  {
    title: 'Documentation Update',
    description: 'Found a typo in the API documentation.',
    priority: 'low',
    status: 'open'
  },
  {
    title: 'Performance Issue',
    description: 'The application is running slowly during peak hours.',
    priority: 'high',
    status: 'in_progress'
  },
  {
    title: 'Mobile Responsiveness',
    description: 'Website does not display correctly on mobile devices.',
    priority: 'medium',
    status: 'open'
  },
  {
    title: 'Login Issues',
    description: 'Some users are unable to log in using their credentials.',
    priority: 'high',
    status: 'new'
  },
  {
    title: 'Data Export Feature',
    description: 'Need ability to export data to CSV format.',
    priority: 'low',
    status: 'open'
  },
  {
    title: 'Security Concern',
    description: 'Potential security vulnerability in authentication.',
    priority: 'urgent',
    status: 'in_progress'
  },
  {
    title: 'UI Enhancement',
    description: 'Request for improved navigation menu.',
    priority: 'medium',
    status: 'new'
  }
];

async function createTestData() {
  // Check for existing users first
  console.log('Checking for existing users...');
  const { data: existingUsers, error: usersError } = await supabase
    .from('users')
    .select('email')
    .in('email', TEST_USERS.map(u => u.email));

  if (usersError) {
    console.error('Error checking existing users:', usersError.message);
    return;
  }

  const existingEmails = new Set(existingUsers?.map(u => u.email));
  console.log('Found existing users:', Array.from(existingEmails).join(', ') || 'none');

  // Create only non-existing users
  for (const user of TEST_USERS) {
    if (existingEmails.has(user.email)) {
      console.log(`Skipping existing user: ${user.email}`);
      continue;
    }

    console.log(`Creating new user: ${user.email}`);
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

  // Sign in as customer to create tickets
  const { data: signIn, error: signInError } = await supabase.auth.signInWithPassword({
    email: 'customer@test.com',
    password: 'Customer123!'
  });

  if (signInError) {
    console.error('Error signing in as customer:', signInError.message);
    return;
  }

  // Check for existing tickets with same titles
  console.log('\nChecking for existing tickets...');
  const { data: existingTickets, error: ticketsError } = await supabase
    .from('tickets')
    .select('title')
    .in('title', TEST_TICKETS.map(t => t.title));

  if (ticketsError) {
    console.error('Error checking existing tickets:', ticketsError.message);
    return;
  }

  const existingTitles = new Set(existingTickets?.map(t => t.title));
  console.log('Found existing tickets:', Array.from(existingTitles).join(', ') || 'none');

  // Create only non-existing tickets
  console.log('\nCreating test tickets...');
  for (const ticket of TEST_TICKETS) {
    if (existingTitles.has(ticket.title)) {
      console.log(`Skipping existing ticket: ${ticket.title}`);
      continue;
    }

    const { error } = await supabase
      .from('tickets')
      .insert([{
        ...ticket,
        created_by: signIn.user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }]);

    if (error) {
      console.error(`Error creating ticket "${ticket.title}":`, error.message);
    } else {
      console.log(`Created ticket: ${ticket.title}`);
    }
  }

  console.log('\nTest data creation completed!');
  console.log('\nTest Users:');
  console.log('Customer: customer@test.com / Customer123!');
  console.log('Worker: worker@test.com / Worker123!');
  console.log('Admin: admin@test.com / Admin123!');
}

createTestData()
  .catch(console.error)
  .finally(() => process.exit());
