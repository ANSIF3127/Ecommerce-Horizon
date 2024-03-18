const User = require('../model/admin/User')
const nodemailer = require('nodemailer')
const crypto = require('crypto');
const Product = require('../model/admin/Product')
const Wallet = require('../model/admin/Wallet')
const Categorymgm =require("../model/admin/Category")
const ProductOffer =require('../model/admin/productOffer')
const ordercollection = require('../model/admin/order')
const BrandOffer=require('../model/admin/BrandOffer');
const { log } = require('console');


//Guest page
const guestHome = (req, res) => {
  res.render('guestHome')
}
 
///login get
const getLogin = async (req, res) => {
  try {
    if (req.session.user) {
      res.redirect("/Home");
    } else {
      res.render("User_Login");
    }
  } catch (error) {
    console.log(error);
  }
}





// LOGIN POST
const LoginPost = async (req, res) => {
  const { email, password } = req.body;
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordPattern = /^.{1,}$/;

  try {
    // Perform your validation logic here
    if (!emailPattern.test(email) || !passwordPattern.test(password)) {
      return res.render("User_Login", { message: "Email and password should be valid!" });
    }

    const user = await User.findOne({ email: email, Password: password });

    if (user !== null) {
      if (password === user.Password || email === user.email) {
        if (!user.isblocked) {
          
          // Generate and store referral code if not present
          
          //  session here
          req.session.useremail = user.email;
          req.session.userid = user._id;
          req.session.Otp = user.otp;
          console.log('userid:' + req.session.userid);
          return res.redirect("/Home");
        } else {
          return res.render("User_Login", { message: "This account is blocked!" });
        }
      } else {
        return res.render("User_Login", { message: "Incorrect password!" });
      }
    } else {
      // If user is not found, you might want to create a new user here
      // For now, just send a message indicating that a new user has been created
      return res.render("User_Login", { message: "User not found, but a new user has been created!" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error in login.' });
  }
};


//signup get,render
const Signup = (req, res) => {
  if (req.session.user) {
    res.redirect('/UserLogin')
  }
  else {
    res.render('User_Signup')
  }
}


// Function to generate a referral code
const generateReferralCode = (length) => {
  const characters = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let referralCode = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    referralCode += characters[randomIndex];
  }

  return referralCode;
};

let signupuser;
let email;

let referral;
let referredUser;
let referred = "false";

// signup post
const signupPost = async (req, res) => {
  console.log(req.body);
  email = req.body.email;

  // Check if email already exists
  const emailExists = await User.findOne({ email });
  if (emailExists) {
    return res.render('User_Signup', { emailExistsError: true });
  }

  // Retrieve password from request body
  const password = req.body.password;

  // Password strength validation
  if (password.length < 4) {
    return res.render('User_Signup', { strongPasswordError: true });
  }

  const referralCode = generateReferralCode(8); // Change the length as needed
  console.log("referralCode",referralCode);

  if (req.body.referralcode) {
    referral = req.body.referralcode;
    referredUser = await User.findOne({ referralcode: referral });
// console.log("referredUserssssssssss",referredUser);
// console.log("referralllllllllll",referral)

    if (referredUser) {
      referred = "true";
    } else {
      return res.status(400).json({ success: false, message: 'Referral code not found' });
    }
  }

  signupuser = new User({
    Username: req.body.username,
    email: req.body.email,
    Password: password,
    isListed: true,
    referralcode: referralCode,
    wallet: referredUser ? 50 : 0,
  });

  req.session.Otp = generateRandomString(6);
  const otp = req.session.Otp;
  await sendOtpEmail(req.body.email, otp);
  res.redirect('/otp');
};

////genetrate otp
const generateRandomString = (length) => {
  const digits = "0123456789";
  let OTP = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, digits.length);
    OTP += digits[randomIndex];
  }

  return OTP;
};

/// otp send to email
const sendOtpEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_NAME, //  email address
      pass: process.env.EMAIL_PASS
    }
  });
  const mailOptions = {
    from: '',
    to: email,
    subject: 'One-Time Password (OTP) for Authentication',
    text: `Your Authentication OTP is: ${otp}`
  };


  transporter.sendMail(mailOptions, async (error, info) => {
    if (error) {
      return console.error('Error:', error);
    }
    console.log('Email sent:', info.response);
  });
};

////resend otp
const resendOtp = async (req, res) => {
  req.session.Otp  = generateRandomString(6);
  const otp =req.session.Otp;
    await sendOtpEmail(email, otp);
    res.redirect('/otp')
    // Send a success status
};




