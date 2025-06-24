import { AuthProvider, User } from 'shared-types';
import { db } from '../config/db.config';
import { passwordHash, passwordVerify } from '../utils/password';
import { logger } from '../services/logger';

export async function createLocalAuth(userId: string, password: string): Promise<void> {
  const hash = await passwordHash(password);
  const query = 'INSERT INTO auth_providers (user_id, provider, password_hash) VALUES ($1, $2, $3)';
  const values = [userId, 'local', hash];
  try {
    await db.query(query, values);
  } catch (error) {
    logger.log('error', 'Error creating local auth:', error);
    throw new Error('Failed to create local auth');
  }
}

export async function findLocalAuthByEmail(email: string): Promise<AuthProvider | null> {
  const query =
    'SELECT u.*, ap.password_hash FROM users u JOIN auth_providers ap ON ap.user_id = u.id WHERE u.email = $1 AND ap.provider = $2 LIMIT 1';
  const values = [email, 'local'];

  try {
    const result = await db.query<AuthProvider>(query, values);
    return result.rows[0] || null;
  } catch (error) {
    logger.log('error', 'Error in findLocalAuthByEmail:', error);
    throw new Error('Failed to fetch  local auth by email');
  }
}

export async function verifyLocalPassword(raw: string, hash: string) {
  return passwordVerify(raw, hash);
}

export async function findOrCreateSocialUser({
  provider,
  providerUserId,
  email,
  name,
}: {
  provider: string;
  providerUserId: string;
  email?: string;
  name?: string;
}) {
  const query =
    'SELECT u.* FROM users u JOIN auth_providers ap ON ap.user_id = u.id WHERE ap.provider = $1 AND ap.provider_user_id = $2 LIMIT 1';
  const values = [provider, providerUserId];

  try {
    const existing = await db.query(query, values);
    if (existing.rows[0]) return existing.rows[0];
  } catch (error) {
    logger.log('error', 'Error in findOrCreateSocialUser:', error);
    throw new Error('Failed to find or create social user');
  }

  const createQuery = 'INSERT INTO users (email, name) VALUES ($1, $2) RETURNING *;';
  const createValues = [email ?? null, name ?? null];

  try {
    const result = await db.query<User>(createQuery, createValues);
    const newUser: User = result.rows[0];

    const insertProviderQuery = 'INSERT INTO auth_providers (user_id, provider, provider_user_id) VALUES ($1, $2, $3);';
    const insertProviderValues = [newUser.id, provider, providerUserId];
    await db.query(insertProviderQuery, insertProviderValues);

    return newUser;
  } catch (error) {
    logger.log('error', 'Error creating social user:', error);
    throw new Error('Failed to create social user');
  }
}
