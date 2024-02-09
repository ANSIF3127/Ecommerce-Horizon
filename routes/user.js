const express = require('express')
const router = express.Router();
const usercontroller = require('../controller/usercontroller')
const checkSessionBlocked=require('../middleware/UserMiddleware');

//guesthome
router.get('/',usercontroller.guestHome);

//login get
router.get('/UserLogin', usercontroller.getLogin);

// login post
router.post('/UserLogin', usercontroller.LoginPost);

// Signup get
router.get('/User_Signup', usercontroller.Signup)
//signup post
router.post('/User_Signup', usercontroller.signupPost);

/// otp get
router.get('/otp', usercontroller.otpGet);
///  otp post
 router.post('/otp', usercontroller.otpPost);
 //// resend otp
 router.get('/resend-otp', usercontroller.resendOtp);

/// forgot password
router.get('/forgotemail', usercontroller.forgotemail);
router.post('/forgotpassword', usercontroller.forgotemailpost);

//// forgot otp get , post
router.get('/forgotOtp', usercontroller.forgototp);

//// password get
router.get('/forgotpassword', usercontroller.forgotpassword);

//// home page
 router.get('/User_Login',checkSessionBlocked, usercontroller.getHome);

// product get
router.get('/Home',checkSessionBlocked,usercontroller.getProducts);
// home => productid productview
router.get('/product/:id',checkSessionBlocked, usercontroller.getProductView);


///product list
router.get('/ProductList',checkSessionBlocked,usercontroller.productlist);



  
module.exports = router;
