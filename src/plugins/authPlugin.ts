import jwt from '@elysiajs/jwt';
import Elysia from 'elysia';
import { User } from '../models/User';

export const isAuthenticated = <const type>({ type = 'UserOnly' }: { type: 'UserOnly' | 'AdminOnly' | 'All' }) => {
  return new Elysia({ name: 'derived:isAuthenticated:user' })
    .use(
      jwt({
        name: 'jwt',
        secret: process.env.JWT_SECRET!,
        exp: '30d',
      })
    )
    .derive(async ({ set, request, jwt }) => {
      if (!request.headers.has('Authorization')) {
        return { authorized: false, reason: 'No Authorization header.' };
      }

      const header = request.headers.get('Authorization');

      if (header && !header.includes('Bearer')) {
        return { authorized: false, reason: 'No Bearer token' };
      }

      const splittedHeader = header ? header?.split('Bearer') : [];

      if (splittedHeader.length !== 2) {
        return { authorized: false, reason: 'No Bearer token' };
      }

      const token = splittedHeader[1].trim();

      if (!token || (token && token.length <= 5)) {
        return { authorized: false, reason: 'No Bearer token' };
      }

      try {
        const decoded = (await jwt.verify(token)) as false | (User & { exp: number });
        if (!decoded || !decoded.name || typeof decoded.exp !== 'number') {
          return { authorized: false, reason: `Invalid token.` };
        }

        const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
        if (decoded.exp < currentTime) {
          return { authorized: false, reason: `Token has expired.` };
        }

        if (type === 'UserOnly' && decoded.type !== 'user') {
          return { authorized: false, reason: `This is only for users.` };
        }

        if (type === 'AdminOnly' && decoded.type !== 'admin') {
          return { authorized: false, reason: `This is only for admins.` };
        }

        if (type === 'All') {
          // Do nothing. Everyone is allowed.
        }

        const { exp, ...userWithExp } = decoded;

        return { authorized: true, user: userWithExp };
      } catch (error) {
        return { authorized: false, reason: `Invalid token. ${error}` };
      }
    })
    .onBeforeHandle(({ authorized, user, reason, set }) => {
      if (!authorized) {
        set.status = 'Unauthorized';
        return `Unauthorized! Reason: ${reason}`;
      }
    });
};
