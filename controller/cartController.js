
const Carts= require('../model/admin/cart')
const Product = require('../model/admin/Product')
const Categorymgm =require("../model/admin/Category");
const users = require('../model/admin/User');








//// CART GET
const Cartget=async(req,res)=>{
    try {
      
      const userId =  req.session.userid;
      // console.log("ji",userId);
      const cartfind = await Carts.find({ userid: userId});
   // Calculate  total sum  all cart items
   let overallTotalSum = 0;
   cartfind.forEach((cartItem) => {
     const itemTotal = cartItem.price * cartItem.quantity;
     overallTotalSum += itemTotal;
   });
   const Categorie = await Categorymgm.find( ); 
console.log("efyhsgyhf",cartfind);
      res.render("Cart", { cartfind, overallTotalSum,Categorie});
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
} 

///// add to cart
const addToCart = async (req, res) => {
  try {
      const productid = req.params.id;
      const userId = req.session.userid;
      console.log("postuserid:",productid );
// Check  product exists
      const product = await Product.findOne({_id:productid});
      console.log('pr are',product);
      if (!product) {
          return res.status(404).send('Product not found');
      }
  // Check user exists
      const username = await users.findById(userId);
      if (!username) {
          return res.status(404).send('User not found');
      }
    
      const cartItem = await Carts.findOne({ userid: userId, productid: productid });
      if (cartItem) {
       
        await Carts.updateOne({ userid: userId, productid: productid },{ $inc:{ quantity: 1 } });
      } else {  
        console.log('pr are',product);
       
          const cartData = {
              userid: req.session.userid,
              username: username.Username,
              productid: productid,
              productname: product.ProductName,
              price: product.Price,
              quantity: 1,
              image: product.image[0]
          };
          await Carts.create(cartData);
        //   console.log("dsfs"+cartData);
        console.log("cart",cartData);
        } 
       
      
        
          res.redirect('/Home');
      }catch (error) {
        console.error(error);
        res.status(500).send(`Internal Server Error: ${error.message}`);
 } 
}

 ///Cart items remove
 const cartremove = async(req,res)=>{
try{
    const cartitemsid = req.params.id;
    
    await Carts.findByIdAndDelete(cartitemsid);
    res.redirect('/getCart')
} catch (error) {
console.log(error);
res.status(500).send('Internal Server Error');
}
 };


//// quantity
const updatequantity = async (req, res) => {
  const { index, action } = req.body;

  try {
    const cartItem = await Carts.findOne({  });

    if (!cartItem) {
      return res.status(404).json({ error: 'CartItem not found' });
    }

    
    if (action === 'increase') {
      cartItem.quantity += 1;
    } else if (action === 'decrease' && cartItem.quantity > 1) {
      //  quantity doesn't  below 1
      cartItem.quantity -= 1;
    }

   
    const itemTotal = cartItem.price * cartItem.quantity;

    // Save update cartItem
    await cartItem.save();

    return res.status(200).json({ success: true, updatedCartItem: { ...cartItem.toObject(), itemTotal } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};






 module.exports={
    Cartget,
    addToCart,
    cartremove,
    updatequantity,
}
