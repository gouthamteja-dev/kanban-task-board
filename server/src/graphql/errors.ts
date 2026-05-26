import { GraphQLError } from 'graphql';

export function badUserInput(message: string, details?: Record<string, unknown>): never {
  throw new GraphQLError(message, {
    extensions: { code: 'BAD_USER_INPUT', ...details },
  });
}

export function notFound(message: string): never {
  throw new GraphQLError(message, {
    extensions: { code: 'NOT_FOUND' },
  });
}

export function forbidden(message: string): never {
  throw new GraphQLError(message, {
    extensions: { code: 'FORBIDDEN' },
  });
}

export function assertNonEmpty(value: string, field: string, max = 100) {
  const trimmed = value.trim();
  if (!trimmed) badUserInput(`${field} is required`, { field });
  if (trimmed.length > max) badUserInput(`${field} must be ${max} characters or fewer`, { field, max });
  return trimmed;
}
