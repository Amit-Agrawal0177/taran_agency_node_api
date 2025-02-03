const winston = require('winston'); // Import Winston logger
const winstonConfig = require('../config/winston-config.js'); // Import Winston configuration

// Initialize Winston logger with appropriate configuration
const MODULE = 'models/product';
winston.loggers.add(MODULE, winstonConfig.createLoggerConfig(MODULE));
const logger = winston.loggers.get(MODULE);

var query = require("../config/mysqlConnection.js");

exports.fetchProductDetails = async function (data) {
  try {
    let sql = `select sum(qty) as stocks_left, pm.* from product_master as pm left join stock_table as st on st.prod_id = pm.prod_id where 1=1 `
    + (data.prod_name ? ` and pm.prod_name like '%${data.prod_name}%' ` : " ") 
    + (data.prod_id ? ` and pm.prod_id = '${data.prod_id}' ` : " ") 
    + (data.is_active ? ` and pm.is_active = '${data.is_active}' ` : " ")
    + ` order by pm.doa desc`;
    const result = await query(sql);
    return result;

  } catch (error) {
    logger.error('Error :', error); // Log error using Winston
    return "";
  }
};

exports.insertProductDetails = async function (data) {
  try {
    let sql = `insert into product_master set ? ` ;
    const result = await query(sql, [data]);
    return result;

  } catch (error) {
    logger.error('Error :', error); // Log error using Winston
    return "";
  }
};

exports.updateRoductDetails = async function (prod_id,  data) {
  try {
    data = Object.fromEntries(
      Object.entries(data).filter(([key, value]) => value !== undefined && value !== null)
    );
    
    let sql = `update product_master set ? where prod_id = ${prod_id} `;
    const result = await query(sql, [data]);
    return result;

  } catch (error) {
    logger.error('Error :', error); // Log error using Winston
    return "";
  }
};