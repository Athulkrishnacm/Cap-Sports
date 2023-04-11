const mongoose = require("mongoose");
const { Number } = require("twilio/lib/twiml/VoiceResponse")


const addressSchema = new mongoose.Schema({
    firstName:{
        type:String,
        required:true
    },
    secondName:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    number:{
        type:Number,
        required:true
    },
    country:{
        type:String,
        required:true
    },
    state:{
        type:String,
        required:true
    },
    address:{
        type:String,
        required:true
    },
    landmark:{
        type:String,
        required:true
    },
    pincode:{
        type:Number,
        required:true
    },
    is_disable:{
        type:Boolean,
        default:false
    }
})


const userSchema = new mongoose.Schema({
    
    address:[addressSchema],


    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    mobile:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    is_admin:{
        type:Number,
        required:true
    },
    is_verifed:{
        type:Number,
        required:true,
        default:0
    },
    token:{
        type:String,
        default:''
    },
    access : {
        type:Boolean,
        default:false
    },
    


})
module.exports = mongoose.model("User",userSchema)