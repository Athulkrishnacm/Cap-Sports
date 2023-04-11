const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');


const productSchema = new mongoose.Schema({
    productId :{
        type:ObjectId,
        ref:'Product'
    },
    quantity :{
        type:Number,
    },
    totalSalePrice:{
        type:Number
    },
    couponId :{
        type:ObjectId,
        ref:"Coupon"
    },
    deleteCart:{
        type:Boolean,
        default:false
    }
})


const cartSchema = new mongoose.Schema({
    product:[productSchema],
    userId:{
        type:ObjectId    
    }
})

module.exports=mongoose.model('Cart',cartSchema)