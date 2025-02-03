const swaggerUI = require("swagger-ui-express");
  const swaggerJsDoc = require("swagger-jsdoc");
  
  const swaggerDefinition = {
    info: {
      title: "taran_agency_api_node",
      version: "1.0.0",
      description: "",
      contact: {
        name: 'Amit Agrawal',
      },
    },
    basePath: "/",
    securityDefinitions: {
      CT_JWT: {
        type: 'apiKey',
        name: 'Authorization',
        in: 'header',
      },
    },
    servers: [
      {
        url: `http://localhost:30119`,
      },
    ],
  };
  const option = {
    swaggerDefinition,
    apis: ['index.js', './routes/*.js', './loaders/routes.js'],
  };
  
  const swaggerSpec = swaggerJsDoc(option);
  
  module.exports = (app) => {
    app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerSpec));
  };
  