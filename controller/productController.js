
const Product = require('../model/admin/Product')
const Categorymgm =require("../model/admin/Category")
const cart = require('../model/admin/cart')
////product Managment get 
const productManagement=async(req,res)=>{
  try {
    const data = await Product.find().populate('Category');
    res.render('ProductManagement', { data });
  } catch (error) {
    console.log(error);
    res.status(500).send('Internal Server Error');
  }
};


//  Add Product  GET
const addProductGet= async(req,res)=>{
  try{
    const Categories = await Categorymgm.find(); 
    // console.log("Categoriesss:", Categories);
    res.render("addProduct", { Category: Categories, message: " " })
  } catch (error){
    console.log(error);
  }
}

////   ADD PRODUCT Post
const addProduct = async (req, res) => {
console.log(req.body,"shfshdfhs");

  console.log(req.body.Category);
  const productData = {
    ProductName: req.body.ProductName,
    Category: req.body.Category,
    Price: req.body.Price,
    Stock: req.body.Stock,
    Rating: req.body.Rating,
    Description: req.body.Description,
    isListed: true,
    image: req.files.map(file => file.path.substring(6))
  };

  try {
    const Category = await Categorymgm.find()

 
    // Check if a product with the same name already exists
    const existingProduct = await Product.findOne({ ProductName: req.body.ProductName });
    if (existingProduct) {
      console.log('Product already exists.');
      return res.render('addProduct',{
        Category,
        message: 'Product already exists.',
      });
    }
    
    // Save the new product to the database
    const newProduct = await Product.create(productData);
    await newProduct.populate('Category').populate('Category');

    // Redirect to the ProductManagement page after successful product addition
    res.redirect('/ProductManagement');
  } catch (err) {
    console.log("Insert failed", err);
    res.redirect('/ProductManagement');
  }
};



///// Edit  get  
const updateGet =async (req,res)=>{
    try {
        const product = await Product.findOne({ _id: req.params.id }).populate('Category');
        const categories = await Categorymgm.find({});

        // console.log("Categories:", categories);
        console.log(req.body)

        res.render("editProductManagement", { product, categories });
      } catch (err) {
        console.error(err);
        return res.status(500).send("Failed to get product edit page.");
      }
  }

  /////// Edit  post 
 
const updatePost = async (req, res) => {
  try {
    const productId = req.params.id;
    const updatedProduct = {
      ProductName: req.body.ProductName,
      Category: req.body.Category,
      Price: req.body.Price,
      Stock: req.body.Stock,
      Rating: req.body.Rating,
      Description: req.body.Description,
      // image: req.files.map(file => file.path.substring(6))
    };

    // Update the product
    const updatedProductResult = await Product.findByIdAndUpdate(productId, updatedProduct, { new: true });
    
    if (!updatedProductResult) {
      console.log("Product not found");
      res.status(404).send("Product not found");
      return;
    }

    // Update the cart related to the updated product
    const updatedCart = await cart.findOneAndUpdate({ productid: productId }, {
      productname: updatedProductResult.ProductName,
      Category: updatedProductResult.Category,
      price: updatedProductResult.Price,
      // You can update other cart fields here if needed
      // image: updatedProductResult.image
    }, { new: true });

    if (!updatedCart) {
      console.log("Cart not found for the updated product");
      // Handle the situation where the cart for the updated product is not found
    }

    // Handle image update if needed
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => file.path.substring(6));
      updatedProductResult.image = updatedProductResult.image.concat(newImages);
      await updatedProductResult.save();
    }

    console.log("Updated Product:", updatedProductResult);
    console.log("Updated Cart:", updatedCart);
    res.redirect("/ProductManagement");
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};
//// Delete product management 
const getDeleteProductManagement= async (req, res) => {
    try {
     
      const productmgmId = req.params.id;
      await Product.findByIdAndDelete(productmgmId);
      res.redirect("/ProductManagement");
    } catch (err) {
      console.error(err);
      return res.status(500).send("Failed to delete category.");
    }
  }


  
  ///// unlisted in product management 
  const getUnlistProduct= async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);
  
      if (!product) {
        return res.status(404).send("Product not found");
      }
      // Set the product as unlisted
      product.isListed = false;
      // Save the updated product
      await product.save();
      // Redirect to the appropriate route after updating
      res.redirect("/ProductManagement");
    } catch (err) {
      console.error(err);
      res.status(500).send("Error unlisting product");
    }
  };
  
///// listed  in product management 

const listProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).send("Product not found");
    }
    product.isListed = true;
    await product.save();
    res.redirect("/ProductManagement");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error listing product");
  }
};

/////  productManagementSearch 
const productManagementSearch = async (req, res) => {
  let query = {};
  const { productName } = req.query; 
  if (productName) {
      query = { ProductName: { $regex: new RegExp(productName, 'i') } };
  }
  try {
      const data = await Product.find(query);
      res.render('ProductManagement', { data });
  } catch (err) {
     
      res.status(500).send('Error fetching products');
  }
};

const deleteimg = async (req, res) => {
  console.log('enterr');
  const productId = req.body.productId;
  const imageIndex = req.body.imageIndex;
  try {
    console.log("HOY");
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).send('Product not found');
    }
    if (imageIndex < 0 || imageIndex >= product.image.length) {
      return res.status(400).send('Invalid image index');
    }
    product.image.splice(imageIndex, 1);
    await product.save();
    res.status(200).send('Image removed successfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
} 




module.exports={
    productManagement,
    addProduct,
    productManagementSearch,
    addProductGet,
    updateGet,
    updatePost,
    getDeleteProductManagement,
    getUnlistProduct,
    listProduct,
    deleteimg,
}
