const mongoose =require('mongoose')
const Category=require('./Category')

const ProductSchema = new mongoose.Schema({
   ProductName:{
      type:String,
      
   },
   Category:{
      type: mongoose.Schema.Types.ObjectId,
      ref: Category,
 },
  Price:{
    type:Number,
    
 },
    Rating:{
    type:Number,
    
 },
 
    Stock:{
    type:Number,
    
 },
    Description:{
     type:String,
     
 },
 
   isListed: {
   type: Boolean,
   required: true,
},
image:[String]


})
const Product = mongoose.model('Product', ProductSchema);

module.exports = Product;