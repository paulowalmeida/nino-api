import { Injectable, UnauthorizedException } from '@nestjs/common'

import * as bcrypt from 'bcrypt'

@Injectable()
export class PasswordService {
  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, 10)
  }

  async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash)
  }

  async validate(password: string, hash: string): Promise<void> {
    const isValid = await this.compare(password, hash)
    if (!isValid) throw new UnauthorizedException('Invalid credentials')
  }
}