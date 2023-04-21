const User = require("../models/usermodel")
const Product = require("../models/productmodel")
const Category = require("../models/categorymodel")
const bcrypt = require('bcrypt')
const Banner = require('../models/bannermodel')
const Order = require('../models/ordermodel')
const Coupon = require('../models/couponmodel')

let message;

//Admin login/////////////////////////////////

const loadLogin = async (req, res) => {
    try {
        res.render('adminlogin')
    } catch (error) {
        console.log(error.message);
    }
}

const verifyLogin = async (req, res) => {
    try {

        const email = req.body.email;
        const Password = req.body.password

        const userData = await User.findOne({ email: email })

        if (userData) {


            const passwordMatch = await bcrypt.compare(Password, userData.password)

            if (passwordMatch) {

                if (userData.is_admin == 0) {
                    res.render('adminlogin', { message: "Email and password is incorrect." })

                } else {
                    req.session.admin_id = userData._id
                    res.redirect("/admin/dashboard")
                }

            } else {
                res.render('adminlogin', { message: "Email and password is incorrect." })
            }

        } else {
            res.render('adminlogin', { message: "Email and password is incorrect." })
        }
    } catch (error) {
        console.log(error.message);
    }
}

//////////admin dashboard //////////////////////////////
const loadDashboard = async (req, res) => {
    try {
        const userData =await User.findById({ _id: req.session.admin_id })
        const usercount = await User.countDocuments({is_admin:0})
        const productcount = await Product.countDocuments({})
        const categorycount = await Category.countDocuments({})
        const online = await Order.find({paymentMethod: 'RazorPay'}).count()
        const cod = await Order.find({paymentMethod: 'COD'}).count()

        const ordercount = await Order.find({status:{$eq:"Delivered"}}).countDocuments()
       

        const weeklySales = await Order.aggregate([
            {
                $match: {
                    status: {
                        $eq: "Delivered",
                    }
                }
            },
            {
                $group: {
                    _id:
                        { $dateToString: { format: "%d-%m-%Y", date: "$date" } },
                    sales: { $sum: "$cartTotal" },
                }
            },
            {
                $sort: { _id: 1 }
            },
            {
                $limit: 7
            },
        ]);
        // console.log(weeklySales);
        const date = weeklySales.map((item) => {
            return item._id;
        });
        const sales = weeklySales.map((item) => {
            return item.sales;
        });
        // console.log(sales,date);

      

        res.render('dashboard', { admin: userData ,usercount,productcount,categorycount,ordercount,date,sales,online,cod})
    } catch (error) {
        console.log(error.message);
    }
}

/////////////admin search user/////////////////////


const adminusersearch = async (req, res) => {
    try {

        var search = '';
        if (req.query.search) {
            search = req.query.search;

        }
        const userData = await User.find({
            is_admin: 0,
            $or: [
                { name: { $regex: '.*' + search + '.*', $options: 'i' } },
                { email: { $regex: '.*' + search + '.*', $options: 'i' } },
                { mobile: { $regex: '.*' + search + '.*', $options: 'i' } },

            ]
        })

        res.render('user-list', { users: userData })
    } catch (error) {
        console.log(error.message);
    }
}

///logout////////////////////////////////

const logout = async (req, res) => {
    try {
        req.session.destroy()
        res.redirect('/admin')
    } catch (error) {
        console.log(error.message);
    }
}

//USER LIST //////////////////////////////////

const userList = async (req, res) => {
    try {
        const usersData = await User.find({ is_admin: 0 })
        res.render('user-list', { users: usersData })
    } catch (error) {
        console.log(error.message);
    }
}

const userAccess = async (req, res) => {
    try {
        const id = req.body.userid
        const access = req.body.action
        await User.updateOne({ _id: id }, { $set: { access: access } })
        res.json({ success: true })
    } catch (error) {
        console.log(error.message);
    }
}

//////////add product load////////////////////

const loadAddProducts = async (req, res) => {
    try {
        const category = await Category.find()
        res.render('add-product', { category })
    } catch (error) {
        console.log(error.message);
    }
}


