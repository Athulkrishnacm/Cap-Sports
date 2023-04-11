 const mongoose = require('mongoose');

 const bannerSchema = new mongoose.Schema({
    
    Titile:{
        type:String,
        required:true
    },
    Description:{
        type:String,
        required:true
    },Images:{
        type:Array,
        required:true
    }, 
    access : {
        type:Boolean,
        default:false
    },
 })

 module.exports = mongoose.model('Banner',bannerSchema)