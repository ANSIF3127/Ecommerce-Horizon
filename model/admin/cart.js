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

            Category:{
                type: mongoose.Schema.Types.ObjectId,
            
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