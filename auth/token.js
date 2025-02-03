const { verify } = require("jsonwebtoken");

module.exports = {
  verifyToken: (req, res, next) => {
    // Get auth header value
    const bearerHeader = req.headers["authorization"];
    // console.log("auth--->",bearerHeader);
    // Check if bearer is undefined
    if (typeof bearerHeader !== "undefined") {
      // Split at the space
      const bearer = bearerHeader;
      // console.log("bear-->",bearer);
      // Get token from array
      //const bearerToken = bearer[1];
      // Set the token
      req.token = bearer;
     
      verify(req.token, process.env.ACCESS_TOKEN, async(err, decode) => {
        if (err) {
      
          return res.status(403).json({ statusCode: 403, msg: "Unauthenticated" });
        } else {
          if (!req.token){
        return res.status(403).json({
          statusCode: 1,
          msg: "Your session is expired",
        });
      }
         if(decode && decode.user_id && decode.contact_email)
         {
          req.decode = decode;
         }
         return next();
        }
      });
      //  res.json({message:"authorization success",bearer});
      // Next middleware
      //  next();
    } else {
      // Forbidden
      res.status(401).json({ statusCode: 3, message: "authorization failed" });
      res.end();
    }
  },
};
