
const couponCollection=require('../model/admin/Coupon')
const orders=require('../model/admin/order')
const Product = require('../model/admin/Product')

///coupon render
const couponget = async(req, res) => {
    const coupondataa=await couponCollection.find()
    res.render('Coupons',{coupondataa})
}


/// add coupon
const addcouponget = async(req, res) => {
    res.render('addCoupon')
}


/// add coupon post
const addcouponpost = async(req, res) => {
  console.log("couponnnnnnnnnnnnnnnnnn",req.body);
  try{
    const couponData = {
        coupencode:req.body.couponCode,
            discount:req.body.discount,
        expiredate:req.body.expiredate,
            purchaseamount:req.body.purchaseamount,  
}
console.log('dataaaaaaaaaaaaa',couponData);
       
 await couponCollection.insertMany(couponData)
 res.redirect('/Coupons')
}catch(err){
    console.log("Insert failed",err);
    res.redirect('/addCoupon')
}
}


///Delete coupon 
const deleteCoupon=async(req,res)=>{
    try{
        const Couponid=req.params.id;
        await couponCollection.findByIdAndDelete(Couponid);
        res.redirect('/Coupons')
        }catch(error){
            console.error(err);
            return res.status(500).send("Failed to delete Coupon.");
          }
    }



    //// show coupon in user side 
    const ShowCouponUser=async(req,res)=>{
        const showcoupon= await couponCollection.find()
        res.render('userCouponShow',{showcoupon})
    }
    const coupencheck = async (req, res) => {
        try {
            console.log('coupon appled suceessons ')
            let currentDate = new Date();
            const couponcode = req.body.coupencode;
    
            if (req.session.coupon && couponcode.toLowerCase() === req.session.coupencode.toLowerCase()) {
                console.log('inside the lowercase session');
                return res.status(400).json({
                    success: false,
                    message: 'Coupon code has already been applied.',
                });
            }
    
            const coupon = await couponCollection.findOne({ 
                coupencode: { $regex: new RegExp(couponcode, 'i') } });
            console.log(coupon && coupon.expiredate > currentDate)
    
            if (coupon && coupon.expiredate > currentDate && couponcode.toLowerCase() === coupon.coupencode.toLowerCase()) {
                console.log('here if')
                const discountAmount = coupon.discount;
                const amountLimit = coupon.purchaseamount;            
                req.session.coupencode = coupon.coupencode;
    
                return res.json({ success: true, discount: discountAmount, amount: amountLimit });
            } else {
                console.log('inside the expire');
                return res.status(400).json({
                  
                    success: false,
                    message: 'Invalid coupon code or expired.',
                });
            }
        } catch (error) {
            console.error('Error in coupencheck:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error during coupon validation.',
            });
        }
    };

///// remove coupon code in checkout 

const couponremove = async(req,res)=>{
    try {
        const { couponCode } = req.body;

        await orders.updateMany({}, { $set: { Discount: 0, intDiscount: 0 } });

        // Send a success response
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting coupon:', error);
        res.json({ success: false });
    }
};


module.exports = {
        couponget,
        addcouponget,
        addcouponpost,
        deleteCoupon,
        ShowCouponUser,
        coupencheck,
         couponremove,
    }
    