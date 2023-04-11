const mongoose = require('mongoose')

const CategorySchema = new mongoose.Schema({

    CategoryName:{
        type:String,
        uppercase:true,
        require:true
    },
    id_disablec:{
        type:Boolean,
        default:false
    }


})
module.exports = mongoose.model("Category",CategorySchema)