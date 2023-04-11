// const bodyParser = require("body-parser");
const express = require ("express")
const user_route = express();
const session = require("express-session")

const config = require("../config/config")
user_route.use(session({secret:config.sessionSecret}))

const auth = require("../middleware/auth")

user_route.set("view engine","ejs")
user_route.set("views","./views/user")

const bodyParser = require("body-parser")
user_route.use(bodyParser.json())
user_route.use(bodyParser.urlencoded({extended:true}))

const usercontroller = require("../controller/usercontroller")
const cartController = require("../controller/cartcontroller");
const { isLogout } = require("../middleware/adminAuth");

user_route.get("/register",auth.isLogout,usercontroller.loadRegister)

user_route.post("/register",usercontroller.insertUser)

user_route.get("/verify",usercontroller.verifyMail);

user_route.get("/",usercontroller.loadHome)
user_route.get("/login",auth.isLogout,usercontroller.loginLoad)

user_route.post("/login",usercontroller.verifyLogin)

user_route.get('/home',auth.isLogin,usercontroller.loadHome)

user_route.get('/logout',auth.isLogin,usercontroller.userLogout)

user_route.get('/forget',auth.isLogout,usercontroller.forgetLoad)

user_route.post('/forget',usercontroller.forgetVerify)

user_route.get('/forget-password',auth.isLogout,usercontroller.forgetPasswordLoad)

user_route.post('/forget-password',usercontroller.resetPassword)

user_route.get('/verification',usercontroller.verificationLoad)

user_route.get('/otphome',usercontroller.verifyotp)

// user_route.get('/otpverify',usercontroller.verifyotp)

user_route.post('/',usercontroller.verifyotpnumber)

user_route.get('/productcategory',usercontroller.productCategory)

user_route.get('/wishlist',cartController.loadwishlist)

user_route.get('/addtocart',cartController.addcart)

user_route.get('/cart-delete',cartController.deleteCart)

user_route.get('/add-wishlist',cartController.addwishlist)

user_route.get('/wishlist/delete',cartController. productaccess)

user_route.get('/cart',cartController.listcart)

user_route.post('/changeQuantity',cartController.changeQuantity)

user_route.get('/adduseraddress',usercontroller.loaduserAddress)

user_route.post('/listUserDetails',usercontroller.listUserAddress)

user_route.post('/adduserdetails',usercontroller.addaddressDetails)

user_route.get('/deleteaddressDetails',usercontroller.deleteaddressDetails)

user_route.get('/checkout',usercontroller.loadCheckout)
user_route.post('/coupon',usercontroller.loadCheckout)

user_route.get('/order',usercontroller.loadorders)

user_route.get('/placeorder',usercontroller.placeorder)

user_route.post('/verifyPayment',usercontroller.verifyPayment)

user_route.get('/productsinglepage',usercontroller.productsinglepage)

user_route.post('/checkout',usercontroller.orderSave)

user_route.get('/yourorders',usercontroller.YourOrder)

user_route.get('/cancel',usercontroller.ordercancel)

user_route.get('/contact',usercontroller.contact)

user_route.post('/productcategory',usercontroller.productsearchuser)

user_route.post('/shopFilter',usercontroller.productFilter)


module.exports = user_route