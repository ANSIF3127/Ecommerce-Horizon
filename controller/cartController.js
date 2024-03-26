
const Carts= require('../model/admin/cart')
const Product = require('../model/admin/Product')
const Categorymgm =require("../model/admin/Category");
const User = require('../model/admin/User');
const WishList=require('../model/admin/wishList')







//// CART GET
const Cartget=async(req,res)=>{
    try {
      
      const userId =  req.session.userid;
      const cartfind = await Carts.find({ userid: userId});

          // Check stock for each item in the cart
          for (const cartItem of cartfind) {
            const product = await Product.findOne({ _id: cartItem.productid });
      
        
  // Check if any item in the cart is out of stock
  let isOutOfStock = false;
  for (const cartItem of cartfind) {
      const product = await Product.findOne({ _id: cartItem.productid });
      if (!product || product.Stock < 1) {
          isOutOfStock = true;
          break;
      }
  }

     
    }
   // Calculate  total sum  all cart items
   let overallTotalSum = 0;
   cartfind.forEach((cartItem) => {
     const itemTotal = cartItem.price * cartItem.quantity;
     overallTotalSum += itemTotal;
   });
   const Categorie = await Categorymgm.find( ); 
      res.render("Cart", { cartfind, overallTotalSum,Categorie});
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
} 

const addToCart = async (req, res) => {
  try {
    const productid = req.params.id;
    const userId = req.session.userid;
    
    // product existence
    const product =await Product.findOne({ _id: productid });
    if (!product) {
      return res.status(404).send('Product not found');
    }

    //  user existence
    const username = await User.findById(userId);
    if (!username) {
      return res.status(404).send('User not found');
    }

    //  product is already in the cart
    const cartItem = await Carts.findOne({ userid: userId, productid: productid });
    if (cartItem) {
      await Carts.updateOne({ userid: userId, productid: productid }, { $inc: { quantity: 1 } });
    } else {
      // Add  product to cart
      const cartData = {
        userid: req.session.userid,
        username: username.Username,
        productid: productid,
        productname: product.ProductName,
        Category:product.Category,
        price: product.Price,
        quantity: 1,
        image: product.image[0],
      };
      await Carts.create(cartData);
console.log("cartData",cartData);
      // Remove the product from the wishlist
      await WishList.findOneAndDelete({ userid: userId, productid: productid });
    }

    res.redirect('/Home');
  } catch (error) {
    console.error(error);
    res.status(500).send(`Internal Server Error: ${error.message}`);
  }
};



//// quantity
const updatequantity = async (req, res) => {

  console.log("entered udpdate quantity");
  // const productId =req.params.id;
 
  const { productid, index, action } = req.body;

  console.log(req.body);

console.log("kjsfhlkasjfhl", productid);


  try {

    const cartItem = await Carts.findById(productid)
 // Fetch the product details associated with the cart item
 const product = await Product.findById(cartItem.productid);

    console.log("item is id is aa",cartItem);

    if (!cartItem) {
      return res.status(404).json({ error: 'CartItem not found' });
    }
  


  
    // Check if stock is less than 1 before increasing quantity
  if (action === 'increase' && cartItem.quantity + 1 > product.Stock) {
    cartItem.stockError = 'Out of stock';
    return res.status(400).json({ error: 'Out of stock', cartItem });
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
  

//// wishlist 
const wishList=async(req,res)=>{
  try{
    const userid=req.session.userid;
    const productid = req.params.productid;
    console.log("userid:",userid);
    console.log("productidddddddddd", productid);

    const Wishlist=await WishList.find({userid:userid })
    const Categorie = await Categorymgm.find( ); 

    const isEmpty = Wishlist.length === 0;
    res.render('wishList',{Wishlist,Categorie,isEmpty });
    console.log("Wishlist",Wishlist);

  } catch (error) {
    console.error(error);
    res.status(500).send('Internal wishlist page  Error');
}

}

///// add to wishlist
const addToWishlist = async (req, res) => {
  try {
    const productId = req.params.id;
    const userId = req.session.userid;
    console.log("postuserid:", userId);

    //  product exists
    const product = await Product.findById(productId);
   if (!product) return res.status(404).send('Product not found');

    // user exists
    const user = await User.findById(userId);
    if (!user) return res.status(404).send('User not found');

    // Check  the product  already in  wishlist
    const existingWishlistItem = await WishList.findOne({ userid: userId, productid: productId });

    if (existingWishlistItem) return res.redirect('/Home');

    // Create a new wishlist item
    const newWishlistItem = {
      userid: userId,
      username: user.Username,
      productid: productId,
      product: product.ProductName,
      price: product.Price,
      image: product.image[0],
    };

    
    await WishList.create(newWishlistItem);

    console.log("Wishlist item added:", newWishlistItem);
    res.redirect('/Home');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};


////Wishlist
const removewishlist=async(req,res)=>{
  try{
    const wishlistitem = req.params.id;
    await WishList.findByIdAndDelete(wishlistitem)
    res.redirect('/wishList')
  }catch (error) {
    console.log(error);
    res.status(500).send('delete wishlist Error');
    }
     };


  

 module.exports={
    Cartget,
    addToCart,
    cartremove,
    updatequantity,

    wishList,
    addToWishlist,
    removewishlist,
}
