import { LoggerType } from '../types/logger-types';

class Logger {
  private static instance: Logger;
  private readonly mode: string = 'local';
  private constructor() {
    this.mode = process.env.LOGGER || 'local';
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  public log(type: LoggerType, message: string, additionalInfo?: unknown): void {
    if (this.mode === 'local') {
      console.log(`[${type.toUpperCase()}] ${message}`, additionalInfo ?? '');
      return;
    }
    // In production, you might want to send logs to a remote server or a logging service
    // For now, we will just log to the console
  }
}

export const logger = Logger.getInstance();
