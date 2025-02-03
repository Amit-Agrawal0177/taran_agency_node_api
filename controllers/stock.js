const stockQuery = require("../models/stock.js");

const crypto = require('crypto');
const moment = require("moment-timezone");

const winston = require('winston');
const winstonConfig = require('../config/winston-config.js');

const MODULE = 'controllers/stock';

winston.loggers.add(MODULE, winstonConfig.createLoggerConfig(MODULE));
const logger = winston.loggers.get(MODULE);


exports.stockCruds = async (req, res) => {
  try {
    var { prod_id, qty, user_id } = req.body;

    if(prod_id)
    {
      let updateData = await stockQuery.insertStock({prod_id, qty, user_id});
      if(updateData.insertId)
      {
        return res.status(200).json({
          statusCode: 0,
          msg: "Success"
        });
      }
      return res.status(200).json({
        statusCode: 1,
        msg: "Failed"
      });
    }
    return res.status(200).json({
      statusCode: 1,
      msg: "product not found"
    });
  } catch (error) {
    console.log(error);
    return res.status(200).json({
      statusCode: 5,
      msg: "Error found"
    });
  }
};