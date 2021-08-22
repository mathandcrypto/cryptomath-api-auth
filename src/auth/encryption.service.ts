import { v4 as uuidv4 } from 'uuid';
import { hash, genSalt } from 'bcrypt';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EncryptionService {
  async generateSecret(userId: number, extra = ''): Promise<string> {
    const uuid = uuidv4();
    const now = Date.now();
    const plain = userId.toString() + extra + uuid + now.toString();
    const salt = await genSalt();

    return hash(plain, salt);
  }
}
