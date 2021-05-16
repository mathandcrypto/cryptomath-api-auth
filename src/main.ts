import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AUTH_PACKAGE_NAME } from 'cryptomath-api-proto/proto/build/auth';
import { AppModule } from './app.module';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.GRPC,
      options: {
        package: AUTH_PACKAGE_NAME,
        protoPath: join(
          process.cwd(),
          'node_modules/cryptomath-api-proto/proto/auth.proto',
        ),
        url: 'localhost:5002',
      },
    },
  );
  app.listen(() => console.log('Auth microservice is listening'));
}
bootstrap();
