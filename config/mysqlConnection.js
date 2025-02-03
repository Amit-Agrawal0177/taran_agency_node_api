const mysql = require("mysql");
const dbConfig = require("./db.js");

dbConfig.connectionLimit = 1000;
dbConfig.connectTimeout = 60 * 60 * 1000;
dbConfig.acquireTimeout  = 60 * 60 * 1000;
dbConfig.timeout  = 60 * 60 * 1000;

const pool = mysql.createPool(dbConfig);

pool.query("SELECT 1 + 1 AS solution", function (error, results) {
  if (error) {
   
    throw error;
  }
  console.log('The solution is: ', results[0].solution);
 
});

let query = (sql, values = []) => {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
       
        reject(err);
      } else {
        connection.query(sql, values, (err, rows) => {
          if (err) {
           
            reject(err);
          } else {
            resolve(rows);
          }
          connection.release();
        });
      }
    });
  });
};

module.exports = query;