///////add product///////////

const addProducts = async (req, res) => {
    try {
        const Name = req.body.Name
        const SKU = req.body.SKUcode
        const Category = req.body.category
        const Images = req.file
        const Price = req.body.price
        const SalePrice = req.body.salePrice
        const Discount = req.body.discount
        const Stock = req.body.quantity
        const Description = req.body.description

        if (Name.trim() == "" || SKU.trim() == "" || Price.trim() == "" || SalePrice.trim() == "" || Discount.trim() == "" || Stock.trim() == "") {
            res.render('add-product', { errMessage: "check all fields properly" })
        } else {
            let imagesUpload = []
            for (let i = 0; i < req.files.length; i++) {
                imagesUpload[i] = req.files[i].filename
            }
            const products = new Product({
                Name: req.body.Name,
                SKU: req.body.SKUcode,
                Category: req.body.category,
                Images: imagesUpload,
                Price: req.body.price,
                SalePrice: req.body.salePrice,
                Discount: req.body.discount,
                Stock: req.body.quantity,
                Description: req.body.description,
            })

            const prodactData = await products.save()
            // console.log(prodactData);
            if (prodactData) {
                res.redirect('/admin/product-list')
            } else {
                console.log(error.message);
            }
        }

    } catch (error) {
        console.log(error.message);
    }
}

////////////list product//////////////////

const productList = async (req, res) => {
    try {
        const prodactData = await Product.find({})

        res.render('product-list', { products: prodactData })
    } catch (error) {
        console.log(error.message);
    }
}

////////product search///////////////

const productsearch = async (req, res) => {
    try {
        var search = '';
        if (req.query.search) {
            search = req.query.search;
        }
        const prodactData = await Product.find({
            $or: [
                { Name: { $regex: '.*' + search + '.*', $options: 'i' } }
            ]
        })
        res.render('product-list', { products: prodactData })
    } catch (error) {
        console.log(error.message);
    }
}

/////////product block and unblock ////////////////

const productAccessT = async (req, res) => {
    try {

        const id = req.query.id
        await Product.findByIdAndUpdate({ _id: id }, { $set: { id_disable: true } })

        res.redirect('/admin/product-list')
    } catch (error) {
        console.log(error.message);
    }
}

const productAccessF = async (req, res) => {
    try {
        const id = req.query.id
        await Product.updateOne({ _id: id }, { $set: { id_disable: false } })

        res.redirect('/admin/product-list')
    } catch (error) {
        console.log(error.message);
    }
}

//////////load category///////////////////

const loadaddCategorys = async (req, res) => {
    try {

        res.render('add-category',{message})
        message=null
    } catch (error) {
        console.log(error.message);
    }
}


///////////add category///////////////////

const addCategorys = async (req, res) => {
    try {
        // console.log(req.body)
        const categoryName = req.body.categoryName
        const oldCategory=await Category.findOne({CategoryName:req.body.categoryName})
        if(oldCategory) {
           message='Category already exists'
           res.redirect('/admin/add-category')
        }
        else{
        const category = new Category({
            CategoryName: categoryName
        })

        const categoryData = await category.save()
        // console.log(categoryData)
        if (categoryData) {
            res.redirect('/admin/category-list')
        } else {
            console.log(error.message);
        }}
    } catch (error) {
        console.log(error.message);
    }
}


/////////////list category///////////////////

const categoryList = async (req, res) => {
    try {
        const category = await Category.find()
        // console.log(category);
        res.render('category-list', { category })
    } catch (error) {
        console.log(error.message);
    }
}

//////////category access block ////////////////

const categoryAccessT = async (req, res) => {
    try {

        const id = req.query.id
        await Category.findByIdAndUpdate({ _id: id }, { $set: { id_disablec: true } })

        res.redirect('/admin/category-list')
    } catch (error) {
        console.log(error.message);
    }
}


const categoryAccessF = async (req, res) => {
    try {
        const id = req.query.id
        await Category.updateOne({ _id: id }, { $set: { id_disablec: false } })

        res.redirect('/admin/category-list')
    } catch (error) {
        console.log(error.message);
    }
}

