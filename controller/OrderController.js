const Ordercollection = require('../model/admin/order')
const Carts = require('../model/admin/cart')
const addressCollection = require('../model/admin/address')
const Categorymgm = require("../model/admin/Category")
const User = require('../model/admin/User')
const Product = require('../model/admin/Product')
const mongoose = require('mongoose');




///checkout page
const Checkout = async (req, res) => {
    try {
        const userId = req.session.userid;


        const checkout = await Carts.find({ userid: userId });
        const address = await addressCollection.find({ userid: userId });
        const Categorie = await Categorymgm.find({}); 
        res.render('CheckoutPage', { checkout, address,Categorie});
    } catch (error) {
        console.log(error);
        res.status(500).send('Error in product details');
    }
};


//// checkout page post 
const Checkoutpost = async (req, res) => {
    try {
        const currentdate = new Date()
        const addresss = req.body.shippingOption;
        const paymentMethod = req.body.paymentMethod;
        
        const userId = req.session.userid;

     const adressdata=   await addressCollection.findById({_id:addresss});

        const carts = await Carts.find({ userid: userId });

        const orderData = [];

        for (const cart of carts) {
            orderData.push({  
                username: cart.username,
                productid: cart.productid,
                productName: cart.productname,
                Category: cart.category,
                price: cart.price,
                quantity: cart.quantity,
                status: "pending"
            });
       

            const stringId =  cart.productid .toString();

        // Decrease stock for the placed order
      const x =   await Product.findOneAndUpdate(
            { '_id':stringId},
            { $inc: { 'Stock': -cart.quantity } }
        );

        
    }

        
        // const currentDate = new Date();
        const orderItem = {
            userid: userId,
           
            productcollection: orderData,
            address: {
                firstname:adressdata.firstname,
                lastname:adressdata.lastname,
                address: adressdata.address,
                city:adressdata.city,
                pincode:adressdata.pincode,
                phone:adressdata.phone,
            },
            orderDate: currentdate, 
            paymentMethod: paymentMethod, 
        };
        
        
        await Ordercollection.create(orderItem);
        // console.log("order sucess",orderItem);

       
        await Carts.deleteMany({ userid: userId });
        res.render('Placeorder');
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
        const orders = await Ordercollection.find({ userid: userid });
        const Categorie = await Categorymgm.find();

        res.render('UserOrder', { Categorie,orders });
    } catch (error) {
        console.log(error);
        res.status(500).send("Error rendering user orders");
    }
};

const OrderCancel = async(req,res)=>{
    try {
        const userid = req.params.userid;
        const productid = req.params.productid;
        const selectedstatus = 'Cancelled';  
console.log("orderrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr",productid);
       // Update  status in database
       
       await Ordercollection.findOneAndUpdate(
        { 'userid': userid, 'productcollection._id': productid },
        { $set: { 'productcollection.$.status': selectedstatus } }
    );
   
       // Increase stock for the canceled order
    //    const objectId = new mongoose.Types.ObjectId(productid);

    //    console.log("new objectis is ",objectId);


    const x =   await Product.findOneAndUpdate(
        { productid},
        { $inc: { Stock: 1 } }
    );

    console.log("sdfasdfasfasdf",x);  


        res.redirect('/UserOrder');
    } catch (error) {
        console.log(error);
        res.status(500).send("Error updating order status");
    }
};


module.exports = {
    Checkout,
    checkoutaddress,
    addAdress,
    OrderRender,
    OrderCancel,
 
    Checkoutpost,
}