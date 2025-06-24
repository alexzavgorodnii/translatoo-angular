declare global {
  namespace Express {
    interface Request {
      loginAttempt?: {
        email: string;
        userId?: string;
        success: boolean;
        reason?: string;
      };
    }
  }
}

export {};
