import { createLocalAuth } from '../models/auth-provider.model';
import { createUser } from '../models/user.model';
import { generateToken, saveRefreshToken, verifyRefreshTokenJwt, invalidateRefreshToken } from '../utils/jwt';

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
