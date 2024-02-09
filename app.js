const express = require("express");
const path = require("path");
const Swal = require('sweetalert2');//////atert messasge
const session = require('express-session');
const mongoose = require("../project/server")
const app = express();
const port = 3001;
require('dotenv').config();



// Session setup
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true
}));

// Bodyparser setup
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Routes
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/user');
const productRoutes = require('./routes/Product');
const profileRoutes = require('./routes/Profile');

const Orderdetails = require('./routes/order');
const Cartdetails = require('./routes/cart');
app.use('/', adminRoutes);
app.use('/', userRoutes);
app.use('/',productRoutes);
app.use('/',profileRoutes);
app.use('/',Orderdetails);
app.use('/',Cartdetails );
// app.use('/',mongoose);
// View engine setup
app.set("view engine", "ejs");

// Serving static assets
app.use(express.static(path.join(__dirname, 'public')));


// Start server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
