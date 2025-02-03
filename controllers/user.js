const userQuery = require("../models/user.js");

const crypto = require('crypto');
const moment = require("moment-timezone");

const winston = require('winston');
const winstonConfig = require('../config/winston-config.js');

const MODULE = 'controllers/User';

winston.loggers.add(MODULE, winstonConfig.createLoggerConfig(MODULE));
const logger = winston.loggers.get(MODULE);

const bcrypt = require('bcrypt');
const saltRounds = 10;

exports.listOfOtp = async (req, res) => {
  try {
    var { } = req.body;

    let otpList = await userQuery.fetchOtp({})

    return res.status(200).json({
      statusCode: 0,
      msg: "Success",
      op: otpList 
    });
  } catch (error) {
    console.log(error);
    return res.status(200).json({
      statusCode: 5,
      msg: "Error found"
    });
  }
};

exports.login = async (req, res) => {
  try {
    var { phone, password, otp } = req.body;

    if (!(phone && (password || otp))) {
      return res.status(200).json({
        statusCode: 3,
        msg: "Req params not found"
      });
    }

    let data = await userQuery.fetchUserDetails({phone, is_active : "Y"})
    //for old user
    if(data.length)
    {
      const isMatch = await bcrypt.compare(password, data[0].password);
      if(isMatch)
      {
        return res.status(200).json({
          statusCode: 0,
          msg: "Success",
          op: [{
            user_id : data[0].user_id,
            phone: data[0].phone,
            name : data[0].name,
            role_id: data[0].role_id
          }]
        });
      }
      if(otp != undefined)
      {
        let compare_otp = await userQuery.fetchOtp({phone, user_id: data[0].user_id, otp, is_active : "Y"})
        if(compare_otp.length)
        {
          let updatePassword = await userQuery.updateUserDetails(data[0].user_id, {password : await bcrypt.hash(password, saltRounds)})
          if(updatePassword.affectedRows)
          {
            await userQuery.updateOtp({user_id : data[0].user_id})
            return res.status(200).json({
              statusCode: 0,
              msg: "Success",
              op: [{
                user_id : data[0].user_id,
                phone: data[0].phone,
                name : data[0].name,
                role_id: data[0].role_id
              }]
            });
          }
        }
      }

      let prev_otp = await userQuery.fetchOtp({phone, user_id: data[0].user_id, is_active : "Y"})
      if(prev_otp.length == 0)
      {
        let newOtp = parseInt(Math.random() * (10000 - 1000) + 1000);
        let newE = await userQuery.insertNewOtp({phone, user_id: data[0].user_id, otp : newOtp})
      }

      // if(newE.insertId)
      {
        return res.status(200).json({
          statusCode: 2,
          msg: "Please Verify, otp is sent to your contact number."
        });
      }
      return res.status(200).json({
        statusCode: 4,
        msg: "Failed to sent"
      });
    }
    //for new user
    else
    {
      let newdata = await userQuery.insertUserDetails({phone, password : await bcrypt.hash("guest", saltRounds), is_active : "Y"})
      if(newdata.insertId)
      {
        let newOtp = parseInt(Math.random() * (10000 - 1000) + 1000);
        let newE = await userQuery.insertNewOtp({phone, user_id: newdata.insertId, otp : newOtp})
        if(newE.insertId)
        {
          return res.status(200).json({
            statusCode: 1,
            msg: "Please Registered, otp is sent to your contact number."
          });
        }
        return res.status(200).json({
          statusCode: 4,
          msg: "Failed to sent"
        });
      }
    }
    return res.status(200).json({
      statusCode: 4,
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

exports.addUser = async (req, res) => {
  try {
    var { phone, role_id } = req.body;

    if (!(phone && role_id)) {
      return res.status(200).json({
        statusCode: 3,
        msg: "Req params not found"
      });
    }

    let data = await userQuery.fetchUserDetails({phone})
    //for old user
    if(data.length)
    {
      return res.status(200).json({
        statusCode: 1,
        msg: "User Already Present"
      });
    }
    //for new user
    else
    {
      let newdata = await userQuery.insertUserDetails({phone, password : await bcrypt.hash("guest", saltRounds), role_id, is_active : "Y"})
      if(newdata.insertId)
      {
        let newOtp = parseInt(Math.random() * (10000 - 1000) + 1000);
        let newE = await userQuery.insertNewOtp({phone, user_id: newdata.insertId, otp : newOtp})
        if(newE.insertId)
        {
          return res.status(200).json({
            statusCode: 0,
            msg: "User Registered, otp is sent to the respective contact number."
          });
        }
        return res.status(200).json({
          statusCode: 4,
          msg: "User Registered, Failed to sent otp"
        });
      }
    }
    return res.status(200).json({
      statusCode: 4,
      msg: "Failed to register"
    });
  } catch (error) {
    console.log(error);
    return res.status(200).json({
      statusCode: 5,
      msg: "Error found"
    });
  }
};

exports.listOfUser = async (req, res) => {
  try {
    var { user_id, role_id } = req.body;

    let data = await userQuery.fetchUserDetails({user_id, role_id, is_active : "Y"});
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