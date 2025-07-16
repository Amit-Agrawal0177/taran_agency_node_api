require('dotenv').config();
require("./helpers/vault").getenv().then(() => {

    const fs = require('fs');
    const express = require('express');
    const cors = require("cors");
    const http = require('http');

    var app = express();
    const server = http.createServer(app);
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


    //mqtt connection
    const socketIo = require('socket.io');
    const mqtt = require('mqtt');
    const io = socketIo(server, {
      cors: {
        origin: "*",      // Allow all origins or specify your front-end URL here
        methods: ["GET", "POST"],
        allowedHeaders: ["my-custom-header"], // optional, if you use custom headers
        credentials: true
      }
    });

    var options = {
      port: 1883,
      clientId: 'mqttjs_' + Math.random().toString(16).substr(2, 8),
      username: 'arctic-geese',
      password: 'Ashish@2009-ag',
      keepalive: 60,
      reconnectPeriod: 1000,
      protocolId: 'MQIsdp',
      protocolVersion: 3,
      clean: true,
      encoding: 'utf8'
  };
    
  var mqttClient = mqtt.connect('mqtt://15.206.163.148', options);
    
    mqttClient.on('connect', () => {
        console.log('MQTT client connected');
    });
    
    io.on('connection', (socket) => {
        console.log('WebSocket client connected');
    
        socket.on('subscribe', (topic) => {
            mqttClient.subscribe(topic, (err) => {
                if (err) {
                    console.error('MQTT subscription error:', err);
                } else {
                    console.log(`Subscribed to MQTT topic: ${topic}`);
                }
            });
    
            mqttClient.on('message', (topic, message) => {
                socket.emit('mqttMessage', { topic, message: message.toString() });
            });
        });
    
        socket.on('unsubscribe', (topic) => {
          mqttClient.unsubscribe(topic, (err) => {
              if (err) {
                  console.error('MQTT unsubscribe error:', err);
              } else {
                  console.log(`unsubscribe to MQTT topic: ${topic}`);
              }
          });

          mqttClient.on('message', (topic, message) => {
              socket.emit('mqttMessage', { topic, message: message.toString() });
          });
        });

        socket.on('disconnect', () => {
            console.log('WebSocket client disconnected');
        });

        socket.on('publish', (data) => {
          mqttClient.publish(data.topic, data.message);
      });
    });

    //cors req for angular
    // app.use(cors());
    
    app.use(cors({
      origin: "*"  
    }));

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
    server.listen(port, () => {
        console.log("Server is running on port ", `http://localhost:${port}/api-docs`);
    });

    function attendanceScript () {
      const { spawn } = require('child_process');
    
      // const attendanceProcess = spawn('/opt/anaconda3/bin/python', ['-u', 'attendanceScript.py']);
      const attendanceProcess = spawn('/usr/bin/python3', ['-u', 'attendanceScript_Hr.py']);
    
      attendanceProcess.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
      });
    
      attendanceProcess.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
      });
    
      attendanceProcess.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
        attendanceScript();
      });
    }

    function attendanceScriptTushar () {
      const { spawn } = require('child_process');
    
      // const attendanceProcess = spawn('/opt/anaconda3/bin/python', ['-u', 'attendanceScript.py']);
      const attendanceProcess = spawn('/usr/bin/python3', ['-u', 'attendanceScriptTushar_Hr.py']);
    
      attendanceProcess.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
      });
    
      attendanceProcess.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
      });
    
      attendanceProcess.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
        attendanceScriptTushar();
      });
    }

    attendanceScript ();
    attendanceScriptTushar ();
});