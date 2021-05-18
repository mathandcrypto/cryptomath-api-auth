import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
  accessSessionMaxAge: process.env.ACCESS_SESSION_MAX_AGE,
  refreshSessionMaxAge: process.env.REFRESH_SESSION_MAX_AGE,
  maxRefreshSessions: process.env.MAX_REFRESH_SESSIONS,
}));
