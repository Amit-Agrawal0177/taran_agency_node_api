const express = require("express");
const stockControl = require("../controllers/stock");
 
const router = express.Router();

//machine routes

/**
 * @swagger
 * /stock/stockCruds:
 *      post:
 *          security:
 *             - CT_JWT: []
 *          summary: 'stock insert api'
 *          tags:
 *           - Stock
 *          description: ''
 *          parameters:
 *           - name: body
 *             in: body
 *             schema:
 *              type: object
 *              items:
 *                  type: string
 *              example:  { "prod_id":"", "qty":"", "user_id":""}
 *          responses:
 *              '200':
 *               description: OK
 *              '403':
 *               description: Not proper permission
 *              '500':
 *               description: Server Error
 */
router.route("/stockCruds").post(stockControl.stockCruds);

module.exports = router;