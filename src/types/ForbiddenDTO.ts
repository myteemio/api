import { t } from 'elysia';

export const ForbiddenDTO = t.Object({
  message: t.String({ default: 'The server refused to authorize the request' }),
  error_code: t.String({ default: 'forbidden' }),
});
