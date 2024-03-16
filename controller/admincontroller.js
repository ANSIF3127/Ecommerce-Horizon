
const Categorymgm =require("../model/admin/Category")
const User=require("../model/admin/User")
const Admin = require('../model/admin/admin')
const Ordercollection = require('../model/admin/order')
const ProducrOffer =require('../model/admin/productOffer')
const BrandOfferCollection=require('../model/admin/BrandOffer')
const addresscollection =require('../model/admin/address')


const { Table } = require('pdfkit-table'); // Import Table from pdfkit-table module
const ExcelJS = require('exceljs')

// const PDFDocument = require('pdfkit');
const PDFDocument  = require('pdfkit-table')
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




      return res.redirect('/admin_Dashboard');
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
// const dashboard=(req,res)=>{
//  if (req.session.admin) {
//   res.render('adminDashboard')
//   }
//   else {
//     res.render('adminLogin')
//   }
// }




// dashboard render
const dashboard = async (req, res) => {

console.log("gergfhdddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddjjjjjjjjjjjjjjjjjjjjjgf");
  if (req.session.admin) {
    try {
      // Daily Orders
      const dailyOrders = await Ordercollection.aggregate([
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$orderDate" } },
            orderCount: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);
      console.log("Daily Orders:", dailyOrders);

      const { dates, orderCounts, totalOrderCount } = dailyOrders.reduce(
        (result, order) => {
          result.dates.push(order._id);
          result.orderCounts.push(order.orderCount);
          result.totalOrderCount += order.orderCount;
          return result;
        },
        { dates: [], orderCounts: [], totalOrderCount: 0 }
      );
      // monthly
      const monthlyOrders = await Ordercollection.aggregate([
        {
          $group: {
            _id: {
              year: { $year: "$orderDate" },
              month: { $month: "$orderDate" },
            },
            orderCount: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]);
      console.log("monthlyData Orders:", monthlyOrders);
      const monthlyData = monthlyOrders.reduce((result, order) => {
        const monthYearString = `${order._id.year}-${String(
          order._id.month
        ).padStart(2, "0")}`;
        result.push({
          month: monthYearString,
          orderCount: order.orderCount,
        });
        return result;
      }, []);
      let monthdata = orderCounts;

      //  Yearly Order
      const yearlyOrders = await Ordercollection.aggregate([
        {
          $group: {
            _id: { $dateToString: { format: "%Y", date: "$orderDate" } },
            orderCount: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);
      console.log("years Orders:", yearlyOrders);
      const { years, orderCounts3, totalOrderCount3 } = yearlyOrders.reduce(
        (result, order) => {
          result.years.push(order._id);
          result.orderCounts3.push(order.orderCount);
          result.totalOrderCount3 += order.orderCount;
          return result;
        },
        { years: [], orderCounts3: [], totalOrderCount3: 0 }
      );


      const topsellingproduct = await Ordercollection.aggregate([
        {
          $unwind: "$productcollection" // Deconstruct the productcollection array
        },
        {
          $group: {
            _id: "$productcollection.productid", // Group by product id
            totalQuantity: { $sum: "$productcollection.quantity" }, // Calculate total quantity sold for each product
            productName: { $first: "$productcollection.productName" } // Retrieve the productName
          }
        },
        {
          $sort: { totalQuantity: -1 } // Sort by total quantity sold in descending order
        },
        {
          $limit: 5 // Limit the result to the top 5 products
        }
      ]);


      const productNames = [];
      const sellingQuantities = [];

      // Iterate over the aggregation result
      topsellingproduct.forEach(product => {
        productNames.push(product.productName); // Push product name to productNames array
        sellingQuantities.push(product.totalQuantity); // Push total quantity to sellingQuantities array
      });



        const topSellingCategories = await Ordercollection.aggregate([
          {
            $unwind: "$productcollection"
          },
          {
            $group: {
              _id: "$productcollection.Category",
              totalQuantity: { $sum: "$productcollection.quantity" }
            }
          },
          {
            $sort: { totalQuantity: -1 }
          },
          {
            $limit: 5
          }
        ]);
        
  console.log("topSellingCategories",topSellingCategories);
  const sellingQuantitiesByCategory = [];
  const categoryBrands = [];


  for (const category of topSellingCategories) {
    const categoryId = category._id;
  
    // Assuming you have a 'brand' field in your Category model
    const categoryInfo = await Categorymgm.findOne({ _id: categoryId });
      console.log("categoryInfo", categoryInfo);
      if (categoryInfo) {
        const brandName = categoryInfo.BrandName;
  
        categoryBrands.push({
          category: brandName,  // Use brandName instead of categoryId
          totalQuantity: category.totalQuantity
        });
    }
  }
   
      

        res.render('adminDashboard',{
          dates,
          orderCounts,
          totalOrderCount,
          monthdata,
          years,
          orderCounts3,
          totalOrderCount3,
          productNames,
          sellingQuantities,
       
          topSellingCategories: categoryBrands ,
      sellingQuantitiesByCategory,
    
    
        
        });
      }
      catch (error) {
        console.error("Error fetching and aggregating orders:", error);
        res.status(500).send("Internal Server Error");
      }
    }

    else {
      res.redirect("/admin_Login");
    }
  }
    

//////////// sales ////////////

// Controller function to generate PDF report
const generateSalesReport = async (req, res) => {
  try {
    const startdate = new Date(req.query.startingdate);
    const Endingdate = new Date(req.query.endingdate);
    Endingdate.setDate(Endingdate.getDate() + 1);

    const orderCursor = await Ordercollection.aggregate([
      {
        $match: {
          orderDate: { $gte: startdate, $lte: Endingdate }
        }
      }
    ]);

    // if (orderCursor.length === 0) {
    //   return res.redirect('/admin/salesreport');
    // }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet 1');

    // Add data to the worksheet
    worksheet.columns = [
      { header: 'Username', key: 'username', width: 15 },
      { header: 'Product Name', key: 'productname', width: 20 },
      { header: 'Quantity', key: 'quantity', width: 15 },
      { header: 'Price', key: 'price', width: 15 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Order Date', key: 'orderdate', width: 18 },
      { header: 'Address', key: 'address', width: 30 },
      { header: 'City', key: 'city', width: 20 },      // Add City column
      { header: 'Pincode', key: 'pincode', width: 15 }, // Add Pincode column
      { header: 'Phone', key: 'phone', width: 15 }      // Add Phone column
    ];

    for (const orderItem of orderCursor) {
    for (const product  of orderItem.productcollection) {
      // Fetch address details based on the address ID
      // const addressDetails = await addresscollection.findById(orderItem.address);
      
      worksheet.addRow({
        'username': orderItem.username,
        'productname': product.productName,
        'quantity': product.quantity,
        'price': product.price,
        'status': product.status,
        'orderdate': orderItem.orderdate,
        'address': orderItem ? orderItem.address.address : 'N/A',
        'city': orderItem ? orderItem.address.city : 'N/A',
        'pincode': orderItem ? orderItem.address.pincode : 'N/A',
        'phone': orderItem ? orderItem.address.phone : 'N/A'
      });
    }
    }

    // Generate the Excel file and send it as a response
    workbook.xlsx.writeBuffer().then((buffer) => {
      const excelBuffer = Buffer.from(buffer);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=excel.xlsx');
      res.send(excelBuffer);
    });
  } catch (error) {
    console.error('Error creating or sending Excel file:', error);
    res.status(500).send('Internal Server Error');
  }
};


  ///// pdf ////////////////////////////
  const pdfreport = async (req, res) => {
    try { 
      const startingDate = new Date(req.query.startingdate);
      const endingDate = new Date(req.query.endingdate);
      console.log("startingDatepdfg", startingDate);
      console.log("endingDatepdf", endingDate);

      // Fetch orders within the specified date range
      const orders = await Ordercollection.find({
        orderDate: { $gte: startingDate, $lte: endingDate }
      })
      
      console.log('orders', orders);

      // Create a PDF document
      const doc = new PDFDocument();
      const filename = "sales_report.pdf";

      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.setHeader("Content-Type", "application/pdf");

      doc.pipe(res);

      // Add content to the PDF document
      doc.text("Sales Report", { align: "center", fontSize: 10, margin: 2 });

      // Define the table data
      const tableData = {
        headers: [
          "Username",
          "Product Name",
          "Price",
          "Quantity",
          "Address",
          "City",
          "Pincode",
          "Phone",
        ],
        rows: orders.map((order, index) => [
          order.address.firstname,
          order.productcollection.map((product) => product.productName).join(", "),
          order.productcollection.map((product) => product.price).join(", "),
          order.productcollection.map((product) => product.quantity).join(", "),
          order.address.address,
          order.address.city, 
          order.address.pincode,
          order.address.phone,
        ]),
      };
    
      // Draw the table
      await doc.table(tableData, {
        prepareHeader: () => doc.font("Helvetica-Bold"),
        prepareRow: () => doc.font("Helvetica"),
      });

      // Finalize the PDF document
      doc.end();
    } catch (error) {
      console.error("Error generating PDF:", error);
      res.status(500).send("Internal Server Error");
    }
  };



///////////////////////////////////////////////////////////////////////////////////////////
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



    if (!brandName) {
      console.log('Category name cannot be empty.');
      const categories = await Categorymgm.find();
      return res.render('addCategory', { categories, message: 'Category name cannot be empty.' });
    } 
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
  const orderdetalist = await Ordercollection.find().sort({ orderDate: -1 });
console.log("orderdetalist",orderdetalist);


res.render("adminOrder", { orderdetalist,});
}catch (err) {
  console.error(err);
  return res.status(500).send("Failed to order page.");
}
}


/////// Update user order 
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
        if (newstatus === 'Delivered') {
          // Update the database to track that the order has been delivered
          await Ordercollection.findOneAndUpdate(
              { _id: orderid },
              { $set: { 'delivered': true } }
          );
      }
        res.redirect('/adminOrder');
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  }
 };

// //// sales 
// const sales= async(req,res)=>{
//   try{
//   const orderdetalist = await Ordercollection.find()
  
//   console.log("orderdetalist",orderdetalist);
  
  
//   res.render("Sales", { orderdetalist});
//   }catch (err) {
//     console.error(err);
//     return res.status(500).send("Failed to order page.");
//   }
//   }

//   //// SalesReportFilter
//   const SalesReportFilter = async (req, res) => {
//     try {
//         const startDate = new Date(req.body.start_date);
//         const endDate = new Date(req.body.end_date);
//         const orderdetalist  = await Ordercollection.find({
            
// orderDate: { $gte: startDate, $lte: endDate }
//         }).sort({ 
//           orderDate: -1 });

//         res.render('Sales', { orderdetalist });
//     } catch (error) {
//         console.log(error);
//         // Handle the error appropriately
//         res.status(500).send("Internal Server Error");
//     }
// };


 
////// product Offer render
const poductOffer = async (req, res) => {
  try {
    const newproductOffer = await ProducrOffer.find({});
    const brandOffers = await BrandOfferCollection.find({ category: { $exists: true } });
    res.render('productOffer', { newproductOffer,brandOffers}); // Pass the data to the view
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};
/// add product Offer 
const addProductOffer = async(req,res)=>{
  try{
    res.render('addProductOffer')
  }catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
}
}

/////// add product offer post 
const productOfferpost = async (req,res)=>{

const productOffer={
  productname:req.body.productName,
  price:req.body.productPrice,
  offer:req.body.offerPercentage,
}
console.log("yyyyyyyyyyyyyyyyyyyyyyyyy",productOffer);
  try{
const newproductOffer = await ProducrOffer.create(productOffer)
console.log("gdfhgsdhfgvsdghzfgc",newproductOffer);
res.redirect('/productOffer'); 
  }catch (err) {
    console.log("Insert failed", err);
    res.redirect('/addProductOffer');
  }
}


//// productOffer Delete
const DeleteProductOffer = async(req,res)=>{
  try{
    const productOfferid=req.params.id;
    console.log('productOfferid',productOfferid);
    await ProducrOffer.findByIdAndDelete(productOfferid);
    res.redirect('/productOffer')
  }catch(error){
      console.error(err);
      return res.status(500).send("Failed to delete Coupon.");
    }
}


///// category offer 
const addBrandOffer = async(req,res)=>{
  try{
    res.render('addBrandOffer')
  }catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
}
}

/// add Brand Offer post
const addBrandOfferpost=async(req,res)=>{

  const BrandOffer={
    category:req.body.category,
    alloffer:req.body.alloffer,
  }
  try{
    const newBrandOffer = await BrandOfferCollection.create(BrandOffer)
    console.log("gdfhgsdhfgvsdghzfgc",newBrandOffer);
    res.redirect('/productOffer'); 
      }catch (err) {
        console.log("Insert failed", err);
        res.redirect('/addBrandOffer');
      }
    }

//// productOffer Delete
const DeleteBrandOffer = async(req,res)=>{
  try{
    const BrandOfferid=req.params.id;
    console.log('productOfferid',BrandOfferid);
    await BrandOfferCollection.findByIdAndDelete(BrandOfferid);
    res.redirect('/productOffer')
  }catch(error){
      console.error(err);
      return res.status(500).send("Failed to delete Coupon.");
    }
}




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
    pdfreport,
    generateSalesReport ,
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
   
    

    poductOffer,
    addProductOffer,
    productOfferpost,
    DeleteProductOffer,

    addBrandOffer,
    addBrandOfferpost,
    DeleteBrandOffer,
    

    
   logout,

}    
