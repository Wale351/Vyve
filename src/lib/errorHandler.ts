/**
 * Error handling utility to prevent information leakage
 * Maps internal errors to user-friendly messages without exposing system details
 */

export class AppError extends Error {
  constructor(
    message: string,
    public userMessage: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'AppError';
  }
}

interface SupabaseError {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
}

/**
 * Maps database/Supabase errors to safe user-facing messages
 * Logs full error details only in development
 */
export function mapDatabaseError(error: SupabaseError | Error | unknown): AppError {
  // Only log details in development
  if (import.meta.env.DEV) {
    console.error('[Database Error]', error);
  }

  const supabaseError = error as SupabaseError;
  const errorCode = supabaseError?.code;
  const errorMessage = supabaseError?.message?.toLowerCase() || '';

  // Rate limiting errors
  if (errorMessage.includes('rate') || errorCode === '42501') {
    return new AppError(
      supabaseError?.message || 'Rate limit exceeded',
      'You are performing this action too quickly. Please wait a moment.',
      429
    );
  }

  // Unique constraint violation
  if (errorCode === '23505') {
    return new AppError(
      supabaseError?.message || 'Unique violation',
      'This item already exists.',
      409
    );
  }

  // Foreign key violation
  if (errorCode === '23503') {
    return new AppError(
      supabaseError?.message || 'Foreign key violation',
      'Invalid reference. The requested item may have been deleted.',
      400
    );
  }

  // RLS / insufficient privilege
  if (errorCode === '42501' || errorMessage.includes('permission')) {
    return new AppError(
      supabaseError?.message || 'Permission denied',
      'You do not have permission to perform this action.',
      403
    );
  }

  // Check constraint violation
  if (errorCode === '23514') {
    return new AppError(
      supabaseError?.message || 'Check constraint',
      'The provided data is invalid. Please check your input.',
      400
    );
  }

  // Not null violation
  if (errorCode === '23502') {
    return new AppError(
      supabaseError?.message || 'Not null violation',
      'Required information is missing.',
      400
    );
  }

  // Message validation errors (from our triggers)
  if (errorMessage.includes('message cannot be empty') || errorMessage.includes('title cannot be empty')) {
    return new AppError(
      supabaseError?.message || 'Validation error',
      'The content cannot be empty.',
      400
    );
  }

  if (errorMessage.includes('cannot exceed')) {
    return new AppError(
      supabaseError?.message || 'Validation error',
      'The content is too long. Please shorten it.',
      400
    );
  }

  // Authentication errors
  if (errorMessage.includes('auth') || errorMessage.includes('unauthorized') || errorMessage.includes('jwt')) {
    return new AppError(
      supabaseError?.message || 'Auth error',
      'Authentication required. Please sign in.',
      401
    );
  }

  // Default generic error
  return new AppError(
    supabaseError?.message || 'Unknown error',
    'An unexpected error occurred. Please try again.',
    500
  );
}

/**
 * Returns a generic error message based on HTTP status code
 */
export function getGenericMessage(status: number): string {
  switch (status) {
    case 400:
      return 'Invalid request';
    case 401:
      return 'Authentication required';
    case 403:
      return 'Permission denied';
    case 404:
      return 'Resource not found';
    case 409:
      return 'Conflict with existing data';
    case 429:
      return 'Too many requests';
    default:
      return 'An error occurred';
  }
}
