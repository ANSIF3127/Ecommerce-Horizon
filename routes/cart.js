const express = require('express')
const router = express.Router();
const Cartcontroller=require('../controller/cartController')
const checkSessionBlocked = require('../middleware/UserMiddleware')


/// cart get
router.get('/getCart',checkSessionBlocked,Cartcontroller.Cartget)
/// add to cart post
router.get("/addToCart/:id",checkSessionBlocked,Cartcontroller.addToCart);
// remove cart product
router.get("/removecart/:id",checkSessionBlocked,Cartcontroller. cartremove);

router.post('/updateQuantity',Cartcontroller. updatequantity);

module.exports = router;