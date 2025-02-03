const orderQuery = require("../models/order.js");

const crypto = require('crypto');
const moment = require("moment-timezone");

const winston = require('winston');
const winstonConfig = require('../config/winston-config.js');

const MODULE = 'controllers/Order';

winston.loggers.add(MODULE, winstonConfig.createLoggerConfig(MODULE));
const logger = winston.loggers.get(MODULE);


exports.orderCruds = async (req, res) => {
  try {
    var { order_id, user_id, item_json, amount, order_status, delivered_by } = req.body;

    if(order_id)
    {
      let updateData = await orderQuery.updateOrderDetails(order_id, { order_status, delivered_by });
      if(updateData.affectedRows)
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
    if (!(user_id && item_json && item_json)) {
      return res.status(200).json({
        statusCode: 3,
        msg: "Req params not found"
      });
    }
    let updateData = await orderQuery.insertOrderDetails({ user_id, item_json : JSON.stringify(item_json), amount, order_status, delivered_by });
    if(updateData)
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
  } catch (error) {
    console.log(error);
    return res.status(200).json({
      statusCode: 5,
      msg: "Error found"
    });
  }
};

exports.listOfOrder = async (req, res) => {
  try {
    var { order_id, order_status } = req.body;

    let data = await orderQuery.fetchOderDetails({order_id, order_status});
    if (data.length) {
      return res.status(200).json({
        statusCode: 0,
        op: data,
        msg: "Success"
      });
    }

    return res.status(200).json({
      statusCode: 1,
      msg: "List Not Found"
    });
  } catch (error) {
    console.log(error);
    return res.status(200).json({
      statusCode: 5,
      msg: "Error found"
    });
  }
};

exports.orderHistory = async (req, res) => {
  try {
    var { order_id, order_status } = req.body;

    let data = await orderQuery.fetchOderHistory({order_id, order_status});
    if (data.length) {
      return res.status(200).json({
        statusCode: 0,
        op: data,
        msg: "Success"
      });
    }

    return res.status(200).json({
      statusCode: 1,
      msg: "List Not Found"
    });
  } catch (error) {
    console.log(error);
    return res.status(200).json({
      statusCode: 5,
      msg: "Error found"
    });
  }
};