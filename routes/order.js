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
///// Return    
router.get('/return/:userid/:productid',Ordercontroller.OrderReturn)
////// view
router.get('/view/:productid/:orderid',checkSessionBlocked,Ordercontroller.ViewOrder)



router.get('/Invoice/:orderid',checkSessionBlocked,Ordercontroller.Invoice)



///// placeorder
// router.get('/Placeorder',checkSessionBlocked,Ordercontroller.placeOrder)


module.exports = router;