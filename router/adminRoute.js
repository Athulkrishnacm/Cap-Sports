const express = require("express")
const admin_route = express();

const session = require("express-session")
const config = require("../config/config")
const multer = require('multer');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/Images');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });
admin_route.use(session({secret:config.sessionSecret}))

const bodyParser = require("body-parser")
admin_route.use(bodyParser.json())
admin_route.use(bodyParser.urlencoded({extended:true}))

admin_route.set('view engine','ejs')
admin_route.set('views','./views/admin')

const adminAuth = require('../middleware/adminAuth')

const adminController = require("../controller/admincontroller")



admin_route.get('/',adminAuth.isLogout,adminController.loadLogin)


admin_route.post('/adminlogin',adminController.verifyLogin)

admin_route.get('/dashboard',adminAuth.isLogin,adminController.loadDashboard)

admin_route.get('/user-list',adminController.userList)


admin_route.get('/logout',adminAuth.isLogin,adminController.logout)
admin_route.post('/access-user',adminAuth.isLogin,adminController.userAccess)

admin_route.post('/add-product',adminAuth.isLogin,upload.array('images'),adminController.addProducts)
admin_route.get('/add-product',adminAuth.isLogin,adminController.loadAddProducts)

admin_route.get('/product-list',adminAuth.isLogin,adminController.productList)
admin_route.get('/id_disable',adminController.productAccessT)
admin_route.get('/id_undisable',adminController.productAccessF)

admin_route.post('/add-category',adminAuth.isLogin,adminController.addCategorys)
admin_route.get('/add-category',adminAuth.isLogin,adminController.loadaddCategorys)

admin_route.get('/category-list',adminAuth.isLogin,adminController.categoryList)
admin_route.get('/id_disablec',adminController.categoryAccessT)
admin_route.get('/id_undisablec',adminController.categoryAccessF)

admin_route.post('/add-banner',adminAuth.isLogin,upload.array('images'),adminController.addBanner)
admin_route.get('/add-banner',adminAuth.isLogin,adminController.loadAddBanner)

admin_route.get('/banner-list',adminAuth.isLogin,adminController.bannerList)

admin_route.get('/access',adminController.deleteBanner)

admin_route.get('/productsinglepage',adminAuth.isLogin,adminController.adminproductsinglepage)

admin_route.get('/orderlist',adminAuth.isLogin,adminController.orderlist)

admin_route.get('/updateorderlist',adminAuth.isLogin,adminController.updateorderlist)

admin_route.get('/list-coupon',adminAuth.isLogin,adminController.listcoupon)

admin_route.get('/add-coupon',adminAuth.isLogin,adminController.loadaddcoupon)

admin_route.post('/add-coupon',adminAuth.isLogin,adminController.addcoupon)

admin_route.get('/couponaccess',adminAuth.isLogin,adminController.Deletecoupon)

admin_route.get('/search-user',adminAuth.isLogin,adminController.adminusersearch)

admin_route.get('/search-product',adminAuth.isLogin,adminController.productsearch)

admin_route.get('/edit-category',adminAuth.isLogin,adminController.loadeditcategory)

admin_route.post('/edit-category',adminAuth.isLogin,adminController.editcategory)

admin_route.get('/edit-product',adminAuth.isLogin,adminController.loadeditproduct)

admin_route.post('/edit-product',adminAuth.isLogin,upload.array('images'),adminController.editproduct)

admin_route.get('/edit-productimg',adminAuth.isLogin,adminController.editproductimg)

admin_route.get('/salesReport',adminAuth.isLogin,adminController.salesReport)

  


// admin_route.get('*',function(req,res){
//     res.redirect('/admin');
//    })

module.exports = admin_route; 