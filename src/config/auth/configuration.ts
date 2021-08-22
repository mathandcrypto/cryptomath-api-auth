import { registerAs } from '@nestjs/config';
import { AuthConfig } from './interfaces/auth-config.interface';

export default registerAs<AuthConfig>('auth', () => ({
  accessSessionMaxAge: Number(process.env.ACCESS_SESSION_MAX_AGE),
  refreshSessionMaxAge: Number(process.env.REFRESH_SESSION_MAX_AGE),
  maxRefreshSessions: Number(process.env.MAX_REFRESH_SESSIONS),
}));
