const express = require("express");
const productControl = require("../controllers/product");
 
const router = express.Router();

//machine routes

/**
 * @swagger
 * /product/productCruds:
 *      post:
 *          security:
 *             - CT_JWT: []
 *          summary: 'productCruds cruds api'
 *          tags:
 *           - Product
 *          description: ''
 *          parameters:
 *           - name: body
 *             in: body
 *             schema:
 *              type: object
 *              items:
 *                  type: string
 *              example:  { "prod_id":"only for edit and delete", prod_name,  prod_type, description, image, stock_thershold, price, batch, mfg, cgst, sgst, is_active : "Y" }
 *          responses:
 *              '200':
 *               description: OK
 *              '403':
 *               description: Not proper permission
 *              '500':
 *               description: Server Error
 */
router.route("/productCruds").post(productControl.productCruds);

/**
 * @swagger
 * /product/listOfProduct:
 *      post:
 *          security:
 *             - CT_JWT: []
 *          summary: 'list of products'
 *          tags:
 *           - Product
 *          description: ''
 *          parameters:
 *           - name: body
 *             in: body
 *             schema:
 *              type: object
 *              items:
 *                  type: string
 *              example:  {prod_id, prod_type, prod_name}
 *          responses:
 *              '200':
 *               description: OK
 *              '403':
 *               description: Not proper permission
 *              '500':
 *               description: Server Error
 */
router.route("/listOfProduct").post(productControl.listOfProduct);

module.exports = router;