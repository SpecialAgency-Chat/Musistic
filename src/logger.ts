import log4js from 'log4js';

export default function configLogger(): void {
  log4js.configure({
    appenders: {
      console: {
        type: 'console',
      },
      app: {
        type: 'dateFile',
        filename: '@/logs/app.log',
        keepFileExt: true,
        pattern: 'yyyy-MM-dd',
        numBackups: 7,
        compress: true,
      },
    },
    categories: {
      default: {
        appenders: ['console', 'app'],
        level: process.env['NODE_ENV'] === 'production' ? 'info' : 'trace',
        enableCallStack: true,
      },
    },
  });
}