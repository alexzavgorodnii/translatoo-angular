import { Strategy as LocalStrategy } from 'passport-local';
import passport from 'passport';
import { findLocalAuthByEmail, verifyLocalPassword } from '../../models/auth-provider.model';

passport.use(
  new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
    try {
      const user = await findLocalAuthByEmail(email);
      if (!user) return done(null, false, { message: 'User not found' });

      const isValid = await verifyLocalPassword(password, user.password_hash);
      if (!isValid) return done(null, false, { message: 'Invalid password' });

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }),
);
