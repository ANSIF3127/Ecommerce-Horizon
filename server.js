const mongoose = require('mongoose');
require('dotenv').config();
// Mongoose connection
mongoose.connect(process.env.MONGOSTR)
  .then(() => {
    console.log("MongoDB is connected successfully");
  })
  .catch((err) => {
    console.log('MongoDB connection error:', err);
  });
