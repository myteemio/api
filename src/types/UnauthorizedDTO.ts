import { t } from 'elysia';

export const UnauthorizedDTO = t.Object({
  message: t.String({ default: 'Unauthorized' }),
  error_code: t.String({ default: 'unauthorized' }),
});
