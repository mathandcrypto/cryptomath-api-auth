import { registerAs } from '@nestjs/config';
import { AppConfig } from './interfaces/app-config.interface';

export default registerAs<AppConfig>('app', () => ({
  protoFile: process.env.APP_PROTO_FILE,
  url: process.env.APP_URL,
}));
