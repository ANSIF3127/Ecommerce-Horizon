const usercontroller = require('./usercontroller'); // Adjust the path as needed
const users = require('../models/users')
const product = require('../models/products')
const cart = require('../models/cart')
const offercontroller = require('../models/productoffer')
const categorycollection=require('../models/category')
const wishlistcollection=require('../models/wishlist')
const { render } = require('ejs');
const express = require('express');
const { use } = require('../routes/admin');
const router = express.Router();
const server = require('../server')
const session = require('express-session');
const nodemailer = require('nodemailer')
const crypto = require('crypto');
const { raw } = require('body-parser');

//ecart wothout acc
const homePage = (req, res) => {
  res.redirect('/Ecart', 302)
}
const ecarthome = async (req, res) => {
  try {
    if (req.session.user) {
      res.redirect('/userhome', 302);
    } else {
      // Assuming 'product' is a model representing your database table
      const datas = await product.find({ isList: true }).sort({ _id: -1 }) // Use 'isList' with a lowercase 'L'
      // Print the data only if isList is true
      // console.log(datas);
      res.render('Ecarthome', { datas });
    }
  } catch (error) {
    console.log(error);
  }
}
//user login
const loginPage = async (req, res) => {
  try {
    if (req.session.user) {
      res.redirect('/userhome', 302)
    }
    else {
      res.render('userlogin')
    }
  } catch (error) {
    console.log(error);
  }
}
//login post request
const loginpost = async (req, res) => {
  function isEmailValid(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  }
  try {
    const data = await users.findOne({ email: req.body.email });
    if (isEmailValid(req.body.email)) {
      if (!data.isblocked == true) {
        if (req.body.email === data.email && req.body.password === data.password) {
          req.session.user = data.email;
          req.session.userid = data._id;
          console.log('id of the user is ' + req.session.userid);
          res.status(200).json({ success: true, redirect: '/userhome', message: 'Login successful' });
        } else {
          res.status(400).json({ success: false, message: 'Invalid User' });
        }
      } else {
        res.status(400).json({ success: false, message: 'Blocked Account' });
      }
    } else {
      res.status(400).json({ success: false, message: 'Enter the proper email' });
    }
  } catch (error) {
    console.log('error while post:', error);
    res.status(500).json({ success: false, message: 'Unathorized Entry' });
  }
};


//signup render
const signup = (req, res) => {
  if (req.session.user) {
    res.redirect('/userlogin', 302)
  }
  else {
    res.render('usersignup')
  }

}


//resendotp
let email
let otpvalue
const resend = async (req, res) => {
  if (signupdata && signupdata.email) {
    const otp = generateRandomString(6);
    await sendOtpEmail(email, otp)
    otpvalue = otp
    res.redirect('/otp')
  }
};

let signupdata; // Consider moving these variables inside the function scope.
let wallet;
let referral;
let referredUser 
let referred="false"
// signup post request
const signuppost = async (req, res) => {
  try {
    console.log('Enter the post');
    console.log(req.body);

    if (!isEmailValid(req.body.email)) {
      res.status(400).json({ success: false, message: 'Email not valid' });
    } else {
      const referralCode = generateReferralCode(7); // Generate a 7-character referral code
      console.log(referralCode);

      email = req.body.email;

      // Check if referral code is provided
      if (req.body.Referral) {
        referral = req.body.Referral;
        referredUser = await users.findOne({ referralcode: referral });
        console.log('referel user is', referredUser);
        if (referredUser) {
          // Update the referred user's wallet with Rs. 100
          // wallet = referredUser.wallet + 100;
        referred="true"
          console.log('Temporary 100 added to wallet:', wallet)
        } else {
          return res.status(400).json({ success: false, message: 'Referral code not found' });
        }
      }

      // Set wallet value based on referral
      signupdata = {
        username: req.body.uname,
        email: email,
        password: req.body.pswd,
        isblocked: false,
        referralcode: referralCode,
        wallet: referredUser ? 50 : 0, // New user gets Rs. 50 if a referral code is provided
      };

      const existingUser = await users.findOne({ email: req.body.email });

      if (!existingUser) {
        const otp = generateRandomString(6);
        await sendOtpEmail(req.body.email, otp);
        otpvalue = otp;
        console.log(otp);
        res.status(200).json({ success: true, redirect: '/otp' });
      } else {
        res.status(400).json({ success: false, message: 'Email already exists' });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};


const generateReferralCode = (length) => {
  const characters = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let referralCode = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    referralCode += characters[randomIndex];
  }
  return referralCode;
};

// Function to validate email format
function isEmailValid(email) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
}


//otp sent to the email
const sendOtpEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_ADDRESS, //  email address
      pass: process.env.EMAIL_PASSWORD
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
const generateRandomString = (length) => {
  const digits = "0123456789";
  let OTP = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, digits.length);
    OTP += digits[randomIndex];
  }

  return OTP;
};

