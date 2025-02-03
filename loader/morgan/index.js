const morgan = require("morgan");

// Get logger from external configuration source
const winstonConfig = require("../../config/winston-config");

let defaultLogger = winstonConfig.defaultLogger;

module.exports = function (app) {
  //Middleware -> morgan
  app.use(
    morgan(
      ":method :url :status :res[content-length] :remote-addr - :response-time ms",
      { stream: defaultLogger.stream }
    )
  ); //logger
  defaultLogger.info("Morgan enabled.");
};