// otp get
const otpGet = (req,res)=>{
  const enteredOtp = req.body.otp; // Replace with your actual property

  res.render('otp', { enteredOtp });
}
  


//otp post
const otpPost = async (req, res) => {
  console.log(req.body);
  const enteredOtp = req.body.otp;
  const otp = req.session.Otp;
  console.log("entered", enteredOtp);
  console.log('otp', otp);

  try {
    if (otp === enteredOtp) {

      if (referred === "true") {
        
        await User.updateOne({ referralcode: referral }, { $inc: { wallet: 100 } });
        console.log('Wallet updated');
      }

      // Save the new user to the database
      await signupuser.save();

      res.render('otp', { enteredOtp, otp, signupSuccess: true });
    } else {
      const errorMessage = 'Invalid OTP. Please try again.';
      res.render('otp', { enteredOtp, otp, errorMessage });
    }
  } catch (error) {
    console.error('Error during OTP verification and user registration:', error);
    res.render('Error_Page', { errorMessage: 'Error during OTP verification and user registration' });
  }
};



////////////// forget password email //////////////////// 
const forgotemail=async(req,res)=>{
  res.render('forgotemail',{ error: null, email: null })
}

////  forgotemailpost email 
const forgotemailpost= async (req, res) => {
  const userEmail = req.body.email;
  req.session.email = userEmail

  console.log("hhhhhhhhhhhhhhhhhhhhhhhhh",req.session.email);


  try {
      const user = await User.findOne({ email: userEmail });

      if (user) {
        req.session.Otp  = generateRandomStrings(6);
        const otp =req.session.Otp;
          await sendOtpEmails(req.body.email, otp);
          res.redirect('/forgotOtp');
      } else {
        res.render('forgotemail', {
          error: 'User with this email does not exist',
          email: userEmail,
        });
      }
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  };
////genetrate otp
const generateRandomStrings = (length) => {
  const digits = "0123456789";
  let OTP = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, digits.length);
    OTP += digits[randomIndex];
  }

  return OTP;
};

/// otp send to email
const sendOtpEmails = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_NAME, //  email address
      pass: process.env.EMAIL_PASS
    }
  });
  const mailOptions = {
    from: '',
    to: email,
    subject: 'One-Time Password (OTP) for Authentication',
    text: `Your Authentication OTP is: ${otp}`
  };


  transporter.sendMail(mailOptions, async (error, info) => {
    if (error) {
      return console.error('Error:', error);
    }
    console.log('Email sent:', info.response);
  });
};

////resend otp
const resendOtps = async (req, res) => {
  req.session.Otp  = generateRandomStrings(6);
  const otp =req.session.Otp;
  const userEmail = req.body.email;  
  await sendOtpEmails(userEmail, otp);
    res.redirect('/forgotOtp')
    // Send a success status
};




///// forgot otp
const forgototp = async(req,res)=>{
  const enteredOtps = req.body.otp;
  res.render('forgotOtp',{ enteredOtps })
}
/////// forgototp post
const forgotOtpPost = async(req,res)=>{
  const enteredOtps =  req.body.otp;
const otp = req.session.Otp  
console.log("ebteredddddddddddddddddd",enteredOtps);
console.log('otpppppppppppppppppppppp',otp)
  if (otp === enteredOtps) {

       res.redirect('/forgotpassword');
 
  } else { 
    const errorMessage = 'Invalid OTP. Please try again.';
    res.render('forgotOtp', { enteredOtps, otp, errorMessage });
  }
};

////// forgot password get
const forgotpassword=async(req,res)=>{
  res.render('forgotpassword', { errors: {} })
}




//// update password
const updatePassword = async (req, res) => {
  const userEmail = req.session.email;
  const newPassword = req.body.newPassword;
  const confirmPassword = req.body.confirmPassword;

  // Validation checks
  const errors = {};

  // Null and whitespace validation
  if (!newPassword || !confirmPassword || newPassword.trim() === '' || confirmPassword.trim() === '') {
      errors.newPassword = 'Password cannot be empty';
      errors.confirmPassword = 'Confirm Password cannot be empty';
  }

  // Strong password validation (you can customize this based on your requirements)
  const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/;
  if (!passwordRegex.test(newPassword)) {
      errors.newPassword = 'Password must be at least 8 characters long and include at least one digit, one lowercase letter, one uppercase letter, and one special character.';
  }

  // Check if passwords match
  if (newPassword !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
  }

  try {
      if (Object.keys(errors).length === 0) {
          const userdetails = await User.findOne({ email: userEmail });

          if (userdetails) {
              // Update the user's password
              userdetails.Password = newPassword;
              await userdetails.save();

              res.redirect('/UserLogin');
          } else {
              res.render('forgotpassword', { errors: { newPassword: 'User not found' } });
          }
      } else {
          res.render('forgotpassword', { errors });
      }
  } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
  }
};



  //home get
  const  getHome=(req,res)=>{
    const userId = req.session.userid;
      // console.log("homeuserid:"+userId)
    res.render('/User_Login')
  }


