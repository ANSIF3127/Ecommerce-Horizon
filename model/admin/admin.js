const mongoose = require('mongoose')
const adminloginschema = new mongoose.Schema({
   
    email: {
        type: String,
        required: true,
       
    },
    password: {
        type: String,
        required: true,
        
    },
});
 



const admin= mongoose.model('adminData',adminloginschema);
module.exports =  admin;