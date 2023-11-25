import { t } from 'elysia';

export const InternalServerErrorDTO = t.Object({
  message: t.String({ default: 'There was an internal server error' }),
  error_code: t.String({ default: 'internalservererror' }),
});
