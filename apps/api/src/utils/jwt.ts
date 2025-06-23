import * as jose from 'jose';
import { saveRefreshTokenToDb, findRefreshToken, revoke } from '../models/refresh-token.model';

export async function generateToken(payload: Record<string, unknown>) {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);
  return await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('2h')
    .sign(secret);
}

export function verifyToken(token: string) {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);
  return jose.jwtVerify(token, secret, {
    algorithms: ['HS256'],
  });
}

export function generateRefreshToken(payload: Record<string, unknown>) {
  const secret = new TextEncoder().encode(process.env.REFRESH_SECRET);
  return new jose.SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(secret);
}

export function verifyRefreshToken(token: string) {
  const secret = new TextEncoder().encode(process.env.REFRESH_SECRET);
  return jose.jwtVerify(token, secret, {
    algorithms: ['HS256'],
  });
}

export async function saveRefreshToken(userId: string) {
  const payload = { userId };
  const refreshToken = await generateRefreshToken(payload);

  // Calculate expiration date (30 days from now)
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  // Save the refresh token to the database
  await saveRefreshTokenToDb(userId, refreshToken, expiresAt);

  return refreshToken;
}

export async function verifyRefreshTokenJwt(token: string) {
  try {
    // First verify the JWT signature and expiration
    const { payload } = await verifyRefreshToken(token);

    // Then check if the token exists in the database and is not revoked
    const dbToken = await findRefreshToken(token);
    if (!dbToken) {
      throw new Error('Refresh token not found or has been revoked');
    }

    return payload;
  } catch (error) {
    console.error('Error verifying refresh token:', error);
    throw new Error('Invalid or expired refresh token');
  }
}

export async function invalidateRefreshToken(token: string) {
  try {
    await revoke(token);
  } catch (error) {
    console.error('Error invalidating refresh token:', error);
    throw new Error('Failed to invalidate refresh token');
  }
}
