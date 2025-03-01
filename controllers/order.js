const orderQuery = require("../models/order.js");
const productQuery = require("../models/product.js");
const stockQuery = require("../models/stock.js");

const crypto = require('crypto');
const moment = require("moment-timezone");

const winston = require('winston');
const winstonConfig = require('../config/winston-config.js');

const MODULE = 'controllers/Order';

winston.loggers.add(MODULE, winstonConfig.createLoggerConfig(MODULE));
const logger = winston.loggers.get(MODULE);


exports.orderCruds = async (req, res) => {
  try {
    var { order_id, user_id, item_json, amount, order_status="on_cart", delivered_by } = req.body;

    if(order_id)
    {
      if (!(order_id && order_status)) {
        return res.status(200).json({
          statusCode: 3,
          msg: "Req params not found"
        });
      }
      let data = await orderQuery.fetchOderDetails({order_id});
      if(!data.length)
      {
        return res.status(200).json({
          statusCode: 3,
          msg: "Order details not found"
        });
      }
      item_json = JSON.parse(data[0].item_json)

      if(order_status == "payment done")  //check every thing in stocks
      {
        let product_stocks_status = []
        let temp = item_json;

        if (typeof item_json === 'string') {
           temp = JSON.parse(item_json);
        }

        for(let key of temp)
        {
          let ps = await productQuery.fetchProductDetails({prod_id : key.prod_id})
          if(ps.length)
          {
            if(key.qty > ps[0].stocks_left) 
            {
              product_stocks_status.push({prod_id : key.prod_id, prod_name : ps[0].prod_name, msg : `${ps[0].stocks_left} left, in stocks`})
            }
          }
          else
          {
            product_stocks_status.push({prod_id : key.prod_id, prod_name : "Prod Not Found", msg : `Wrong product selection`})
          }
        }

        if(product_stocks_status.length)
        {
          return res.status(200).json({
            statusCode: 9,
            msg: "Insufficent stocks",
            product_stocks_status
          });
        }
      }
      
      item_json = mergeItemJson(item_json)
      let updateData = await orderQuery.updateOrderDetails(order_id, { item_json : JSON.stringify(item_json), order_status, delivered_by });
      if(updateData.affectedRows)
      {
        let oldData = await orderQuery.fetchOderDetails({order_id})
        if(order_status == "payment done")  //check every thing in stocks
        {
          let temp = item_json;

          if (typeof item_json === 'string') {
            temp = JSON.parse(item_json);
          }

          for(let key of temp)
          {
            await stockQuery.insertStock({prod_id : key.prod_id, qty : Number(key.qty) * -1, user_id : oldData[0].user_id});
          }
        }

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
    if (!(user_id && item_json)) {
      return res.status(200).json({
        statusCode: 3,
        msg: "Req params not found"
      });
    }
    let data = await orderQuery.fetchOderDetails({user_id, order_status : "on_cart"});
    if(data.length)
    {
      let temp = JSON.parse(data[0].item_json)
      temp.push(item_json[0])

      let amt = 0;
      for(let key of temp)  amt = parseFloat(key.amt) + parseFloat(amt)
      temp = mergeItemJson(temp)
      let updateData = await orderQuery.updateOrderDetails(data[0].order_id, { item_json : JSON.stringify(temp), amount : parseFloat(amt).toFixed(2) });
      if(updateData.affectedRows)
      {
        return res.status(200).json({
          statusCode: 0,
          op : item_json,
          msg: "Success"
        });
      }
      else
      {
        return res.status(200).json({
          statusCode: 1,
          msg: "Failed"
        });
      }
    }

    let amt = 0;
    for(let key of item_json)  amt = parseFloat(key.amt) + parseFloat(amt)
    item_json = mergeItemJson(item_json)
    let updateData = await orderQuery.insertOrderDetails({ user_id, item_json : JSON.stringify(item_json), amount : parseFloat(amt).toFixed(2), order_status, delivered_by });
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
    var { order_id, order_status, user_id } = req.body;

    let data = await orderQuery.fetchOderDetails({order_id, order_status, user_id});
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

function mergeItemJson(data){
  const mergedData = Object.values(
    data.reduce((acc, item) => {
        const { prod_id, amt, qty } = item;

        if (!acc[prod_id]) {
            acc[prod_id] = { prod_id, amt: 0, qty: 0 };
        }

        acc[prod_id].amt += amt;
        acc[prod_id].qty += qty;

        return acc;
    }, {})
  );
  return mergedData
}