const express = require("express");
const orderControl = require("../controllers/order");
 
const router = express.Router();

//machine routes

/**
 * @swagger
 * /order/orderCruds:
 *      post:
 *          security:
 *             - CT_JWT: []
 *          summary: 'orderCruds cruds api'
 *          tags:
 *           - Order
 *          description: ''
 *          parameters:
 *           - name: body
 *             in: body
 *             schema:
 *              type: object
 *              items:
 *                  type: string
 *              example:  { "order_id":"only for update status of product", user_id, item_json, amount, order_status, delivered_by}
 *          responses:
 *              '200':
 *               description: OK
 *              '403':
 *               description: Not proper permission
 *              '500':
 *               description: Server Error
 */
router.route("/orderCruds").post(orderControl.orderCruds);

/**
 * @swagger
 * /order/listOfOrder:
 *      post:
 *          security:
 *             - CT_JWT: []
 *          summary: 'list of order'
 *          tags:
 *           - Order
 *          description: ''
 *          parameters:
 *           - name: body
 *             in: body
 *             schema:
 *              type: object
 *              items:
 *                  type: string
 *              example:  {order_id, order_status}
 *          responses:
 *              '200':
 *               description: OK
 *              '403':
 *               description: Not proper permission
 *              '500':
 *               description: Server Error
 */
router.route("/listOfOrder").post(orderControl.listOfOrder);

/**
 * @swagger
 * /order/orderHistory:
 *      post:
 *          security:
 *             - CT_JWT: []
 *          summary: 'order history details'
 *          tags:
 *           - Order
 *          description: ''
 *          parameters:
 *           - name: body
 *             in: body
 *             schema:
 *              type: object
 *              items:
 *                  type: string
 *              example:  {order_id, order_status}
 *          responses:
 *              '200':
 *               description: OK
 *              '403':
 *               description: Not proper permission
 *              '500':
 *               description: Server Error
 */
router.route("/orderHistory").post(orderControl.orderHistory);

module.exports = router;