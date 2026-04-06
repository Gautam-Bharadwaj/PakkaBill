const isDev = __DEV__;

export const logger = {
  info: (...args) => isDev && console.log('[INFO]', ...args),
  warn: (...args) => isDev && console.warn('[WARN]', ...args),
  error: (...args) => isDev && console.error('[ERROR]', ...args),
  debug: (...args) => isDev && console.log('[DEBUG]', ...args),
};

export default logger;
