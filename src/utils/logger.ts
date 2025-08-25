export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4
}

class Logger {
  private minLevel: LogLevel;

  constructor() {
    // Default to DEBUG level, will be overridden by Vite define
    this.minLevel = LogLevel.DEBUG;
  }

  setLogLevel(level: LogLevel): void {
    this.minLevel = level;
  }

  debug(message: string, ...args: any[]): void {
    if (this.minLevel <= LogLevel.DEBUG) {
      console.log(`[DEBUG] ${message}`, ...args);
    }
  }

  info(message: string, ...args: any[]): void {
    if (this.minLevel <= LogLevel.INFO) {
      console.info(`[INFO] ${message}`, ...args);
    }
  }

  warn(message: string, ...args: any[]): void {
    if (this.minLevel <= LogLevel.WARN) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  }

  error(message: string, ...args: any[]): void {
    if (this.minLevel <= LogLevel.ERROR) {
      console.warn(`[ERROR] ${message}`, ...args);
    }
  }

  // Method to check if a level is enabled
  isLevelEnabled(level: LogLevel): boolean {
    return this.minLevel <= level;
  }

  // Method to get current log level
  getCurrentLevel(): LogLevel {
    return this.minLevel;
  }
}

// Create singleton instance
export const logger = new Logger();

// This will be replaced by Vite at build time
if (typeof __LOG_LEVEL__ !== 'undefined') {
  logger.setLogLevel(__LOG_LEVEL__);
}
