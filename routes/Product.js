const express = require('express')
const router = express.Router();
const ProductController=require('../controller/productController')
const multer = require('multer')
const path = require("path")
const Checksession=require('../middleware/adminMiddleware');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
})
const upload = multer({ storage: storage }).array('image');




///  Product Management (Get) 
router.get('/ProductManagement',Checksession,  ProductController.productManagement);
////  productManagementSearch
router.get('/productManagement',ProductController. productManagementSearch);
///  Add Product Get ,post
router.get('/addProduct',Checksession, ProductController.addProductGet);
router.post('/addProduct', upload, ProductController.addProduct);

///   EDIT  Product Management (Get , POST)  
router.get('/update/:id', ProductController.updateGet);
router.post('/update/:id', upload, ProductController.updatePost);
///   Delete  Product Management  
router.get("/deleteproductmgm/:id", ProductController.getDeleteProductManagement);
///  Unlisted in  Product Management 
router.get("/unlistproduct/:id", ProductController.getUnlistProduct);
//// listed product management 
router.get('/listproduct/:id', ProductController.listProduct);




module.exports = router