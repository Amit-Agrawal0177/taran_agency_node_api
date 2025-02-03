const winston = require("winston");

const fastRedact = require("fast-redact");
const redact = fastRedact({
  paths: [
    "metadata.params.access_token",
    "metadata.params.variants[*].merchant_key",
    "metadata.params.variants[*].salt",
    "metadata.params.password",
    "metadata.params[*].merchant_key",
    "metadata.params[*].salt",
    "metadata.params[*].password",
    "metadata.params[*].access_token",
  ],
  serialize: false,
});

// The default Category
const DEFAULT_CATEGORY = "taran_agency_api_node";

/**
 * Creates a specific type of logger config
 * Take a category label as a parameter that is used
 * to decorate the logged message.
 *
 * @param {String} category - the category to decorate the message.
 * Generally, a category aligns to a function area in the app.
 *
 * @return {Object} - the Winston configuration for a logger, ready
 * to be added via the winston.loggers.add() function.
 */

function createLoggerConfig(category) {
  return {
    levels: {
      error: 0,
      debug: 1,
      info: 2,
    },
    exitOnError: false,
    transports: [
      new winston.transports.Console({
        level: process.env.LOG_LEVEL,
        format: winston.format.combine(
          winston.format.label({
            label: category,
          }),
          winston.format.timestamp(),
          winston.format.printf((info) => {
            return `${info.timestamp} - ${info.label}:[${info.level}]: ${info.message}`;
          })
        ),
      }),
      new winston.transports.File({
        level: "info",
        filename: "logs/info.log",
        json: true,
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.metadata({
            fillExcept: ["message", "level", "timestamp", "label", "password"],
          }),
          winston.format((info) => redact(info))(),
          winston.format.json()
        ),
      }),
      new winston.transports.File({
        level: "error",
        filename: "logs/error.log",
        json: true,
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.metadata({
            fillExcept: ["message", "level", "timestamp", "label"],
          }),
          winston.format.json()
        ),
      }),
      // new winston.transports.File({
      //   level: "debug",
      //   filename: "logs/Debug.log",
      //   json: true,
      //   format: winston.format.combine(
      //     winston.format.metadata({
      //       fillExcept: ["message", "level", "timestamp", "label"],
      //     }),
      //     winston.format.json(),
      //     winston.format.timestamp()
      //   ),
      // }),
    ],
  };
}
// Default Logger configuration
winston.loggers.add(DEFAULT_CATEGORY, createLoggerConfig(DEFAULT_CATEGORY));

const defaultLogger = winston.loggers.get(DEFAULT_CATEGORY);

defaultLogger.stream = {
  write: function (message, encoding) {
    defaultLogger.info(message);
  },
};
// Export the default logger
module.exports.defaultLogger = defaultLogger;

// Export the function to create Winston log config
module.exports.createLoggerConfig = createLoggerConfig;
