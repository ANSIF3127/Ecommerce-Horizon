const User = require('../model/admin/User')
const nodemailer = require('nodemailer')
const crypto = require('crypto');
const Product = require('../model/admin/Product')

const Categorymgm =require("../model/admin/Category")





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
///LOGIN POST
const LoginPost = async (req, res) => {
 
  const { email, password } = req.body;
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordPattern = /^.{1,}$/;

  try {
    // Perform your validation logic here
    if (!emailPattern.test(email) || !passwordPattern.test(password)) {
      res.render("User_Login",{message:"Email and password should be valid!"})
    } else {
      const user = await User.findOne({ email: email, Password: password });
      if (user !== null) {
        if (password === user.Password || email === user.email) {
          if (!user.isblocked) {
            //  session here
            req.session.useremail = user.email;
            req.session.userid =user._id;
            req.session.Otp=user.otp;
            console.log('userid:' + req.session.userid);
            res.redirect("/Home");
          } else {
            res.render("User_Login",{message:"This account is blocked!"})
          }
        } else {
          res.render("User_Login",{message:"Incorrect password!"})
          
        }
      } else {
        res.render("User_Login",{message:"User not found!"})
      }
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error in login.' });
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




let signupuser
let email
/// signup post
const signupPost = async (req, res) => {
  console.log(req.body)
    ////////////////////
  email=req.body.email
   signupuser = {
    Username: req.body.username,
    email: req.body.email,
    Password: req.body.password,
      isListed:true
  };

  req.session.Otp  = generateRandomString(6);
  const otp =req.session.Otp;
    await sendOtpEmail(req.body.email, otp);
  res.redirect('/otp')//redirect otp
}




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
  const enteredOtp =  req.body.otp;
const otp = req.session.Otp  
console.log("ebteredddddddddddddddddd",enteredOtp);
console.log('otpppppppppppppppppppppp',otp)
  if (otp === enteredOtp) {

   
    await User.insertMany([signupuser]);
    res.redirect('/UserLogin');
 
  } else { 
    const errorMessage = 'Invalid OTP. Please try again.';
    res.render('otp', { enteredOtp, otp, errorMessage });
  }
};




////////////// forget password email //////////////////// 
const forgotemail=async(req,res)=>{
  res.render('forgotemail')
}

////  forgotemailpost email 
const forgotemailpost= async (req, res) => {
  const userEmail = req.body.email;

  try {
      const user = await User.findOne({ email: userEmail });

      if (user) {
        req.session.Otp  = generateRandomStrings(6);
        const otp =req.session.Otp;
          await sendOtpEmails(req.body.email, otp);
          res.redirect('/forgotpassword');
      } else {
          res.render('forgotemail', { error: 'User with this email does not exist' });
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
  req.session.Otp  = generateRandomString(6);
  const otp =req.session.Otp;
    await sendOtpEmail(email, otp);
    res.redirect('/forgotOtp')
    // Send a success status
};


////// forgot password get
const forgotpassword=async(req,res)=>{
  res.render('forgotpassword')
}

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

   
    await User.insertMany([signupuser]);
    res.redirect('/forgotpassword');
 
  } else { 
    const errorMessage = 'Invalid OTP. Please try again.';
    res.render('otp', { enteredOtps, otp, errorMessage });
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
 

 // home post
 const getProductView = async (req, res) => {
  try {
    const productId = req.params.id;
    // console.log(productId);
    const Categorie = await Categorymgm.find({}); 
    const productView = await Product.findById(productId);
    //  console.log(productView)
    res.render('ProductView', { productView ,Categorie});

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

      res.render('ProductList', { products, Categorie, currentPage, totalPages });
  } catch (error) {
      console.error("Error fetching products and categories:", error);
      res.status(500).send("Internal Server Error");
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

  getProducts,
  
  getProductView,
  getHome,
  productlist,

  
};