//////////add banner/////////////////////

const addBanner = async (req, res) => {
    try {
        const Titile = req.body.Title
        const Description = req.body.description
        const Images = req.file
        if (Titile.trim() == "" || Description.trim() == "") {
            res.render('add-banner', { errMessage: "check all fields properly" })
        } else {
            let imagesUpload = []
            for (let i = 0; i < req.files.length; i++) {
                imagesUpload[i] = req.files[i].filename
            }
            const banner = new Banner({
                Titile: req.body.Title,
                Images: imagesUpload,
                Description: req.body.description,
            })

            const bannerData = await banner.save()

            if (bannerData) {
                res.redirect('/admin/banner-list')
            } else {
                console.log(error.message);
            }
        }

    }
    catch (error) {
        console.log(error.message);
    }
}

////////list banner//////////

const bannerList = async (req, res) => {
    try {
        const bannerData = await Banner.find({})

        res.render('banner-list', { banners: bannerData })
    } catch (error) {
        console.log(error.message);
    }
}

/////////delete banner//////////////////

const deleteBanner = async (req, res) => {
    try {
        const id = req.query.id
        await Banner.deleteOne({ _id: id })
        res.redirect('/admin/banner-list')
    } catch (error) {
        console.log(error.message);
    }
}

///////////load banner page/////////////////////

const loadAddBanner = async (req, res) => {
    try {
        res.render('add-banner')
    } catch (error) {
        console.log(error.message);
    }
}

////////////admin single page view of product//////////////////////////

const adminproductsinglepage = async (req, res) => {
    try {
        const id = req.query.id;
        res.redirect('/productsinglepage' + id)

    } catch (error) {
        console.log(error.message);
    }
}

///////////order list////////////////

const orderlist = async (req, res) => {
    try {
        const orders = await Order.find({}).populate("productData.productId").sort({ _id: -1 })
        
        res.render('orderlist', { orders})
      
    } catch (error) {
        console.log(error.message);
    }
}

///////////order list change path///////////////////

const updateorderlist = async (req, res) => {
    try {
        const id = req.query.id;
        const value = req.query.value;
        await Order.findByIdAndUpdate({ _id: id }, { $set: { status: value } })
        res.redirect('/admin/orderlist')
    } catch (error) {
        console.log(error.message);
    }
}

///////////coupon page load//////////////////

const loadaddcoupon = async (req, res) => {
    try {
        res.render('add-coupon')
    } catch (error) {
        console.log(error.message);
    }
}

///////////add coupon/////////////////

const addcoupon = async (req, res) => {
    try {

        const Code = req.body.CouponCode;
        const Type = req.body.Type;
        const Value = req.body.Value;
        const MinOrdervalue = req.body.MinOrderValue;
        const MaxDiscount = req.body.MaxDiscount;
        const Status = req.body.Status;
        const Expiry = req.body.ExpiryDate;

        if (Code.trim() == "" || Type.trim() == "" || Value.trim() == "" || MinOrdervalue.trim() == "" || MaxDiscount.trim() == "" || Status.trim() == "" || Expiry.trim() == "") {
            res.render("add-coupon", { errMessage: "Check all fields properly" })
            // console.log("validation");
        } else {

            const coupon = new Coupon({
                Code: Code,
                Type: Type,
                Value: Value,
                MinOrdervalue: MinOrdervalue,
                MaxDiscount: MaxDiscount,
                Status: Status,
                Expiry: Expiry,
            })

            const couponData = await coupon.save()

            if (couponData) {
                res.redirect('/admin/list-coupon')
            } else {
                console.log(error.message);
            }

        }


    } catch (error) {
        console.log(error.message);
    }
}

//////////coupon list//////////////////////

const listcoupon = async (req, res) => {
    try {
        const couponData = await Coupon.find({})
        res.render('list-coupon', { coupons: couponData })
    } catch (error) {
        console.log(error.message);
    }
}

