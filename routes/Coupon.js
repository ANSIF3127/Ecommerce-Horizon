const express = require('express')
const router = express.Router();
const CouponControllers=require('../controller/CouponController');
const Checksession=require('../middleware/adminMiddleware');
const path = require("path")

/// coupon render
router.get('/Coupons',CouponControllers.couponget);


////addcoupon 
router.get('/addCoupon',CouponControllers.addcouponget)
router.post('/Coupons',CouponControllers.addcouponpost)
/// delete coupon
router.get('/deletecoupon/:id',CouponControllers.deleteCoupon)



/// usercouponshow
router.get('/userCouponShow',CouponControllers.ShowCouponUser)


//// remove coupon in the checkout page
router.post('/deleteCoupon', CouponControllers.couponremove);








/// 
router.post('/coupencheck',CouponControllers.coupencheck)

module.exports = router;