//otp pafe render
const otp = (req, res) => {
  if (req.session.user) {
    res.redirect('/userHome')

  } else {
    setTimeout(() => {
      otpvalue = ""
    }, 60000);
    res.render('otp')
  }
}
//otp post request
const otppost = async (req, res) => {
  try {
    const digit = req.body.otp;
    const otpnumber = digit;
    console.log("Number is " + otpnumber);

    if (otpvalue === otpnumber) {
      const newUser = new users(signupdata);
      await newUser.save();
      if(referred=="true"){
        await users.updateOne({ referralcode: referral },{$inc:{wallet:100}})
        .then(x=>{
          console.log('updated',x);
        })
      }

      res.status(200).json({ success: true, redirect: '/userlogin' });
    } else {
      res.status(400).json({ success: false, message: "Invalid entry" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}
//user home
const userHome = async (req, res) => {
    try {
      const userId = req.session.userid;
      const datas = await product.find({
        isList: true,
        Stock: { $gt: 1 },
      });
      const wishlistItems = await wishlistcollection.find({ userid: req.session.userid });
      const wishlistProductIds = wishlistItems.map((item) => item.productid);
      // console.log('daat',datas);
      const wishlistProducts = await product.find({
        _id: { $in: wishlistProductIds },
      }).select('Productname');

      const cartfound = await cart.find({ userid: req.session.userid })
      const cartcount = cartfound.length;
      // console.log('wihslist pr',wishlistProducts);
      res.render("userhome", { datas, userId, wishlistProducts,cartcount });
    } catch (err) {
      console.error(err);
      return res.status(500).send("Internal Server Error");
      }
}

//product detials redeer
const seeproductget = async (req, res) => {
  try {
    const id = req.params.id;
    let data = await product.findById(id)
    res.render('details', { data });
  } catch (error) {
    console.log(error);
  }
};
//product detials with accout user
const seeproductgetwithacc = async (req, res) => {
  try {
    const id = req.params.id;
    let data = await product.findById(id);

    // Assuming you have a model named Offer
    const offer = await offercontroller.findOne({ productname: data.Productname });

    if (offer) {
      // Calculate the new price based on the offer percentage
      const offerPercentage = offer.offer || 0;
      const discountAmount = (offerPercentage / 100) * parseFloat(data.Price);
      const newPrice = parseFloat(data.Price) - discountAmount;

      // Round the discountAmount and newPrice to 2 decimal places
      const roundedDiscountAmount = parseFloat(discountAmount.toFixed(2));
      const roundedNewPrice = parseFloat(newPrice.toFixed(2));

      data.offer = parseInt(roundedNewPrice);
      data.save();

      // Update the data object wi th calculated values
      data.offer = {
        percentage: offerPercentage,
        discountAmount: isNaN(roundedDiscountAmount) ? 0 : roundedDiscountAmount,
        newPrice: isNaN(roundedNewPrice) ? parseFloat(data.Price) : roundedNewPrice,
      };
    } else {
      // If there is no offer, set default values
      data.offer = { percentage: 0, discountAmount: 0, newPrice: parseFloat(data.Price) };
    }

    res.render('productdetails', { data });
  } catch (error) {
    console.log(error);
    // Handle the error appropriately, e.g., send an error response or render an error page
    res.status(500).send('Internal Server Error');
  }
};




//category list render
const categorylist = async (req, res) => {
  try {
    console.log('enter the list');

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = 3; // Set the number of products per page
    const skip = (page - 1) * limit;

    // Fetch products with pagination
    const data = await product.find({ isList: true, Stock: { $gt: 1 } })
      .populate('Category')
      .skip(skip)
      .limit(limit);

    // Calculate total number of products
    const totalProducts = await product.countDocuments({ isList: true });

    // Calculate total number of pages
    const totalPages = Math.ceil(totalProducts / limit);

    // Adjust current page if it exceeds total pages
    const currentPage = Math.min(page, totalPages);

    res.render('shop', { data, currentPage, totalPages });
  } catch (error) {
    console.log(error);
  }
};


//forgor pass
const mailpage = (req, res) => {
  res.render('emailpage')
}
let emaill
let newotp
const mailpagepost = async (req, res) => {
  // console.log('enter ');
  const mail = req.body.email
  const existingmail = await users.findOne({ email: mail })
  if (existingmail) {
    console.log('same email');
    const otp = generateRandomString(6);
    // Change 6 to the desired length of OTP
    emaill = existingmail.email
    req.session.mail = emaill
    console.log(otp);
    // console.log(email);
    await sendOtpEmail(emaill, otp)
    newotp = otp
    // console.log('otp is ', req.session.newotp);
    console.log('otp sented');

    res.redirect('/otpcheck')
  } else {
    res.render('emailpage', { message: "The Registered Email is Not Found" })
  }
}
const mailotp = (req, res) => {
  setTimeout(() => {
    newotp = ""
  }, 60000);
  res.render('mailotp')
}

const mailotppost = (req, res) => {
  const otpvalue = req.body.otp;
  if (newotp == otpvalue) {
    res.json({ success: true, redirect: '/newpassword' });
  } else {
    res.json({ success: false, message: 'Wrong OTP' });
  }
};

const resendotp = async (req, res) => {
  const otp = generateRandomString(6);
  // Change 6 to the desired length of OTP
  await sendOtpEmail(req.session.mail, otp)
  newotp = otp
  // 10000 milliseconds (10 seconds)
  res.redirect('/otpcheck')
}

const newpassword = (req, res) => {
  const message = req.query.message
  res.render('newpasspage', { message })
}
const newpasswordpost = async (req, res) => {
  email = req.session.mail
  console.log('passs ');
  console.log('hjh', email);
  const newpassword1 = req.body.newpass1
  const newpassword2 = req.body.newpass2
  if (newpassword1 === newpassword2) {
    const user = await users.updateOne({ email: email }, { $set: { password: newpassword2 } })
      .then(x => {
        console.log('updated ', x);
        res.redirect('/userlogin')
      })
  }
  else {
    console.log('wont match');
    // res.redirect('/newpassword/?message=Please enter the same password')
    res.render('newpasspage', { message: "Please enter the same password" })
  }

}


const search=async(req,res)=>{
  try {
    const searchQuery = req.query.search;
    let productFilter = {};
    let categoryFilter = {};

    if (searchQuery) {
      const regexPattern = new RegExp(searchQuery, "i");

      // Find products matching the query
      productFilter = { Productname: { $regex: regexPattern } };

      // Find categories matching the query
      categoryFilter = { Category: { $regex: regexPattern } };
    }

    const matchingProducts = await product.find(productFilter).populate(
      "Category"
    );
    const matchingCategories = await categorycollection.find(categoryFilter);
    const response = {
      products: matchingProducts,
      categories: matchingCategories,
    };

    res.json(response);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Error while searaching." });
    }
}

//exports the all controller
module.exports = {
  homePage,
  loginPage,
  ecarthome,
  signup,
  signuppost,
  loginpost,
  userHome,
  otp,
  otppost,
  resend,
  seeproductget,
  seeproductgetwithacc,
  categorylist,
  mailpage,
  mailpagepost,
  mailotp,
  mailotppost,
  newpassword,
  newpasswordpost,
  resendotp,
  search
};
