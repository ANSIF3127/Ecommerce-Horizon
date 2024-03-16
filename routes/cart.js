const express = require('express')
const router = express.Router();
const Cartcontroller=require('../controller/cartController')
const checkSessionBlocked = require('../middleware/UserMiddleware')


/// cart get
router.get('/getCart',checkSessionBlocked,Cartcontroller.Cartget)
/// add to cart 
router.get("/addToCart/:id",checkSessionBlocked,Cartcontroller.addToCart);
// remove cart product
router.get("/removecart/:id",checkSessionBlocked,Cartcontroller. cartremove);

router.post("/updateQuantity/:id",Cartcontroller. updatequantity);



///wishlist
router.get("/wishList",checkSessionBlocked,Cartcontroller.wishList );
/// add to Wishlist 
router.get("/Wishlist/:id",checkSessionBlocked,Cartcontroller.addToWishlist);
///remove wishlist
router.get("/removeFromWishlist/:id",checkSessionBlocked,Cartcontroller.removewishlist);

module.exports = router;    