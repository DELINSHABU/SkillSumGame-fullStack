import { zValidator } from '@hono/zod-validator';
import type { ZodSchema } from 'zod';

// zValidator wrapper that returns our standard { error } shape (first issue,
// human-readable) instead of the raw ZodError blob.
export function validate<T extends ZodSchema>(target: 'json' | 'query', schema: T) {
  return zValidator(target, schema, (result, c) => {
    if (!result.success) {
      const issue = result.error.issues[0];
      const field = issue?.path.join('.') ?? '';
      const message = issue?.message ?? 'Invalid input';
      return c.json({ error: field ? `${field}: ${message}` : message }, 400);
    }
    return undefined;
  });
}
