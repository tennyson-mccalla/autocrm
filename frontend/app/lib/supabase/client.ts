'use client';

import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';
import { logger } from '../logger';

let supabaseClient: ReturnType<typeof createClient<Database>> | null = null;
let initializationPromise: Promise<ReturnType<typeof createClient<Database>>> | null = null;

const MAX_RETRIES = 3;
const MAX_RETRY_DELAY = 1000; // 1 second

async function initializeClient(retryCount = 0): Promise<ReturnType<typeof createClient<Database>>> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    logger.debug('Checking environment variables', { context: 'Supabase' });
    if (!supabaseUrl || !supabaseAnonKey) {
      logger.error('Missing environment variables', {
        context: 'Supabase',
        data: { url: !!supabaseUrl, key: !!supabaseAnonKey }
      });
      throw new Error('Missing Supabase environment variables');
    }

    logger.info('Creating client instance', { context: 'Supabase' });
    const client = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });

    logger.debug('Testing connection', { context: 'Supabase' });
    const { data, error } = await client.auth.getSession();
    if (error) {
      logger.error('Session test failed', { context: 'Supabase', error });
      throw error;
    }
    logger.info('Session test successful', { context: 'Supabase', data: { hasSession: !!data.session } });

    logger.info('Client initialized successfully', { context: 'Supabase' });
    return client;
  } catch (error) {
    logger.error('Client initialization error', { context: 'Supabase', error });

    if (retryCount < MAX_RETRIES) {
      const delay = Math.min(MAX_RETRY_DELAY * Math.pow(2, retryCount), MAX_RETRY_DELAY);
      logger.warn(`Retrying initialization (attempt ${retryCount + 1}/${MAX_RETRIES})`, { context: 'Supabase' });
      await new Promise(resolve => setTimeout(resolve, delay));
      return initializeClient(retryCount + 1);
    }

    throw error;
  }
}

export function getSupabaseClient(): ReturnType<typeof createClient<Database>> {
  if (!supabaseClient) {
    logger.error('Client accessed before initialization', { context: 'Supabase' });
    throw new Error('Supabase client not initialized. Call initializeSupabaseClient first.');
  }
  return supabaseClient;
}

export async function initializeSupabaseClient(): Promise<ReturnType<typeof createClient<Database>>> {
  logger.debug('Checking initialization status', {
    context: 'Supabase',
    data: { hasClient: !!supabaseClient, hasPromise: !!initializationPromise }
  });

  // If client is already initialized, return it
  if (supabaseClient) {
    logger.debug('Using existing client', { context: 'Supabase' });
    return supabaseClient;
  }

  // If initialization is in progress, return the existing promise
  if (initializationPromise) {
    logger.debug('Waiting for existing initialization', { context: 'Supabase' });
    return initializationPromise;
  }

  logger.debug('Starting new initialization', { context: 'Supabase' });
  initializationPromise = initializeClient()
    .then(client => {
      logger.info('Setting client instance', { context: 'Supabase' });
      supabaseClient = client;
      return client;
    })
    .catch(error => {
      logger.error('Initialization failed, clearing promise', { context: 'Supabase', error });
      initializationPromise = null;
      throw error;
    });

  return initializationPromise;
}

export function clearSupabaseClient(): void {
  logger.debug('Clearing client instance', { context: 'Supabase' });
  supabaseClient = null;
  initializationPromise = null;
}

export async function getSupabaseSession() {
  const supabase = getSupabaseClient();
  return supabase.auth.getSession();
}

export async function getSupabaseUser() {
  const supabase = getSupabaseClient();
  return supabase.auth.getUser();
}
