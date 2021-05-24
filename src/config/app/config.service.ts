import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  constructor(private configService: ConfigService) {}

  get protoFile(): string {
    return this.configService.get<string>('app.protoFile');
  }

  get url(): string {
    return this.configService.get<string>('app.url');
  }
}
