const winston = require('winston'); // Import Winston logger
const winstonConfig = require('../config/winston-config.js'); // Import Winston configuration

// Initialize Winston logger with appropriate configuration
const MODULE = 'models/common';
winston.loggers.add(MODULE, winstonConfig.createLoggerConfig(MODULE));
const logger = winston.loggers.get(MODULE);

var query = require("../config/mysqlConnection.js");

exports.insertApiLog = async (req) => {
    try {
        let data = {
            ip : req.headers['x-forwarded-for'] || req.connection.remoteAddress,
            body : req.method == "POST" ? JSON.stringify(req.body) : JSON.stringify(req.query),
            endpoint : req.originalUrl
        }
        const sql = "INSERT INTO api_log set ?";
        const result = await query(sql, data);
        return result;
    }
    catch (error) {
        console.log(error);
        return "";
    }
};

exports.fetchIpAddress = async (ip) => {
    try {
        const sql = `SELECT * FROM blocked_ip WHERE ip_address = '${ip}' order by id desc`;
        const result = await query(sql);
        return result;
    }
    catch (error) {
        console.log(error);
        return "";
    }
}; 

exports.insertIpAddress = async (data) => {
    try {
        const sql = `insert into blocked_ip set ?`;
        const result = await query(sql, [data]);
        return result;
    }
    catch (error) {
        console.log(error);
        return "";
    }
};

exports.updateIpAddress = async (ip, data) => {
    try {
        const sql = `update blocked_ip set ? where ip_address = '${ip}'`;
        const result = await query(sql, [data]);
        return result;
    }
    catch (error) {
        console.log(error);
        return "";
    }
};