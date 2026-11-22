export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  correlationId?: string;
  module?: string;
  context?: Record<string, unknown>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

class StructuredLogger {
  private module: string;

  constructor(module: string = 'App') {
    this.module = module;
  }

  public forModule(name: string): StructuredLogger {
    return new StructuredLogger(name);
  }

  private formatEntry(level: LogLevel, message: string, context?: Record<string, unknown>, error?: Error, correlationId?: string): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      module: this.module,
      correlationId,
      context
    };

    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
      };
    }

    return entry;
  }

  private output(entry: LogEntry): void {
    const jsonStr = JSON.stringify(entry);
    if (entry.level === LogLevel.ERROR) {
      console.error(jsonStr);
    } else if (entry.level === LogLevel.WARN) {
      console.warn(jsonStr);
    } else {
      console.log(jsonStr);
    }
  }

  public info(message: string, context?: Record<string, unknown>, correlationId?: string): void {
    this.output(this.formatEntry(LogLevel.INFO, message, context, undefined, correlationId));
  }

  public warn(message: string, context?: Record<string, unknown>, correlationId?: string): void {
    this.output(this.formatEntry(LogLevel.WARN, message, context, undefined, correlationId));
  }

  public error(message: string, error?: Error | unknown, context?: Record<string, unknown>, correlationId?: string): void {
    const err = error instanceof Error ? error : error ? new Error(String(error)) : undefined;
    this.output(this.formatEntry(LogLevel.ERROR, message, context, err, correlationId));
  }

  public debug(message: string, context?: Record<string, unknown>, correlationId?: string): void {
    if (process.env.DEBUG || process.env.NODE_ENV === 'development') {
      this.output(this.formatEntry(LogLevel.DEBUG, message, context, undefined, correlationId));
    }
  }
}

export const logger = new StructuredLogger('QuizQuake');
