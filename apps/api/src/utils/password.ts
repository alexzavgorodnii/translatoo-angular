import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import { logger } from '../services/logger';

const KEYLEN = 64;
const SEPARATOR = '.';
const scryptAsync = promisify(scrypt);
const randomBytesAsync = promisify(randomBytes);

export async function passwordHash(password: string): Promise<string> {
  const salt = (await randomBytesAsync(16)) as Buffer;
  const derivedKey = (await scryptAsync(password, salt, KEYLEN)) as Buffer;
  return `${salt.toString('hex')}${SEPARATOR}${derivedKey.toString('hex')}`;
}

export async function passwordVerify(password: string, hashed: string): Promise<boolean> {
  try {
    const [saltHex, keyHex] = hashed.split(SEPARATOR);

    if (!saltHex || !keyHex) {
      logger.log('error', 'Invalid hashed password format');
      return false;
    }

    const salt = Buffer.from(saltHex, 'hex');
    const key = Buffer.from(keyHex, 'hex');
    const derivedKey = (await scryptAsync(password, salt, KEYLEN)) as Buffer;

    return timingSafeEqual(key, derivedKey);
  } catch (error) {
    logger.log('error', 'Error verifying password:', error);
    return false;
  }
}
