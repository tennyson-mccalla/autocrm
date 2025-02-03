'use client';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogOptions {
  level?: LogLevel;
  context?: string;
  error?: Error | unknown;
  data?: unknown;
}

const LOG_LEVEL_ICONS = {
  debug: '🔍',
  info: '🟢',
  warn: '🟡',
  error: '🔴'
} as const;

const LOG_LEVEL_PRIORITY = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
} as const;

// Default to 'info' in production, 'debug' in development
const DEFAULT_MIN_LEVEL = process.env.NODE_ENV === 'production' ? 'info' : 'debug';

// Allow override via environment variable
const MIN_LOG_LEVEL = (process.env.NEXT_PUBLIC_LOG_LEVEL || DEFAULT_MIN_LEVEL) as LogLevel;

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[MIN_LOG_LEVEL];
}

function formatMessage(message: string, options: LogOptions): string {
  const parts = [
    LOG_LEVEL_ICONS[options.level || 'info'],
    options.context ? `[${options.context}]` : null,
    message
  ].filter(Boolean);

  return parts.join(' ');
}

export const logger = {
  debug: (message: string, options: Omit<LogOptions, 'level'> = {}) => {
    if (!shouldLog('debug')) return;
    console.debug(formatMessage(message, { ...options, level: 'debug' }), options.data || '');
  },

  info: (message: string, options: Omit<LogOptions, 'level'> = {}) => {
    if (!shouldLog('info')) return;
    console.log(formatMessage(message, { ...options, level: 'info' }), options.data || '');
  },

  warn: (message: string, options: Omit<LogOptions, 'level'> = {}) => {
    if (!shouldLog('warn')) return;
    console.warn(formatMessage(message, { ...options, level: 'warn' }), options.data || '');
  },

  error: (message: string, options: Omit<LogOptions, 'level'> = {}) => {
    if (!shouldLog('error')) return;
    console.error(
      formatMessage(message, { ...options, level: 'error' }),
      options.error || options.data || ''
    );
  }
};
