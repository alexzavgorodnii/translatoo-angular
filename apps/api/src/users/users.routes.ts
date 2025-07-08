import { Router } from 'express';
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated';
import { getProfile } from './users.controller';

export const usersRouter = Router();

usersRouter.get('/profile', ensureAuthenticated, getProfile);
usersRouter.patch('/profile', ensureAuthenticated, (req, res) => {
  res.status(501).json({ error: 'Not implemented' });
});
