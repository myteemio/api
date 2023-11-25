import { t } from 'elysia';

export const NotFoundDTO = t.Object({
  message: t.String({ default: 'The document with that ID was not found' }),
  error_code: t.String({ default: 'notfound' }),
});
