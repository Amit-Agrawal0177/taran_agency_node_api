require('dotenv').config();
require("./helpers/vault").getenv().then(() => {

    const fs = require('fs');
    const express = require('express');
    const cors = require("cors");

    var app = express();
    app.use(express.json({ limit: '50mb' }));
    app.use(express.urlencoded({ limit: '50mb', extended: true }));
    app.use(express.static('public'));


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