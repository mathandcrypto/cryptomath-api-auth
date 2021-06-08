import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  protoFile: process.env.APP_PROTO_FILE,
  url: process.env.APP_URL,
}));