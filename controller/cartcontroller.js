const User = require('../models/usermodel');
const Product = require("../models/productmodel");
const Category = require("../models/categorymodel");
const Wishlist = require("../models/wishlistmodel");
const { ObjectId } = require('mongodb');
const Cart = require('../models/cartmodel')

let mes


/////lad wishlist page//////

const loadwishlist = async (req, res) => {
    try {
        if (req.session.user_id) {
        const wishlistData = await Wishlist.findOne({ userid: req.session.user_id }, { product: 1, _id: 0 }).populate("product.productId")

        if (!wishlistData) {
            return res.render('wishlist', { wishlist: [] })

        }
        const userData = await User.findById({ _id: req.session.user_id })
        const wishlist = wishlistData.product.map(data => data.productId)

        res.render('wishlist', { wishlist, user: userData, mes })
        mes = null
    }else{
        res.redirect('/login')
    }
    } catch (error) {
        console.log(error.message);
    }
}

/////////add wishlist///////////////

const addwishlist = async (req, res) => {
    try {
        
        const productId = req.query.id

        const user = await Wishlist.findOne({ userid: req.session.user_id })
        const productData = user.product.filter(product => product.productId.toString() === productId)
        // console.log(productData)

        const productDetail = {
            productId: productId
        }
        if (!user) {
            const wishlist = new Wishlist({
                product: productDetail,
                userid: req.session.user_id  // Add a default value for the userid field
            })
            await wishlist.save();
        } else {
            if (productData.length !== 0) {
                res.redirect('/wishlist')
                mes="add product to wishlist"
            } else {
                await Wishlist.findOneAndUpdate({ userid: req.session.user_id }, { $push: { product: { productId: productId } } })
                    .then((r) => {
                        // console.log(r)
                        mes = "added to wishlist"
                        res.redirect("/productcategory")
                        
                    })
            }
        }
   

    } catch (error) {
        console.log(error.message);
    }
}

//////////remove wishlist//////////////////

const productaccess = async (req, res) => {
    try {
        const id = req.query.id
        const productaccess = req.query.productaccess
        await Wishlist.updateOne({ userid: req.session.user_id }, { $pull: { product: { productId: id } } })
        res.redirect('/wishlist')
    } catch (error) {
        console.log(error.message)
    }
}

//////////////////addcart/////////////////////

const addcart = async (req, res) => {
    try {
        const productId = req.query.id
        const user_id = req.session.user_id
        const quantity = 1;
        // console.log(productId);
        // console.log(user_id);
        const productData = await Product.findOne({ _id: productId })
        // console.log('finish');
        const totalSalePrice = productData.SalePrice
        const cartData = await Cart.findOne({ userId: user_id })

        const productDetail = {
            productId: productId,
            quantity: 1,
            totalSalePrice: totalSalePrice
        }
        if (!cartData) {
            const cart = new Cart({
                product: productDetail,
                userId: user_id
            })
            await cart.save()
            res.redirect('/cart')

        } else {
            // console.log("cartfind");
            const productExist = cartData.product.find((data) => data.productId.toString() == productId)
            // console.log(productExist);
            if (productExist) {
                //////// if the product is also in there and increase the quantity //////////
                await Cart.updateOne({ userId: user_id, "product.productId": productId },
                    { $inc: { "product.$.quantity": 1, "product.$.totalSalePrice": totalSalePrice } })
                    .then(async (data) => {
                        if (data) {
                            await Cart.updateOne({ user_id: user_id }, { $pull: { product: { productId: productId } } })
                        }
                        mes='success'
                        res.redirect('/cart')
                    })
            } else {
                await Cart.updateOne({ userId: user_id }, { $push: { product: { productId, quantity, totalSalePrice } } })
                    .then(async (data) => {
                        if (data) {

                            await Wishlist.updateOne({ userid: user_id }, { $pull: { product: { productId: productId } } })
                        }
                        mes='success'
                        res.redirect('/cart')
                    })
            }
        }
    } catch (error) {
        console.log(error.message);
    }
}


////////////////list cart/////////////////

const listcart = async (req, res) => {
    try {
        if (req.session.user_id) {
            const user_id = req.session.user_id
            const userData = await User.findById({ _id: req.session.user_id })
            const cartproduct = await Cart.findOne({ userId: user_id }).populate("product.productId")

            if (cartproduct.product.length > 0) {
                const totalPrice = cartproduct.product.map((product) => product.totalSalePrice).reduce((acc, cur) => acc += cur)
                console.log(cartproduct.product)
                res.render('cart', { cartproduct: cartproduct.product, user: userData, cartData: cartproduct, totalPrice,mes })
                mes=null
            } else {
                res.render('cart', { user: userData, mes })
                mes = null
            }
        } else {
            res.redirect('/login')
        }

    } catch (error) {
        console.log(error.message);
    }
}

////////////change quantity in cart//////////////////////

const changeQuantity = async (req, res, next) => {
    try {
        const { userData, productId, quantity, salePrice, id } = req.body;
        // console.log(req.body)
        const cartData = await Cart.findOneAndUpdate({ userId: userData, 'product.productId': productId }, {
        })
        const product = cartData.product.find(item => item.productId == productId)
        const afterQuantity = product.quantity + Number(quantity);
        if (afterQuantity != 0) {
            if (quantity == 1) {
                await Cart.findOneAndUpdate({ userId: userData, 'product.productId': productId }, {
                    $inc: { 'product.$.quantity': quantity, 'product.$.totalSalePrice': salePrice }
                })
                res.json({ success: true })
            } else {
                await Cart.findOneAndUpdate({ userId: userData, 'product.productId': productId }, {
                    $inc: { 'product.$.quantity': quantity, 'product.$.totalSalePrice': -(salePrice) }
                })
                res.json({ success: false })
            }
        } else {
            res.json({ negative: true })
        }
    } catch (error) {
        next(error);
    }
}

////////////delete cart//////////////////////

const deleteCart = async (req, res) => {
    try {
        const id = req.query.id;
        // console.log(id);
        const deleteCart = req.query.deleteCart;
        await Cart.updateOne({ userId: req.session.user_id }, { $pull: { product: { productId: id } } })
        res.redirect('/cart')

    }
    catch (error) {
        console.log(error.message);
    }

}




module.exports = {
    loadwishlist,
    addcart,
    addwishlist,
    productaccess,
    listcart,
    changeQuantity,
    deleteCart
}