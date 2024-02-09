    const mongoose =require('mongoose');


    const CategorySchema = new mongoose.Schema({
        BrandName:{
            type:String,
            require:true
        },

    })
    const  Category = mongoose.model('Category',CategorySchema);

    module.exports = Category;