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
router.post('/forgotOtp', usercontroller.forgotemailpost);
//otp
router.get('/forgotOtp', usercontroller.forgototp);
router.post('/resendOtps', usercontroller.resendOtps);
router.post('/forgotpassword', usercontroller.forgotOtpPost);
//password
router.get('/forgotpassword', usercontroller.forgotpassword);

// Add a route for updating the password
router.post('/updatePassword', usercontroller.updatePassword);



//// home page
 router.get('/User_Login',checkSessionBlocked, usercontroller.getHome);

// product get
router.get('/Home',checkSessionBlocked,usercontroller.getProducts);
// home => productid productview
router.get('/product/:id',checkSessionBlocked, usercontroller.getProductView);


///product list
router.get('/ProductList',checkSessionBlocked,usercontroller.productlist);

///// wallet history
router.get('/WalletHistory', checkSessionBlocked, usercontroller. Wallethistory);


  
module.exports = router;
