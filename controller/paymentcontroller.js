const express = require('express');
const Razorpay = require('razorpay');
require('dotenv').config(); 


// console.log(instance);
const orderpayment = async (req, res) => {
  try { 
    const { amount } = req.body;
    var instance = new Razorpay({ key_id: process.env.KEY_ID, key_secret: process.env.KEY_SECRET });
    var options = {
        amount: amount * 100, // Convert amount to the smallest currency unit (e.g., paise in INR)
        currency: "INR",
        receipt: "order_rcptid_11",
    };

    // Creating the order
    instance.orders.create(options, function (err, order) {
      if (err) {
        console.error(err);
        res.status(500).send("Error creating order");
        return;
      }
      // console.log("order is",order);``
      // Add orderprice to the response object
      res.send({ orderId: order.id });
      // Replace razorpayOrderId and razorpayPaymentId with actual values
      // Redirect to /orderdata on successful payment
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

// Make sure to replace 'dist/utils/razorpay-utils' with the correct path to your utility functions.


module.exports = {
  orderpayment
}