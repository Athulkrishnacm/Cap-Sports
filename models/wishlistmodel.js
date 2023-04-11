const { ObjectId } = require("mongodb")
const mongoose = require("mongoose")

const productSchema = new mongoose.Schema({
    productId:{
        type:ObjectId,
        ref:'Product'
    }
})

const wishlistSchema = new mongoose.Schema({
    product :[productSchema],
    userid:{
        type:ObjectId,
        required:true
    },
    productaccess :{
        type:Boolean,
        default:false
    }
})

module.exports = mongoose.model("Wishlist",wishlistSchema)