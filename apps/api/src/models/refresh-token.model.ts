import { db } from '../config/db.config';
import { RefreshToken } from 'shared-types';
import * as crypto from 'crypto';
import { logger } from '../services/logger';

export async function saveRefreshTokenToDb(
  userId: string,
  refreshToken: string,
  expiresAt: Date,
): Promise<RefreshToken> {
  // Hash the token before storing it
  const hashedToken = crypto.createHash('sha256').update(refreshToken).digest('hex');

  const query = `
    INSERT INTO refresh_tokens (user_id, token, expires_at)
    VALUES ($1, $2, $3)
    RETURNING id, user_id, token, expires_at::text, revoked, created_at::text;
  `;
  const values = [userId, hashedToken, expiresAt];

  try {
    const result = await db.query<RefreshToken>(query, values);
    return result.rows[0];
  } catch (error) {
    logger.log('error', 'Error saving refresh token:', error);
    throw new Error('Failed to save refresh token');
  }
}

export async function findRefreshToken(refreshToken: string): Promise<RefreshToken | null> {
  // Hash the token to compare with stored hash
  const hashedToken = crypto.createHash('sha256').update(refreshToken).digest('hex');

  const query = `
    SELECT id, user_id, token, expires_at::text, revoked, created_at::text
    FROM refresh_tokens
    WHERE token = $1 AND revoked = FALSE AND expires_at > NOW()
  `;
  const values = [hashedToken];

  try {
    const result = await db.query<RefreshToken>(query, values);
    return result.rows[0] ?? null;
  } catch (error) {
    logger.log('error', 'Error finding refresh token:', error);
    throw new Error('Failed to find refresh token');
  }
}

export async function revoke(refreshToken: string): Promise<void> {
  // Hash the token to find the stored version
  const hashedToken = crypto.createHash('sha256').update(refreshToken).digest('hex');

  const query = `
    UPDATE refresh_tokens
    SET revoked = TRUE
    WHERE token = $1
  `;
  const values = [hashedToken];

  try {
    await db.query(query, values);
  } catch (error) {
    logger.log('error', 'Error revoking refresh token:', error);
    throw new Error('Failed to revoke refresh token');
  }
}

export async function revokeAllUserRefreshTokens(userId: string): Promise<void> {
  const query = `
    UPDATE refresh_tokens
    SET revoked = TRUE
    WHERE user_id = $1 AND revoked = FALSE
  `;
  const values = [userId];

  try {
    await db.query(query, values);
  } catch (error) {
    logger.log('error', 'Error revoking user refresh tokens:', error);
    throw new Error('Failed to revoke user refresh tokens');
  }
}

export async function cleanupExpiredTokens(): Promise<void> {
  const query = `
    DELETE FROM refresh_tokens
    WHERE expires_at < NOW() OR revoked = TRUE
  `;

  try {
    await db.query(query);
  } catch (error) {
    logger.log('error', 'Error cleaning up expired tokens:', error);
    throw new Error('Failed to cleanup expired tokens');
  }
}
