import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
  authSessionMaxAge: process.env.AUTH_SESSION_MAX_AGE,
  refreshSessionMaxAge: process.env.REFRESH_SESSION_MAX_AGE,
}));
