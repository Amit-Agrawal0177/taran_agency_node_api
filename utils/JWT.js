/* global include */
const JWT = require('jsonwebtoken');
const jwtKey = process.env.REFRESH_TOKEN || "DontHaveRefreshKey";

module.exports = {
  generateRefreshToken: async (user) => {
   
    return await JWT.sign(
      {
        user_num: user.user_id,
        access_token: user.token,
        iat: Math.floor(Date.now() / 1000),
      },
      jwtKey,
      { expiresIn: '365d' }
    );
  },

  //creating token
  signtoken: (user) => {
    return JWT.sign(
      {
        userId: user.user_id,
        iat: new Date().getTime(),
        iss: 18,
      },
      ACCESS_TOKEN_SECRET,

      { expiresIn: '1h' }
    );
  },
};
