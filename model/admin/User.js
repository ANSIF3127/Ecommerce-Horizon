const mongoose = require('mongoose')
const Userloginschema = new mongoose.Schema({
    Username: {
        type: String,
    },
    email: {
        type: String,   
    },
    Password: {
        type: String,
    },
   

    isblocked: {
        type: Boolean
        
    },
    otp: {
        type: String,
    },
    pic:{
        type:String
    },
    isListed: {
        type: Boolean,
        required: true,
     },
 
});

const users = mongoose.model('UserData', Userloginschema);

module.exports = users;