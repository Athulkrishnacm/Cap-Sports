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

const auth = require('../middleware/adminAuth')

const adminController = require("../controller/admincontroller")



admin_route.get('/',auth.isLogout,adminController.loadLogin)


admin_route.post('/adminlogin',adminController.verifyLogin)

admin_route.get('/dashboard',auth.isLogin,adminController.loadDashboard)

admin_route.get('/user-list',adminController.userList)


admin_route.get('/logout',auth.isLogin,adminController.logout)
admin_route.post('/access-user',adminController.userAccess)

admin_route.post('/add-product',upload.array('images'),adminController.addProducts)
admin_route.get('/add-product',adminController.loadAddProducts)

admin_route.get('/product-list',adminController.productList)
admin_route.get('/id_disable',adminController.productAccessT)
admin_route.get('/id_undisable',adminController.productAccessF)

admin_route.post('/add-category',adminController.addCategorys)
admin_route.get('/add-category',adminController.loadaddCategorys)

admin_route.get('/category-list',adminController.categoryList)
admin_route.get('/id_disablec',adminController.categoryAccessT)
admin_route.get('/id_undisablec',adminController.categoryAccessF)

admin_route.post('/add-banner',upload.array('images'),adminController.addBanner)
admin_route.get('/add-banner',adminController.loadAddBanner)

admin_route.get('/banner-list',adminController.bannerList)

admin_route.get('/access',adminController.deleteBanner)

admin_route.get('/productsinglepage',adminController.adminproductsinglepage)

admin_route.get('/orderlist',adminController.orderlist)

admin_route.get('/updateorderlist',adminController.updateorderlist)

admin_route.get('/list-coupon',adminController.listcoupon)

admin_route.get('/add-coupon',adminController.loadaddcoupon)

admin_route.post('/add-coupon',adminController.addcoupon)

admin_route.get('/couponaccess',adminController.Deletecoupon)

admin_route.get('/search-user',adminController.adminusersearch)

admin_route.get('/search-product',adminController.productsearch)

admin_route.get('/edit-category',adminController.loadeditcategory)

admin_route.post('/edit-category',adminController.editcategory)

admin_route.get('/edit-product',adminController.loadeditproduct)

admin_route.post('/edit-product',upload.array('images'),adminController.editproduct)

admin_route.get('/edit-productimg',adminController.editproductimg)

admin_route.get('/salesReport',adminController.salesReport)

  


// admin_route.get('*',function(req,res){
//     res.redirect('/admin');
//    })

module.exports = admin_route; 