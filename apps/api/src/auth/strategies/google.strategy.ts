import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import passport from 'passport';
import { findOrCreateSocialUser } from '../../models/auth-provider.model';
import { logger } from '../../services/logger';

// Check if Google OAuth credentials are configured
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (!googleClientId) {
  logger.log('warn', 'GOOGLE_CLIENT_ID is not set. Google OAuth will not be available.');
} else if (!googleClientSecret) {
  logger.log('warn', 'GOOGLE_CLIENT_SECRET is not set. Google OAuth will not be available.');
} else {
  passport.use(
    new GoogleStrategy(
      {
        clientID: googleClientId,
        clientSecret: googleClientSecret,
        callbackURL: '/api/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const user = await findOrCreateSocialUser({
            provider: 'google',
            providerUserId: profile.id,
            email: profile.emails?.[0]?.value,
            name: profile.displayName,
          });
          return done(null, user);
        } catch (err) {
          return done(err);
        }
      },
    ),
  );
}
