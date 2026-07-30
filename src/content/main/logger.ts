import { appInfo } from '../../utils/links';

const PREFIX = appInfo.logPrefix;

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export function log(level: LogLevel, message: string, data?: any) {
  const extra = data ?? '';
  switch (level) {
    case 'debug':
      console.debug(PREFIX, message, extra);
      break;
    case 'info':
      console.info(PREFIX, message, extra);
      break;
    case 'warn':
      console.warn(PREFIX, message, extra);
      break;
    case 'error':
      console.error(PREFIX, message, extra);
      break;
  }
}
