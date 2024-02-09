const express = require('express')
const router = express.Router();
const Ordercontroller=require('../controller/OrderController')
const checkSessionBlocked = require('../middleware/UserMiddleware')

/// get
router.get('/CheckoutPage',checkSessionBlocked,Ordercontroller.Checkout)
router.post('/Checkoutpost',checkSessionBlocked,Ordercontroller.Checkoutpost)

///// Add Addrees in checkout page
router.get('/Orderaddressadd',checkSessionBlocked,Ordercontroller.checkoutaddress)
router.post('/CheckoutPage', checkSessionBlocked, Ordercontroller.addAdress)


//// order render in userprofile
router.get('/UserOrder',checkSessionBlocked,Ordercontroller.OrderRender)

///// cancel
router.get('/cancel/:userid/:productid',Ordercontroller.OrderCancel)



///// placeorder
// router.get('/Placeorder',checkSessionBlocked,Ordercontroller.placeOrder)


module.exports = router;