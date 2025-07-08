import { findUserById } from '../models/user.model';
import { User } from 'shared-types';
import { logger } from '../services/logger';

export const getUserById = async (userId: string): Promise<User> => {
  try {
    const user = await findUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  } catch (error) {
    logger.log('error', 'Error fetching user by ID:', error);
    throw new Error('Failed to fetch user');
  }
};
