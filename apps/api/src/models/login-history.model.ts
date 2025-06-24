import { LoginHistory } from 'shared-types';
import { db } from '../config/db.config';
import { logger } from '../services/logger';

export interface CreateLoginHistoryData {
  userId?: string;
  provider: 'local' | 'google' | 'github';
  ipAddress: string;
  userAgent: string;
  successful: boolean;
}

export async function createLoginHistory(data: CreateLoginHistoryData): Promise<LoginHistory> {
  const query = `
    INSERT INTO login_history (user_id, provider, ip_address, user_agent, successful)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `;
  const values = [data.userId || null, data.provider, data.ipAddress, data.userAgent, data.successful];

  try {
    const result = await db.query<LoginHistory>(query, values);
    return result.rows[0];
  } catch (error) {
    logger.log('error', 'Error in LoginHistoryModel.createLoginHistory:', error);
    throw new Error('Failed to create login history record');
  }
}

export async function getUserLoginHistory(userId: string, limit = 10): Promise<LoginHistory[]> {
  const query = `
    SELECT * FROM login_history
    WHERE user_id = $1
    ORDER BY timestamp DESC
    LIMIT $2;
  `;
  const values = [userId, limit];

  try {
    const result = await db.query<LoginHistory>(query, values);
    return result.rows;
  } catch (error) {
    logger.log('error', 'Error in LoginHistoryModel.getUserLoginHistory:', error);
    throw new Error('Failed to fetch user login history');
  }
}

export async function getRecentFailedAttempts(ipAddress: string, timeWindowMinutes = 15): Promise<number> {
  const query = `
    SELECT COUNT(*) as count
    FROM login_history
    WHERE ip_address = $1
    AND successful = false
    AND timestamp > NOW() - INTERVAL '${timeWindowMinutes} minutes';
  `;
  const values = [ipAddress];

  try {
    const result = await db.query<{ count: string }>(query, values);
    return parseInt(result.rows[0].count, 10);
  } catch (error) {
    logger.log('error', 'Error in LoginHistoryModel.getRecentFailedAttempts:', error);
    throw new Error('Failed to fetch recent failed attempts');
  }
}

export async function getLoginHistoryByProvider(
  provider: 'local' | 'google' | 'github',
  limit = 50,
): Promise<LoginHistory[]> {
  const query = `
    SELECT * FROM login_history
    WHERE provider = $1
    ORDER BY timestamp DESC
    LIMIT $2;
  `;
  const values = [provider, limit];

  try {
    const result = await db.query<LoginHistory>(query, values);
    return result.rows;
  } catch (error) {
    logger.log('error', 'Error in LoginHistoryModel.getLoginHistoryByProvider:', error);
    throw new Error('Failed to fetch login history by provider');
  }
}
