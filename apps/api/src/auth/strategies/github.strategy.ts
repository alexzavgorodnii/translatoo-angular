import { Strategy as GitHubStrategy } from 'passport-github2';
import passport from 'passport';
import { findOrCreateSocialUser } from '../../models/auth-provider.model';
import { logger } from '../../services/logger';

// Check if GitHub OAuth credentials are configured
const githubClientId = process.env.GITHUB_CLIENT_ID;
const githubClientSecret = process.env.GITHUB_CLIENT_SECRET;

if (!githubClientId) {
  logger.log('warn', 'GITHUB_CLIENT_ID is not set. GitHub OAuth will not be available.');
} else if (!githubClientSecret) {
  logger.log('warn', 'GITHUB_CLIENT_SECRET is not set. GitHub OAuth will not be available.');
} else {
  passport.use(
    new GitHubStrategy(
      {
        clientID: githubClientId,
        clientSecret: githubClientSecret,
        callbackURL: '/api/auth/github/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const user = await findOrCreateSocialUser({
            provider: 'github',
            providerUserId: profile.id,
            email: profile.emails?.[0]?.value,
            name: profile.displayName || profile.username,
          });
          return done(null, user);
        } catch (err) {
          return done(err);
        }
      },
    ),
  );
}
