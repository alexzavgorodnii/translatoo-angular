import { Strategy as LocalStrategy } from 'passport-local';
import passport from 'passport';
import { findLocalAuthByEmail, verifyLocalPassword } from '../../models/auth-provider.model';

passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passReqToCallback: true,
    },
    async (req, email, password, done) => {
      try {
        const user = await findLocalAuthByEmail(email);
        if (!user) {
          req.loginAttempt = { email, success: false, reason: 'User not found' };
          return done(null, false, { message: 'User not found' });
        }

        const isValid = await verifyLocalPassword(password, user.password_hash);
        if (!isValid) {
          req.loginAttempt = { email, userId: user.id, success: false, reason: 'Invalid password' };
          return done(null, false, { message: 'Invalid password' });
        }

        req.loginAttempt = { email, userId: user.id, success: true };
        return done(null, user);
      } catch (err) {
        req.loginAttempt = { email, success: false, reason: 'System error' };
        return done(err);
      }
    },
  ),
);
