const winston = require('winston'); // Import Winston logger
const winstonConfig = require('../config/winston-config.js'); // Import Winston configuration

// Initialize Winston logger with appropriate configuration
const MODULE = 'models/user';
winston.loggers.add(MODULE, winstonConfig.createLoggerConfig(MODULE));
const logger = winston.loggers.get(MODULE);

var query = require("../config/mysqlConnection.js");

exports.fetchUserDetails = async function (data) {
  try {
    let sql = `select * from user_table where 1=1 `
    + (data.phone ? ` and phone = '${data.phone}' ` : " ") 
    + (data.user_num ? ` and user_num = '${data.user_num}' ` : " ") 
    + (data.name ? ` and name = '${data.name}' ` : " ") 
    + (data.password ? ` and password = '${data.password}' ` : " ") 
    + (data.is_active ? ` and is_active = '${data.is_active}' ` : " ") 
    + (data.role_id ? ` and role_id = '${data.role_id}' ` : " ") ;
    const result = await query(sql);
    return result;

  } catch (error) {
    logger.error('Error :', error); // Log error using Winston
    return "";
  }
};

exports.insertUserDetails = async function (data) {
  try {
    let sql = `insert into user_table set ? ` ;
    const result = await query(sql, [data]);
    return result;

  } catch (error) {
    logger.error('Error :', error); // Log error using Winston
    return "";
  }
};

exports.updateUserDetails = async function (user_id,  data) {
  try {
    let sql = `update user_table set ? where user_id = ${user_id} `;
    const result = await query(sql, [data]);
    return result;

  } catch (error) {
    logger.error('Error :', error); // Log error using Winston
    return "";
  }
};

exports.insertNewOtp = async function (data) {
  try {
    let sql = `insert into otp_access set ? ` ;
    const result = await query(sql, [data]);
    return result;

  } catch (error) {
    logger.error('Error :', error); // Log error using Winston
    return "";
  }
};

exports.fetchOtp = async function (data) {
  try {
    let sql = `select * from otp_access where is_active = "Y"  `
    + (data.phone ? ` and phone = '${data.phone}' ` : " ") 
    + (data.user_id ? ` and user_id = '${data.user_id}' ` : " ") 
    + (data.otp ? ` and otp = '${data.otp}' ` : " ") 
    + ` order by id desc limit 1` ;
    const result = await query(sql);
    return result;

  } catch (error) {
    logger.error('Error :', error); // Log error using Winston
    return "";
  }
};

exports.updateOtp = async function (data) {
  try {
    let sql = `update otp_access set is_active = "N" where is_active = "Y"  `
    + (data.phone ? ` and phone = '${data.phone}' ` : " ") 
    + (data.user_id ? ` and user_id = '${data.user_id}' ` : " ") 
    + (data.otp ? ` and otp = '${data.otp}' ` : " ");
    const result = await query(sql);
    return result;

  } catch (error) {
    logger.error('Error :', error); // Log error using Winston
    return "";
  }
};