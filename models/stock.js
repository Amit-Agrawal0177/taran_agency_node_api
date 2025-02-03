const winston = require('winston'); // Import Winston logger
const winstonConfig = require('../config/winston-config.js'); // Import Winston configuration

// Initialize Winston logger with appropriate configuration
const MODULE = 'models/stock';
winston.loggers.add(MODULE, winstonConfig.createLoggerConfig(MODULE));
const logger = winston.loggers.get(MODULE);

var query = require("../config/mysqlConnection.js");

exports.insertStock = async function (data) {
  try {
    let sql = `insert into stock_table set ? ` ;
    const result = await query(sql, [data]);
    return result;

  } catch (error) {
    logger.error('Error :', error); // Log error using Winston
    return "";
  }
};
