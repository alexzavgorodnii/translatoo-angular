import { createLocalAuth } from '../models/auth-provider.model';
import { createUser } from '../models/user.model';
import { generateToken, saveRefreshToken, verifyRefreshTokenJwt, invalidateRefreshToken } from '../utils/jwt';
import {
  createLoginHistory,
  CreateLoginHistoryData,
  getUserLoginHistory,
  getRecentFailedAttempts,
} from '../models/login-history.model';

export async function registerLocalUser(data: { email: string; password: string; name: string }) {
  const user = await createUser({ email: data.email, name: data.name });
  await createLocalAuth(user.id, data.password);
  return user;
}

export async function issueTokens(userId: string) {
  const accessToken = await generateToken({ id: userId });
  const refreshToken = await saveRefreshToken(userId);
  return { accessToken, refreshToken };
}

export async function verifyAndRefresh(token: string) {
  const payload = await verifyRefreshTokenJwt(token);
  const newAccessToken = await generateToken({ id: payload.userId });
  return newAccessToken;
}

export async function revokeRefreshToken(token: string) {
  await invalidateRefreshToken(token);
}

export async function logLoginAttempt(data: CreateLoginHistoryData) {
  try {
    return await createLoginHistory(data);
  } catch (error) {
    console.error('Failed to log login attempt:', error);
    // Don't throw error to prevent login process from failing due to logging issues
  }
}

export async function checkRateLimit(ipAddress: string, maxAttempts = 5, timeWindowMinutes = 15): Promise<boolean> {
  try {
    const failedAttempts = await getRecentFailedAttempts(ipAddress, timeWindowMinutes);
    return failedAttempts < maxAttempts;
  } catch (error) {
    console.error('Failed to check rate limit:', error);
    return true; // Allow login if rate limit check fails
  }
}

export async function getLoginHistoryForUser(userId: string, limit = 10) {
  return await getUserLoginHistory(userId, limit);
}
