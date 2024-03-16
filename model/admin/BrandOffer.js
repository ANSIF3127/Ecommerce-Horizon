const mongoose = require('mongoose')

const BrandOfferschema=new mongoose.Schema({
    category: {
        type: String 
    },
    alloffer:{
        type:Number
    },
}) 
const BrandOffer =mongoose.model('BrandOffer',BrandOfferschema)
module.exports =  BrandOffer;