const winston = require('winston'); // Import Winston logger
const winstonConfig = require('../config/winston-config.js'); // Import Winston configuration

// Initialize Winston logger with appropriate configuration
const MODULE = 'models/order';
winston.loggers.add(MODULE, winstonConfig.createLoggerConfig(MODULE));
const logger = winston.loggers.get(MODULE);

var query = require("../config/mysqlConnection.js");

exports.fetchOderDetails = async function (data) {
  try {
    let sql = `select * from order_table where 1=1 `
    + (data.user_id ? ` and user_id = '${data.user_id}' ` : " ") 
    + (data.order_status ? ` and order_status = '${data.order_status}' ` : " ")
    + ` order by order_id desc`;
    const result = await query(sql);
    return result;

  } catch (error) {
    logger.error('Error :', error); // Log error using Winston
    return "";
  }
};

exports.insertOrderDetails = async function (data) {
  try {
    let sql = `insert into order_table set ? ` ;
    let result = await query(sql, [data]);
    let order_id = result.insertId

    data = {order_id}
    sql = `insert into order_history set ? ` ;
    result = await query(sql, [data]);

    return order_id;
  } catch (error) {
    logger.error('Error :', error); // Log error using Winston
    return "";
  }
};

exports.updateOrderDetails = async function (order_id,  data) {
  try {
    data = Object.fromEntries(
      Object.entries(data).filter(([key, value]) => value !== undefined && value !== null)
    );
    
    let sql = `update order_table set ? where order_id = ${order_id} `;
    const result = await query(sql, [data]);
    return result;

  } catch (error) {
    logger.error('Error :', error); // Log error using Winston
    return "";
  }
};

exports.fetchOderHistory = async function (data) {
  try {
    let sql = `select * from order_history where 1=1 `
    + (data.order_id ? ` and order_id = '${data.order_id}' ` : " ") 
    + (data.order_status ? ` and order_status = '${data.order_status}' ` : " ")
    + ` order by order_id desc`;
    const result = await query(sql);
    return result;

  } catch (error) {
    logger.error('Error :', error); // Log error using Winston
    return "";
  }
};