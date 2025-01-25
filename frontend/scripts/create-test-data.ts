import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load env from frontend directory
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const TEST_TICKETS = [
  {
    title: 'Urgent Issue - System Down',
    description: 'The entire system is not responding to user requests.',
    priority: 'high',
    status: 'open'
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
    priority: 'high',
    status: 'in_progress'
  },
  {
    title: 'UI Enhancement',
    description: 'Request for improved navigation menu.',
    priority: 'medium',
    status: 'new'
  },
  {
    title: 'Website Down',
    description: 'Our company website is not loading',
    priority: 'high',
    status: 'open'
  },
  {
    title: 'Email Not Working',
    description: 'Cannot send or receive emails',
    priority: 'medium',
    status: 'in_progress'
  },
  {
    title: 'Printer Issues',
    description: 'Office printer not connecting to network',
    priority: 'low',
    status: 'open'
  }
];

const TEST_QUEUES = [
  {
    name: 'Technical Support',
    description: 'For technical issues and bugs'
  },
  {
    name: 'Customer Service',
    description: 'For general customer inquiries'
  },
  {
    name: 'Billing',
    description: 'For billing and payment issues'
  }
];

async function createTestData() {
  try {
    console.log('Signing in as customer...');
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: 'customer@test.com',
      password: 'Customer123!'
    });

    if (signInError) {
      console.error('Error signing in:', signInError.message);
      return;
    }

    console.log('Creating test tickets...');
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('No user found after sign in');
      return;
    }
    const customerId = user.id;

    for (const ticket of TEST_TICKETS) {
      const { error: ticketError } = await supabase
        .from('tickets')
        .insert({
          ...ticket,
          created_by: customerId
        });

      if (ticketError) {
        console.error(`Error creating ticket ${ticket.title}:`, ticketError.message);
      } else {
        console.log(`Created ticket: ${ticket.title}`);
      }
    }

    // Sign in as admin to create queues
    console.log('Signing in as admin to create queues...');
    const { error: adminSignInError } = await supabase.auth.signInWithPassword({
      email: 'admin@test.com',
      password: 'Admin123!'
    });

    if (adminSignInError) {
      console.error('Error signing in as admin:', adminSignInError.message);
      return;
    }

    console.log('Creating test queues...');
    for (const queue of TEST_QUEUES) {
      const { error: queueError } = await supabase
        .rpc('create_queue', { name: queue.name, description: queue.description });

      if (queueError) {
        console.error(`Error creating queue ${queue.name}:`, queueError.message);
      } else {
        console.log(`Created queue: ${queue.name}`);
      }
    }

    console.log('Test data creation completed!');
  } catch (error) {
    console.error('Error in createTestData:', error);
  }
}

createTestData()
  .catch(console.error)
  .finally(() => process.exit());
