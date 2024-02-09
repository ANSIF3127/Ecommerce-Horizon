
const Categorymgm =require("../model/admin/Category")
const User=require("../model/admin/User")
const Admin = require('../model/admin/admin')
const Ordercollection = require('../model/admin/order')

// adminLogin get
const adminLogin=async(req,res)=>{
  try{
    const userdatas =await Admin.find();
    console.log(req.body);
    res.render("adminLogin",{userdatas,message:""})
  }catch(err){
    console.error(err);
       
  } 
}


/// login post
const loginPost = async (req, res) => {
  const { email, password } = req.body;
  console.log(req.body);

  // Backend validations
  if (!email || !password) {
    return res.render("adminLogin", { message: "Email and password are required", emailError: "", passwordError: "" });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.render("adminLogin", { message: "Invalid email format", emailError: "Invalid email format", passwordError: "" });
  }

  // Validate password length
  if (password.length < 4) {
    return res.render("adminLogin", { message: "Password must be at least 4 characters long", emailError: "", passwordError: "Password must be at least 4 characters long" });
  }

  try {
    const admin = await Admin.findOne({ email });

    // If an admin with the given email is found
    if (admin && password === admin.password) {
      console.log("Login successful");
      req.session.admin = admin.email;
      return res.render('adminDashboard');
    } else {
      console.log("Invalid password or admin not found");
      return res.render("adminLogin", { message: "Invalid email or password. Please retry", emailError: "", passwordError: "" });
    }

  } catch (error) {
    console.error("Error during login:", error);
    return res.render("adminLogin", { message: "Internal Server Error", emailError: "", passwordError: "" });
  }
};

//Dashboard
const dashboard=(req,res)=>{
 if (req.session.admin) {
  res.render('adminDashboard')
  }
  else {
    res.render('adminLogin')
  }
}


  

/// Category Management Get
const Category = async(req,res)=>{
  try {
    const categories = await Categorymgm.find();
    res.render('Category', { categories });
  } catch (err) {
    console.error(err);
   
    res.status(500).send('Internal Server Error');
  }
};

 /// Add Category  Get 
 const addCategoryGet = async (req, res) => {
  try {
     const categories = await Categorymgm.find();
     res.render('addCategory', { categories, message: "" });
  } catch (error) {
     console.log(error);
     res.status(500).send('Server Error');
  }
 };

/////////////// add category post /
const addCategory = async (req, res) => {
  const brandName = req.body.BrandName.toLowerCase();
 
  try {
     // Check category already exists 
     const existingCategory = await Categorymgm.findOne({
       BrandName: { $regex: new RegExp('^' + brandName + '$', 'i') },
     });
 
     if (existingCategory) {
       console.log('Category already exists.');
       const categories = await Categorymgm.find();
       return res.render('addCategory', { categories, message: 'Category already exists.' });
     }
 
  
     const newCategory = await Categorymgm.create({ BrandName: brandName });
     console.log('Inserted successfully');
 
     res.redirect('/Category'); 
  } catch (err) {
     console.log('Insert failed', err);
     res.status(500).send('Failed to add category.');
  }
 };
   
