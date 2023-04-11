const mongoose = require("mongoose")


const productSchema = new mongoose.Schema({
    SKU:{
        type:String,
        required:true
    },
    Name:{
        type:String,
        required:true
    },
    Description:{
        type:String,
        required:true
    },
    Price:{
        type:Number,
        required:true
    },
    SalePrice:{
        type:Number,
        required:true
    },
    Category:{
        type:String,
        required:true
    },
    Images:{
        type:Array,
        required:true
        
    },
    Stock:{
      type:Number,
      required:true
    },
    // Status:{
    //     type:String,
    //     required:true
    // },
    Discount:{
        type:String,
        required:true
    },
    id_disable:{
        type:Boolean,
        default:false
    }
    
})

    module.exports = mongoose.model("Product",productSchema)