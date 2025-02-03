
// //local mysql db connection
// var connection = mysql.createConnection({
//   host: "134.209.155.99",
//   user: "test-user",
//   password: "g1br3AL",
//   // host: "localhost",
//   // user: "root",
//   // password: "",
//   database: "vend_trails_test",
// });


module.exports = {
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: "taran_agency_db",//process.env.db_database,
  dateStrings:true,
  acquireTimeout: 1000000
};

// module.exports = {
//   host: "db3.9930i.com",
//   user: "test-user",
//   password:  "mee0woh5Hu3bee0SheeF",
//   database: "golf_ball_db",
//   dateStrings:true,
//   acquireTimeout: 1000000
// };