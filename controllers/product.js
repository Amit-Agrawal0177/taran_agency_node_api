const productQuery = require("../models/product.js");

const crypto = require('crypto');
const moment = require("moment-timezone");

const winston = require('winston');
const winstonConfig = require('../config/winston-config.js');

const MODULE = 'controllers/Product';

winston.loggers.add(MODULE, winstonConfig.createLoggerConfig(MODULE));
const logger = winston.loggers.get(MODULE);


exports.productCruds = async (req, res) => {
  try {
    var { prod_id, prod_name, prod_type, description, image, stock_thershold, price, batch, mfg, cgst, sgst, is_active } = req.body;

    if(prod_id)
    {
      let updateData = await productQuery.updateRoductDetails(prod_id, { prod_name, prod_type, description, image, price, stock_thershold, batch, mfg, cgst, sgst, is_active });
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
    if (!(prod_name && price)) {
      return res.status(200).json({
        statusCode: 3,
        msg: "Req params not found"
      });
    }
    let updateData = await productQuery.insertProductDetails({ prod_name, prod_type, description, image, price, stock_thershold, batch, mfg, cgst, sgst });
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
  } catch (error) {
    console.log(error);
    return res.status(200).json({
      statusCode: 5,
      msg: "Error found"
    });
  }
};

exports.listOfProduct = async (req, res) => {
  try {
    var { prod_id, prod_name, prod_type } = req.body;

    let data = await productQuery.fetchProductDetails({prod_id, prod_name, prod_type, is_active : "Y"});
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