import { Injectable, UnauthorizedException } from '@nestjs/common'

import * as bcrypt from 'bcrypt'

/**
 * bcrypt wrapper for password hashing and verification. Salt rounds fixed at 10.
 * Use `validate` in auth flows — it throws `UnauthorizedException` on mismatch
 * so the caller doesn't need to check the return value.
 * Use `compare` only when you need the boolean without throwing.
 */
@Injectable()
export class PasswordService {
  /**
   * Hashes a plain-text password with bcrypt (10 salt rounds).
   * @param password - Plain-text password to hash.
   * @returns The bcrypt hash string to persist.
   */
  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, 10)
  }

  /**
   * Compares a plain-text password against a bcrypt hash.
   * @param password - Plain-text candidate password.
   * @param hash     - Stored bcrypt hash.
   * @returns `true` if they match, `false` otherwise.
   */
  async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash)
  }

  /**
   * Validates a password and throws if it does not match.
   * Prefer this over `compare` in auth flows to avoid silent failures.
   * @param password - Plain-text candidate password.
   * @param hash     - Stored bcrypt hash.
   * @returns `void` on success.
   */
  async validate(password: string, hash: string): Promise<void> {
    const isValid = await this.compare(password, hash)
    if (!isValid) throw new UnauthorizedException('Invalid credentials')
  }
}
