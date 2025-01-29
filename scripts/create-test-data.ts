import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env from frontend directory
dotenv.config({ path: path.resolve(__dirname, '../frontend/.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
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
  try {
    console.log('Creating test queues...');

    // Create queues
    const { data: queues, error: queuesError } = await supabase
      .from('queues')
      .insert([
        {
          name: 'General Support',
          description: 'General customer support inquiries'
        },
        {
          name: 'Technical Issues',
          description: 'Technical problems and bugs'
        },
        {
          name: 'Billing Support',
          description: 'Billing and payment related issues'
        }
      ])
      .select();

    if (queuesError) throw queuesError;
    console.log('Created queues:', queues);

    // Get user IDs
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, role');

    if (usersError) throw usersError;

    const charlie = users?.find(u => u.email === 'charlie@test.com');
    const diana = users?.find(u => u.email === 'diana@test.com');
    const alice = users?.find(u => u.email === 'alice@test.com');
    const bob = users?.find(u => u.email === 'bob@test.com');

    if (!charlie || !diana || !alice || !bob) {
      throw new Error('Required users not found');
    }

    console.log('Creating test tickets...');

    // Create tickets
    const { data: tickets, error: ticketsError } = await supabase
      .from('tickets')
      .insert([
        {
          title: 'Unable to access account',
          description: 'Getting 403 error when trying to log in',
          status: 'new',
          priority: 'high',
          created_by: charlie.id,
          assigned_to: alice.id
        },
        {
          title: 'Billing inquiry',
          description: 'Question about last month\'s invoice',
          status: 'in_progress',
          priority: 'medium',
          created_by: diana.id,
          assigned_to: bob.id
        },
        {
          title: 'Feature request: Dark mode',
          description: 'Would like dark mode option in dashboard',
          status: 'resolved',
          priority: 'low',
          created_by: charlie.id,
          assigned_to: alice.id
        }
      ])
      .select();

    if (ticketsError) throw ticketsError;
    console.log('Created tickets:', tickets);

    // Assign tickets to queues
    if (queues && tickets) {
      console.log('Creating queue assignments...');

      const generalQueue = queues.find(q => q.name === 'General Support');
      const techQueue = queues.find(q => q.name === 'Technical Issues');
      const billingQueue = queues.find(q => q.name === 'Billing Support');

      if (!generalQueue || !techQueue || !billingQueue) {
        throw new Error('Required queues not found');
      }

      const { error: assignError } = await supabase
        .from('queue_assignments')
        .insert([
          {
            queue_id: generalQueue.id,
            ticket_id: tickets[0].id,
            assigned_by: alice.id
          },
          {
            queue_id: techQueue.id,
            ticket_id: tickets[0].id,
            assigned_by: alice.id
          },
          {
            queue_id: billingQueue.id,
            ticket_id: tickets[1].id,
            assigned_by: bob.id
          }
        ]);

      if (assignError) throw assignError;
      console.log('Created queue assignments');
    }

    console.log('All test data created successfully!');

  } catch (error) {
    console.error('Error creating test data:', error);
  }
}

createTestData()
  .catch(console.error)
  .finally(() => process.exit());