// Category Management Post - to handle search
const   searchCategory= async (req, res) => {
  try {
    const searchTerm = req.params.searchTerm;
    // Search categories 
    const foundCategories = await Categorymgm.find({ BrandName: { $regex: searchTerm, $options: 'i' } });

    res.json({ categories: foundCategories }); 
  } catch (err) {
    console.log('Search failed', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};




///  Edit ,Update category   get   
const EditCategoryGet = async(req,res)=>{
   try {
      const id = req.params.id;
      const category = await Categorymgm.findOne({ _id: id });
      res.render("UpdateCategory", { category: category });
    } catch (err) {
      console.error(err);
      return res.status(500).send("Failed to display the category edit page.");
    }
} 

////  Edit ,Update category   post  
const  EditCategoryPost = async(req,res)=>{
    const id = req.params.id;
    const categoryname = req.body.categoryName;
    try {
      await Categorymgm.updateOne(
        { _id: id },
        { $set: {BrandName : categoryname } }
      );
    } catch (err) {
      console.error(err);
      return res.status(500).send("Failed to edit category.");
    }
    res.redirect("/Category");

}
///// Delete category 
 const getDeleteCategory= async (req, res) => {
    try {
      const categoryId = req.params.id;
      await Categorymgm.findByIdAndDelete(categoryId);
      res.redirect("/Category");
    } catch (err) {
      console.error(err);
      return res.status(500).send("Failed to delete category.");
    }
    
  } 

 
  

/// User Management Get
  const userManagementGet=async(req,res)=>{
    try{
      const Userlist = await User.find();
      res.render("userManagement",{Userlist});
    } catch (err){
      console.error(err);
      return res.status(500).send("Failed to fetch Userlist. Please try again.");

    }
  }
//// User Management Post   
  const userManagementPost=async (req,res)=>{
    console.log(req.body);
    const userdata={

      Username:req.body.username,
      email:req.body.email,
      Password:req.body.Password,
      isListed:true
                
    }
  
    await User.insertMany([userdata])
    
    .then(()=>{
   
        console.log('inserted sucessfull');
        res.render("userManagement")
   }).catch((err)=>{
        console.log("inserted failed",err)
    })
    res.redirect('/userManagement')
 }

 // userManagement Post - to handle search
 const searchUserManagement = async (req, res) => {
  const searchTerm = req.body.searchTerm;

  try {
    const Userlist = await User.find({ Username: searchTerm });
    const categories = Userlist;

    res.render("Category", { categories }); 
  } catch (err) {
    console.error(err);
    res.render("ErrorPage");
  }
};

//admin can block the user
const block = async (req, res) => {
  try {
    const userId = req.params.id; 
    console.log("user", userId);

    const user = await User.findById(userId);

    if (!user) {
      console.log("User not found");
      return res.status(404).send("User not found.");
    }

    user.isblocked = !user.isblocked;
    await user.save(); // Change User.save() to user.save()

    console.log("Blocked/Unblocked");
    res.redirect("/userManagement");
  } catch (err) {
    console.error(err);
    return res.status(500).send("Failed to block/unblock user.");
  }
};

// adminController.unblock
const unblock = async (req, res) => {
  try {
    const userId = req.params.id;
    console.log("user", userId);

    const user = await User.findById(userId);

    if (!user) {
      console.log("User not found");
      return res.status(404).send("User not found.");
    }

    user.isblocked = false;
    await user.save();

    console.log("Unblocked");
    res.redirect("/userManagement");
  } catch (err) {
    console.error(err);
    return res.status(500).send("Failed to unblock user.");
  }
};





//// order
const Order= async(req,res)=>{
try{
const orderdetalist = await Ordercollection.find()
console.log("orderdetalist",orderdetalist);

res.render("adminOrder", { orderdetalist,});
}catch (err) {
  console.error(err);
  return res.status(500).send("Failed to order page.");
}
}


///////
const updateUserOrder = async (req, res) => {
  const orderid = req.params.productid;
  const productid = req.params.orderid;
  const newstatus = req.body.status;


  try {



    const order = await Ordercollection.findOneAndUpdate(
      { _id: orderid, 'productcollection._id': productid },
      { $set: { 'productcollection.$.status': newstatus } },
      { new: true }
  );

    if (!order) {
        return res.status(404).send("Order or product not found");
    }

    console.log("Updated Product Collection for Order ID:", order._id);
        console.log(order.productcollection);
        console.log("-----------------------------");

        res.redirect('/adminOrder');
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  }
 };


//// admin logout
const logout =(req,res)=>{
  req.session.destroy().then(x=>{res.redirect('/admin_Login')})
  
}
const  back=(req,res)=>{
  res.render('adminDashboard')
}


module.exports={
    adminLogin,
    loginPost,
    dashboard,
    back,

    Category,
    addCategory,
    searchCategory,
    addCategoryGet,
    EditCategoryGet,
    EditCategoryPost,
   getDeleteCategory,
  //  updateCategoryPost,
   
   userManagementPost,
   searchUserManagement,
   block,
   unblock,
   userManagementGet,

    Order,
    updateUserOrder,


    
   logout,

}    
