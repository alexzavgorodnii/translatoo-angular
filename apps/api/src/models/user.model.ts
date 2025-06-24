import { User } from 'shared-types';
import { db } from '../config/db.config';
import { logger } from '../services/logger';

export async function findUserById(id: string): Promise<User | null> {
  const query = 'SELECT * FROM users WHERE id = $1';
  const values = [id];

  try {
    const result = await db.query<User>(query, values);
    return result.rows[0] ?? null;
  } catch (error) {
    logger.log('error', 'Error in UserModel.findById:', error);
    throw new Error('Failed to fetch user by ID');
  }
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const query = 'SELECT * FROM users WHERE email = $1';
  const values = [email];

  try {
    const result = await db.query<User>(query, values);
    return result.rows[0] ?? null;
  } catch (error) {
    logger.log('error', 'Error in UserModel.findUserByEmail:', error);
    throw new Error('Failed to fetch user by Email');
  }
}

export async function createUser(data: { email: string; name: string; avatar_url?: string }): Promise<User> {
  const query = `
    INSERT INTO users (email, name)
    VALUES ($1, $2)
    RETURNING *;
  `;
  const values = [data.email, data.name];
  try {
    const result = await db.query<User>(query, values);
    return result.rows[0];
  } catch (error) {
    logger.log('error', 'Error in UserModel.createUser:', error);
    throw new Error('Failed to create user');
  }
}