//  home page 
  const getProducts = async (req, res) => {
    try {
        const products = await Product.find({isListed:true})
        const Categorie = await Categorymgm.find({}); 
        res.render('Home', { products ,Categorie});
        // console.log(products);
    } catch (error) {
        console.log(error);

    }
 };
 //////////////////////////////////////////////////////////////

 // home post
 const getProductView = async (req, res) => {
  try {
    const productId = req.params.id;
    console.log("productId", productId);
   // Fetch all categories
   const Categorie = await Categorymgm.find({});
 // Fetch product details
 const productView = await Product.findById(productId).populate('Category');

   

    // Fetch product offer details based on product name
    const productOffer = await ProductOffer.findOne({ productname: productView.ProductName });
    console.log("productOffer", productOffer);



     // Ensure productView has a category before attempting to fetch brand offer
     if (!productView.Category) {
      throw new Error('Product does not have a category');
    }
       // Fetch brand offer details based on brand name (case-insensitive)
       const brandOffer = await BrandOffer.findOne({
        category: { $regex: new RegExp(productView.Category.BrandName, 'i') }
      });
console.log("brandOffer", brandOffer);
    // Calculate discount details
    let discountInfo = null;
    if (productOffer) {
      discountInfo = {
        percentage: productOffer.offer,
        discountAmount: (productOffer.offer / 100) * productView.Price,
        newPrice: productView.Price - ((productOffer.offer / 100) * productView.Price),
      };
    }


    // Check if brandOffer is not null before using its properties
    let brandDiscountInfo = null;
    if (brandOffer) {
      brandDiscountInfo = {
        percentage: brandOffer.alloffer,
        discountAmount: (brandOffer.alloffer / 100) * productView.Price,
        newPrice: productView.Price - ((brandOffer.alloffer / 100) * productView.Price),
      };
    }


 

     res.render('ProductView', { productView, Categorie, discountInfo, brandDiscountInfo  });
  } catch (error) {
    console.log(error);
    res.status(500).send('Error in product details');
  }
};





const productlist = async (req, res) => {
  try {
      const page = parseInt(req.query.page) || 1;
      const limit = 3;
      const skip = (page - 1) * limit;

      // Retrieve filters from the request query
      const selectedCategory = req.query.category;
      const minPrice = parseFloat(req.query.minPrice) || 0;
      const maxPrice = parseFloat(req.query.maxPrice) || Number.MAX_SAFE_INTEGER;
      const sortOrder = req.query.sortOrder || 'asc';
      const searchQuery = req.query.search || '';
      // Define the filter object based on the selected category and price range
      const filter = { isListed: true, Price: { $gte: minPrice, $lte: maxPrice } };
      if (selectedCategory) {
          // If a category is selected, add it to the filter
          filter.category = selectedCategory;
      }

      // Use the filter in the find method
      const products = await Product.find(filter).sort({ Price: sortOrder }).skip(skip).limit(limit).populate('Category');
     
      const totalProducts = await Product.countDocuments(filter);
      const totalPages = Math.ceil(totalProducts / limit);
      const currentPage = Math.min(page, totalPages);

      // Fetch categories and sort them alphabetically
      const Categorie = await Categorymgm.find().sort({ BrandName: 1 });

      res.render('ProductList', { products, Categorie,currentPage, totalPages });
  } catch (error) {
      console.error("Error fetching products and categories:", error);
      res.status(500).send("Internal Server Error");
  }
};
        

///// WalletHistory 
const Wallethistory = async (req, res) => {
 const userid= req.session.userid
 
  try {
    const Categorie = await Categorymgm.find({}); 
    const walletHistory = await Wallet.find({ userid: userid });
      
      // console.log('orders',orders);
      res.render('WalletHistory', {Categorie,walletHistory});
  } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, message: "Error fetching wallet history" });
  }
};

module.exports = {
 
  guestHome,
  getLogin,
  signupPost,
  Signup,
  resendOtp,
  LoginPost,
  otpGet,
  otpPost,
  forgotemail,
  forgotemailpost,
  forgotpassword,
  forgototp,
  resendOtps,
  forgotOtpPost,
  updatePassword,

  getProducts,
  
  getProductView,
  getHome,
  productlist,
  Wallethistory,
  
};








