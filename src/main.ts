import { NestFactory } from '@nestjs/core';
import { AppConfigService } from '@config/app/config.service';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AUTH_PACKAGE_NAME } from 'cryptomath-api-proto/types/auth';
import { AppModule } from './app.module';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const appConfigService = app.get(AppConfigService);

  const { protoFile, url } = appConfigService;

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: AUTH_PACKAGE_NAME,
      protoPath: join(
        process.cwd(),
        'node_modules/cryptomath-api-proto/proto/',
        protoFile,
      ),
      url,
    },
  });

  app.startAllMicroservices(() =>
    console.log(`Auth microservice is listening on ${url}`),
  );
}
bootstrap();
