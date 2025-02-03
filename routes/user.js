const express = require("express");
const userControl = require("../controllers/user");
 
const router = express.Router();

//machine routes

/**
 * @swagger
 * /user/login:
 *      post:
 *          security:
 *             - CT_JWT: []
 *          summary: 'login and register api'
 *          tags:
 *           - User
 *          description: ''
 *          parameters:
 *           - name: body
 *             in: body
 *             schema:
 *              type: object
 *              items:
 *                  type: string
 *              example:  {"phone": "", password: "", otp: ""}
 *          responses:
 *              '200':
 *               description: OK
 *              '403':
 *               description: Not proper permission
 *              '500':
 *               description: Server Error
 */
router.route("/login").post(userControl.login);

/**
 * @swagger
 * /user/listOfOtp:
 *      post:
 *          security:
 *             - CT_JWT: []
 *          summary: 'list of otps'
 *          tags:
 *           - User
 *          description: ''
 *          parameters:
 *           - name: body
 *             in: body
 *             schema:
 *              type: object
 *              items:
 *                  type: string
 *              example:  {}
 *          responses:
 *              '200':
 *               description: OK
 *              '403':
 *               description: Not proper permission
 *              '500':
 *               description: Server Error
 */
router.route("/listOfOtp").post(userControl.listOfOtp);

/**
 * @swagger
 * /user/addUser:
 *      post:
 *          security:
 *             - CT_JWT: []
 *          summary: 'admin can add user'
 *          tags:
 *           - User
 *          description: 'role : Admin,customer,employees'
 *          parameters:
 *           - name: body
 *             in: body
 *             schema:
 *              type: object
 *              items:
 *                  type: string
 *              example:  {"phone": "", role_id: "", otp: ""}
 *          responses:
 *              '200':
 *               description: OK
 *              '403':
 *               description: Not proper permission
 *              '500':
 *               description: Server Error
 */
router.route("/addUser").post(userControl.addUser);

/**
 * @swagger
 * /user/listOfUser:
 *      post:
 *          security:
 *             - CT_JWT: []
 *          summary: 'list of user'
 *          tags:
 *           - User
 *          description: 'role : Admin,customer,employees'
 *          parameters:
 *           - name: body
 *             in: body
 *             schema:
 *              type: object
 *              items:
 *                  type: string
 *              example:  {"user_id": "", "role_id": "" }
 *          responses:
 *              '200':
 *               description: OK
 *              '403':
 *               description: Not proper permission
 *              '500':
 *               description: Server Error
 */
router.route("/listOfUser").post(userControl.listOfUser);
module.exports = router;