///////////delete coupon///////////////////

const Deletecoupon = async (req, res) => {
    try {
        const id = req.query.id
        const couponaccess = req.body.couponAccess
        await Coupon.deleteOne({ _id: id }, { $set: { couponaccess: couponaccess } })
        res.redirect('/admin/list-coupon')
    } catch (error) {
        console.log(error.message);
    }
}

////////load category edit page//////////////

const loadeditcategory = async (req, res) => {
    try {
        const id = req.query.id;

        const editc = await Category.findById({ _id: id })

        res.render('edit-category', { editc,message })
        message = null;
    } catch (error) {
        console.log(error.message);
    }
}

///////////category edit///////////////

const editcategory = async (req, res) => {
    try {
        const id = req.query.id;
        console.log(id);
        const CategoryName = req.body.categoryName;
        const oldCategory=await Category.findOne({CategoryName:req.body.categoryName})
        if(oldCategory){
            message = 'Category already exists'
            res.redirect(`/admin/edit-category?id=${id}`)
        }else{
        await Category.findByIdAndUpdate({ _id: id }, { $set: { CategoryName: CategoryName } })
        res.redirect('/admin/category-list')
        }
    } catch (error) {
        console.log(error.message);
    }
}

///////////product edit page load////////////////////////

const loadeditproduct = async (req, res) => {

    try {
        const id = req.query.id;
        const category = await Category.find()
        const editp = await Product.findOne({ _id: id })
        console.log(editp)
        res.render('edit-product', { editp, category })
    } catch (error) {
        console.log(error.message);
    }
}

////////////////product edit//////////////////////////////

const editproduct = async (req, res) => {
    try {
        const id = req.query.id;
        const name = req.body.Name;
        const price = req.body.price;
        const description = req.body.description;
        const category = req.body.category;
        const images = req.body.images;
        const quantity = req.body.quantity;
        const product = await Product.findByIdAndUpdate({ _id: req.query.id },
            {
                $set:
                {
                    Name: name, 
                    Price: price, 
                    Description: description, 
                    Stock: quantity,
                    Category: category,
                }
            })
        if(req.files){
            let imagesUpload = []
            for (let i = 0; i < req.files.length; i++) {
                imagesUpload[i] = req.files[i].filename
                await Product.findByIdAndUpdate({ _id: req.query.id },
                    {
                        $push:
                        {
                            Images: imagesUpload[i],
                        }
                    })
            }
            
        }    
        
        console.log('success');
        res.redirect('/admin/product-list');
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Server Error');
    }
};

///////////product image edit ///////////////////////

const editproductimg = async (req, res) => {
    try {
        const id = req.query.id;
        const productid = req.query.productid;
        await Product.findOneAndUpdate({_id: productid }, { $pull: { Images: { $in: [id] } } })
        res.redirect('/admin/edit-product?id='+productid)
    } catch (error) {
        console.log(error.message);
    }
}

/////////sales report/////////////////

const salesReport = async (req, res) => {
try {
    const orders = await Order.find({}).sort({_id:-1}).populate('productData.productId').populate('userId')
    const prodactData = await Product.find({})
    res.render('salesReport',{orders,products: prodactData})
} catch (error) {
    console.log(error.message);
}
}

//////////////sales graph details////////////////////////









module.exports = {
    loadLogin,
    verifyLogin,
    loadDashboard,
    logout,
    userList,
    userAccess,
    addProducts,
    productList,
    loadAddProducts,
    loadaddCategorys,
    categoryList,
    addCategorys,
    categoryAccessT,
    categoryAccessF,
    addBanner,
    bannerList,
    loadAddBanner,
    adminproductsinglepage,
    productAccessF,
    productAccessT,
    deleteBanner,
    orderlist,
    updateorderlist,
    addcoupon,
    listcoupon,
    loadaddcoupon,
    Deletecoupon,
    adminusersearch,
    productsearch,
    editcategory,
    loadeditcategory,
    loadeditproduct,
    editproduct,
    editproductimg,
    salesReport,
    

}
