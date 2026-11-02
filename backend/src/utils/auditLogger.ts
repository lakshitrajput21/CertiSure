import fs from 'fs';
import path from 'path';

const logDir = path.resolve('storage/logs');
const emergencyLogFile = path.join(logDir, 'emergency-verification-audit.log');

// Ensure log directory exists
try {
  fs.mkdirSync(logDir, { recursive: true });
} catch {
  // Ignore if already exists
}

export const emergencyAuditLogger = {
  warn(message: string, context?: Record<string, unknown>): void {
    const entry = {
      level: 'WARN',
      timestamp: new Date().toISOString(),
      message,
      ...context,
    };
    const line = JSON.stringify(entry) + '\n';
    try {
      fs.appendFileSync(emergencyLogFile, line, 'utf8');
    } catch (fsErr) {
      console.error('[EmergencyAuditLogger] Failed to write fallback log to disk:', fsErr);
    }
  },

  error(message: string, context?: Record<string, unknown>): void {
    const entry = {
      level: 'ERROR',
      timestamp: new Date().toISOString(),
      message,
      ...context,
    };
    const line = JSON.stringify(entry) + '\n';
    try {
      fs.appendFileSync(emergencyLogFile, line, 'utf8');
    } catch (fsErr) {
      console.error('[EmergencyAuditLogger] Failed to write fallback log to disk:', fsErr);
    }
  },
};
