const mongoose = require('mongoose')


const CouponSchema = new mongoose.Schema({
    Code:{
        type:String,
        required:true
    },
    Type:{
        type:String,
        required:true
    },
    Value:{
        type:Number,
        required:true
    },
    MinOrdervalue:{
        type:Number,
        required:true
    },
    MaxDiscount:{
        type:Number,
        required:true
    },
    Status:{
        type:String,
        required:true
    },
     Expiry:{
        type:Date,
        required:true
    },
    couponaccess:{
        type:Boolean,
        default:false
    }
})





module.exports= mongoose.model('Coupon',CouponSchema)