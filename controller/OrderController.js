const { ObjectId } = require('mongodb');
const Ordercollection = require('../model/admin/order')
const Carts = require('../model/admin/cart')
const addressCollection = require('../model/admin/address')
const Categorymgm = require("../model/admin/Category")
const User = require('../model/admin/User')
const Product = require('../model/admin/Product')
const mongoose = require('mongoose');
const Wallet = require('../model/admin/Wallet')
const couponCollection = require('../model/admin/Coupon')
const PDFDocument = require("pdfkit");



///checkout page
const Checkout = async (req, res) => {
    try {
        const userId = req.session.userid;

        const checkout = await Carts.find({ userid: userId });

        let totalsum = 0;
        checkout.forEach((items) => {
            const totalitems = items.price * items.quantity;
            totalsum += totalitems;
        })

        const address = await addressCollection.find({ userid: userId });
        const Categorie = await Categorymgm.find({});
        const coupons = await couponCollection.find()


        
        res.render('CheckoutPage', { checkout, address, Categorie, coupons, totalsum });
    } catch (error) {
        console.log(error);
        res.status(500).send('Error in product details');
    }
};


//// checkout page post 
const Checkoutpost = async (req, res) => {
    try {
        console.log("eeeeeeeeeeeee", req.body);
        const currentdate = new Date()
        const addresss = req.body.shippingOption;
        const paymentMethod = req.body.paymentMethod;

        const userId = req.session.userid;

        const adressdata = await addressCollection.findById({ _id: addresss });

        const carts = await Carts.find({ userid: userId });
      
        const orderData = [];
        let totalsum = 0; 
        for (const cart of carts) {
            orderData.push({
                username: cart.username,
                productid: cart.productid,
                productName: cart.productname,
                Category:cart.Category,
                price: cart.price,
                quantity: cart.quantity,
                status: "pending"
            });

console.log("orderData",orderData);
            const stringId = cart.productid.toString();

            // Decrease stock for the placed order
            const x = await Product.findOneAndUpdate(
                { '_id': stringId },
                { $inc: { 'Stock': -cart.quantity } }
            );
// Calculate the total sum for the order
totalsum += cart.price * cart.quantity;
}
        const couponcode = req.body.coupencode;
        let discount = 0;
        const coupon = await couponCollection.findOne({ coupencode: couponcode });

        if (coupon) {
            console.log('coupon id ', coupon._id);
            discount = coupon.discount;
            console.log("Discount: ", discount);
        } else {
            console.log('Coupon not found');
            // handle the case when the coupon is not found
        }

        const intDiscount = discount / orderData.length;
        console.log("Discount: ", discount);

        if (totalsum > 1000 && paymentMethod === "Cash on Delivery") {
            // If Cash on Delivery is selected and the total is over 1000, show an error message
            return res.status(400).json({ error: 'Cash on Delivery not available for orders over 1000 rupees. Please choose a different payment method.' });
        }
        const orderItem = {

            userid: userId,

            productcollection: orderData,
            address: {
                firstname: adressdata.firstname,
                lastname: adressdata.lastname,
                address: adressdata.address,
                city: adressdata.city,
                pincode: adressdata.pincode,
                phone: adressdata.phone,
            },
            orderDate: currentdate,
            paymentMethod: paymentMethod,
            totalPrice: orderData.reduce((total, item) => total + (item.price * item.quantity), 0),
            Discount: discount,
            intDiscount: intDiscount,
        };


        await Ordercollection.create(orderItem);
        console.log("ooooooooooooooooooooooooooooooooooooooooo", orderItem);
        console.log(req.body, 'wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww');


        await Carts.deleteMany({ userid: userId });
         // If the total is over 1000 and the payment method is "Cash on Delivery", render a page for changing payment method
         if (totalsum > 1000 && paymentMethod === "Cash on Delivery") {
            return res.render('ChangePaymentMethod', { orderId: orderItem._id });
        } else {
            // Otherwise, proceed with the normal Placeorder rendering
            return res.render('Placeorder');
        }
        
        // res.status(200).json({ message: 'Order placed successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


//// Add Address get 
const checkoutaddress = async (req, res) => {
    const orderaddress = await addressCollection.find()
    res.render('Orderaddressadd', { orderaddress })
    // console.log("orderaddress",orderaddress )
}

//// add address post 
const addAdress = async (req, res) => {
    try {
        const userAddress = {
            userid: req.session.userid,
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            address: req.body.address,
            city: req.body.city,
            state: req.body.state,
            pincode: req.body.pincode,
            phone: req.body.phone,

        }
        console.log('Orderaddressadd', userAddress);
        await addressCollection.insertMany([userAddress])
            .then(x => {
                res.redirect('/CheckoutPage')
            })
    } catch (error) {
        console.log(error);
    }
}


const OrderRender = async (req, res) => {
    try {
        const userid = req.session.userid;
        const orders = await Ordercollection.find({ userid: userid }).sort({ orderDate: -1 });
        const Categorie = await Categorymgm.find();
console.log("orders",orders);
        res.render('UserOrder', { Categorie, orders });
    } catch (error) {
        console.log(error);
        res.status(500).send("Error rendering user orders");
    }
};
/////// Order Cancel////
const OrderCancel = async (req, res) => {
    try {
        console.log("lkdgldjgljdkjgkjklj",req.query.reason);
        const userid = req.params.userid;
        const productid = req.params.productid;
        const selectedstatus = 'Cancelled';
        console.log("dsgdgdhgdfdf", productid);


        // Retrieve order details
        const order = await Ordercollection.findOne(
            { 'userid': userid, 'productcollection._id': productid },
            { 'productcollection.$': 1, 'paymentMethod': 1, 'intDiscount': 1 }
        );
        if (!order) {
            return res.status(404).send("Order not found");
        }
        let dis = order.intDiscount;
        const proId = order.productcollection[0].productid;

        console.log("proid is", proId);
        console.log("order", order);
        console.log("discount", dis);

        // Extract necessary details from the order
        const { price, quantity } = order.productcollection[0];
        console.log("QUAn0", quantity);
        // Update order status to 'Cancelled'
        await Ordercollection.findOneAndUpdate(
            { 'userid': userid, 'productcollection._id': productid },
            { $set: { 'productcollection.$.status': selectedstatus } }
        );
        // Add stock back to the Product database
        const desc = await Product.findOneAndUpdate(
            { _id: proId },
            { $inc: { Stock: quantity } }
        );
        console.log("helloworld", desc);


        if (order.paymentMethod === 'credit-card') {
            console.log("inside");
            const cancellationRefundAmount = price * quantity - dis;
            await User.findOneAndUpdate(
                { _id: userid },
                { $inc: { wallet: cancellationRefundAmount } }
            );
            await Wallet.create({
                userid,
                date: new Date(),
                amount: cancellationRefundAmount,
                creditordebit: 'debit',
              });
            }



        res.json({ success: true });
    } catch (error) {
        console.log(error);
        res.status(500).send("Error updating order status");
    }
};

//////// Order Return
const OrderReturn = async (req, res) => {
    try {
        const userid = req.params.userid;
        const productid = req.params.productid;
        const selectedstatus = 'Returned';
        const reason = req.query.reason;
        console.log("rrrrrrrrrrrrrrrrrrrrrrrrr",req.query.reason);
        // Retrieve order details
        const order = await Ordercollection.findOne(
            { 'userid': userid, 'productcollection._id': productid },
            { 'productcollection.$': 1, 'paymentMethod': 1, 'intDiscount': 1 }
        );

        if (!order) {
            return res.status(404).send("Order not found");
        }

        let disc = order.intDiscount;
        const proIds = order.productcollection[0].productid;
        console.log("proid is", proIds);
        console.log("order", order);
        console.log("discount", disc);
        // Extract necessary details from the order
        const { price, quantity } = order.productcollection[0];
        console.log("QUAn0", quantity);
        // Update order status to 'Cancelled'
        await Ordercollection.findOneAndUpdate(
            { 'userid': userid, 'productcollection._id': productid },
            { $set: { 'productcollection.$.status': selectedstatus } }
        );
        // Add stock back to the Product database
        const desc = await Product.findOneAndUpdate(
            { _id: proIds },
            { $inc: { Stock: quantity } }
        );
        console.log("helloworld", desc);


        if (order.paymentMethod == 'credit-card') {
            console.log("inside");
            const totalAmount = price * quantity - disc;
            await User.findOneAndUpdate(
                { _id: userid },
                { $inc: { wallet: totalAmount } }
            );
            await Wallet.create({
                userid,
                date: new Date(),
                amount: totalAmount,
                creditordebit: 'debit',
              });
        } else {
            console.log("order cancelled");
        }
        res.json({ success: true, message: `Order returned successfully with reason: ${reason}` });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Error returning order" });
    }
};

//// view order 
const ViewOrder = async (req, res) => {
    try {

        const userId = req.session.userid;
        const orderId = req.params.orderid;
        const productid = req.params.productid;
        console.log("userId", userId);
        console.log("orderId", orderId);
        console.log("productid", productid);

        // Fetch product details (assuming you have a product ID, adjust as needed)
        const product = await Product.findById(productid);
        console.log("product", product);
        // Fetch address details
        const address = await addressCollection.findOne({ userid: userId });
        console.log("address", address);
        // Fetch order details using your Order model
        const order = await Ordercollection.findById(orderId);
        console.log("order", order);

        res.render('ViewOrder', { product, address, order, productid });
    } catch (error) {
        console.log(error);

        res.status(500).send("Error view order status");
    }
};

const Invoice = async (req, res) => {
    try {
        let userId = req.session.userid;
        console.log(userId);
        const orderId = req.params.orderid;
        console.log("Entered", orderId);

        const invoiceDetails = await User.findOne({ _id: userId });
        console.log("Invoice", invoiceDetails);

        const specificOrder = await Ordercollection.findById(orderId)
        console.log("Invoiceu", specificOrder);




        // Create a new PDF document
        const doc = new PDFDocument();

        // Set response headers to trigger a download
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", 'attachment; filename="invoice.pdf"');
        // Pipe the PDF document to the response
        doc.pipe(res);
        console.log("hello ask1")
        // const imagePath = "public/img/logo.png"; // Change this to the path of your image
        // const imageWidth = 100; // Adjust image width based on your layout
        // const imageX = 550 - imageWidth; // Adjust X-coordinate based on your layout
        // const imageY = 50; // Adjust Y-coordinate to place the image at the top
        // doc.image(imagePath, imageX, imageY, { width: imageWidth });

        // Move to the next section after the image
        doc.moveDown(1);
        // Add content to the PDF document
        doc.fontSize(16).text("Billing Details", { align: "center" });
        doc.moveDown(1.2);
        doc.fontSize(10).text("Customer Details", { align: "center" });
        doc.moveDown(1);
        doc.text(`Order ID: ${orderId}`);

        doc.moveDown(0.3);
        doc.text(`Name: ${invoiceDetails.Username || ""}`);
        doc.moveDown(0.3);
        doc.text(`Email: ${invoiceDetails.email || ""}`);

        console.log("hello ask6")

        doc.moveDown(0.3);
        const address = specificOrder.address;
        doc.text(
            `Address: ${address.address}, ${address.city}, ${address.state} ${address.pincode || ""
            }`
        );
        doc.moveDown(0.3);
        doc.text(`Payment Method: ${specificOrder.paymentMethod || ""}`);
        console.log("hello ask2")
        doc.moveDown(0.3);
        console.log("In");
        const headerY = 300; // Adjust this value based on your layout
        doc.font("Helvetica-Bold");
        doc.text("Name", 100, headerY, { width: 150, lineGap: 5 });
        doc.text("Status", 300, headerY, { width: 150, lineGap: 5 });
        doc.text("Quantity", 400, headerY, { width: 50, lineGap: 5 });
        doc.text("Price", 500, headerY, { width: 50, lineGap: 5 });
        doc.font("Helvetica");

        // Table rows
        const contentStartY = headerY + 30; // Adjust this value based on your layout
        let currentY = contentStartY;
        specificOrder.productcollection.forEach((product, index) => {
            doc.text(product.productName || "", 100, currentY, {
                width: 150,
                lineGap: 5,
            });

            doc.text(product.status || "", 300, currentY, {
                width: 50,
                lineGap: 5,
            });
            doc.text(product.quantity || "", 400, currentY, {
                width: 50,
                lineGap: 5,
            });

            doc.text(product.price || "", 500, currentY, {
                width: 50,
                lineGap: 5,
            });
            console.log("Reached Here");

            // Calculate the height of the current row and add some padding
            const lineHeight = Math.max(
                doc.heightOfString(product.productName || "", { width: 150 }),
                doc.heightOfString(product.status || "", { width: 150 }),

                doc.heightOfString(product.price || "", { width: 50 })
            );
            currentY += lineHeight + 10; // Adjust this value based on your layout
        });
        console.log("Reached Here2");
        doc.text(`Total Price: ${specificOrder.totalPrice || ""}`, {
            width: 400, // Adjust the width based on your layout
            lineGap: 5,
        });

        // Set the y-coordinate for the "Thank you" section
        const separation = 50; // Adjust this value based on your layout
        const thankYouStartY = currentY + separation; // Update this line

        // Move to the next section
        doc.y = thankYouStartY; // Change this line

        // Move the text content in the x-axis
        const textX = 60;
        const textWidth = 500;
        doc.fontSize(14).text(
            "Thank you for choosing horizon mobile! We appreciate your support and are excited to have you as part of our family.",
            textX,
            doc.y,
            { align: "center", width: textWidth, lineGap: 10 }
        );

        doc.end();
    } catch (error) {
        res.render("error");
    }
};





module.exports = {
    Checkout,
    checkoutaddress,
    addAdress,
    OrderRender,
    OrderCancel,
    OrderReturn,
    ViewOrder,
    Checkoutpost,
    Invoice,
}