const { ObjectId } = require('mongodb')
const mongoose=require('mongoose')
 
const addresschema=new mongoose.Schema({
    userid:{
        type:ObjectId
    },
    firstname: {
        type: String
    },
    lastname: {
        type: String 
    },
    address: {
        type: String
    },
    city: { 
        type: String
    },
    pincode: {
        type: Number
    },
    phone: {
        type: Number
    }

})
const AddressStructure=mongoose.model('useraddress',addresschema)
module.exports=AddressStructure
