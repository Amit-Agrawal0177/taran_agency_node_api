Api Description
#user
1. userLogin login contact, password, otp
2. listOfOtp
3. addUser contact name password role 
4. customerList 

#product
1. crudsOfProduct add, update, delete : rate history maintain
2. listOfProduct with stock

#stock
1. addStock prodnum, qty, batch, mfg

#order
1. orderList opt customer wise, datewise, complete order, pending order, complete order
2. addOrder
3. updateOrder


<!-- [{"prod_id":1, "qty":10, "amt": 20}, {"prod_id":2, "qty":10, "amt": 20}] -->
<!-- 'order_status : on_cart,payment done,delivered, cancelled' -->
<!-- http://15.206.163.148:30119/api-docs/ -->