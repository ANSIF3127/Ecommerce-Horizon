const { ObjectId } = require('mongodb')
const mongoose = require('mongoose')

const Cartschema = new mongoose.Schema({
    
    userid: {
        type: ObjectId 
    },
    username:{
        type:String
    },
    productid:{
        type:ObjectId
    },
    productname: {
        type: String
       
    },
    price: {
        type: Number
       
    },
    quantity: {
        type: Number
        
    },
    image:[String]

})
const Cart = mongoose.model('Cartdetails', Cartschema)
module.exports = Cart;