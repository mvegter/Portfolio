const { createLogger, format, transports } = require('winston');

const logger = createLogger({
  format: format.combine(format.splat(), format.json()),
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new transports.Console({
    format: format.combine(format.colorize(), format.simple()),
  }));
}

module.exports = logger;
