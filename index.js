require('dotenv').config();
require("./helpers/vault").getenv().then(() => {

    const fs = require('fs');
    const express = require('express');
    const cors = require("cors");

    var app = express();
    app.use(express.json({ limit: '50mb' }));
    app.use(express.urlencoded({ limit: '50mb', extended: true }));
    app.use(express.static('public'));

    const msQuery = require("./models/common.js");

    const ipBlockMiddleware = async (req, res, next) => {
      const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      const ip_result = await msQuery.fetchIpAddress(clientIp);
      const ipData = ip_result[0];

      if (ipData && ipData.blocked) {
        return res.status(403).json({
          error: 'Your IP has been blocked due to suspicious activity'
        });
      }

      if (!ipData) {
        await msQuery.insertIpAddress({ip_address : clientIp, request_count: 0, blocked: false});
      }

      const requestCount = ipData ? ipData.request_count : 0;
      const firstRequestTimestamp = ipData ? ipData.first_request_timestamp : Date.now();

      const currentTime = Date.now();
      const oneMinute = 60 * 1000;

      if (currentTime - firstRequestTimestamp > oneMinute) {
        await msQuery.updateIpAddress(clientIp, { request_count: 1, first_request_timestamp: currentTime });
      } else {
        await msQuery.updateIpAddress(clientIp, { request_count: requestCount + 1 });
      }

      if (requestCount > 180) {
        await msQuery.updateIpAddress(clientIp, { blocked: 1 });
        return res.status(403).json({ statusCode: 403, msg: 'IP blocked due to excessive requests' });
      }

      await msQuery.insertApiLog(req);
      next();
    };

    app.use(ipBlockMiddleware);

    //cors req for angular
    app.use(cors());

    //morgan
    const morgan = require("./loader/morgan/index.js");
    morgan(app);

    //middleware
    app.use(express.json());

    const port = process.env.PORT || 30119;

    //Swagger
    const swaggerDoc = require("./config/swagger-config.js");
    swaggerDoc(app);

    //user table routes
    var userRoutes = require("./routes/user.js"); //importing route
    var productRoutes = require("./routes/product.js"); //importing route
    var stockRoutes = require("./routes/stock.js"); //importing route
    var orderRoutes = require("./routes/order.js"); //importing route

    app.use('/user', userRoutes);
    app.use('/product', productRoutes);
    app.use('/stock', stockRoutes);
    app.use('/order', orderRoutes);
      
    //port to listen
    app.listen(port, () => {
        console.log("Server is running on port ", `http://localhost:${port}/api-docs`);
    });
});