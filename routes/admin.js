const express = require('express')
const router = express.Router();
const adminController = require('../controller/admincontroller')
const Checksession=require('../middleware/adminMiddleware');
const path = require("path")



///  Admin login (Get,post)    
router.get('/admin_Login', adminController.adminLogin);
router.post('/admin_Login', adminController.loginPost);
//// Dashboard 
router.get('/admin_Dashboard',Checksession,adminController.dashboard);


//                Category Management           //


/////   Category (GET  )
router.get('/Category',Checksession,  adminController.Category);

// Category Management Post - to handle search
router.post('/searchCategory',adminController.searchCategory); 

/////    Add Category   
router.get('/addCategory', adminController.addCategoryGet);
router.post('/addCategory', adminController.addCategory);
////     Edit Category (GET , POST)
router.get('/UpdateCategoryGet/:id', adminController.EditCategoryGet);
router.post('/UpdateCategoryPost/:id', adminController.EditCategoryPost);
////     Delete Category   
router.get("/deleteCategory/:id", adminController.getDeleteCategory);


//              User Management                //

// User Management (GET , POST)
router.get('/userManagement', Checksession, adminController.userManagementGet);
router.post('/userManagement', adminController.userManagementPost);
// Route for handling user search
router.post('/search', adminController.searchUserManagement);

///  block and Unblock in User Management
router.get('/blockuser/:id', Checksession, adminController.block);
router.get('/unblockuser/:id', Checksession, adminController.unblock);


///                Order management                         ///////

///order render
router.get('/adminOrder', Checksession, adminController. Order);
////  updateorder
router.post('/update-status/:orderid/:productid', adminController. updateUserOrder);



/// logout 
router.get('/logout',Checksession, adminController.logout)

//// 
router.get('/adminDashboard', adminController.back)

module.exports = router;
