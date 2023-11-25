import { t } from 'elysia';

export const BadRequestDTO = t.Object({
  message: t.String({ default: 'Bad request' }),
  error_code: t.String({ default: 'badrequest' }),
});
