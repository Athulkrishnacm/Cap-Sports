const User = require('../models/usermodel');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

const Product = require("../models/productmodel")

const Coupon = require("../models/couponmodel");

const Banner = require("../models/bannermodel")

const config = require("../config/config")

const randomString = require("randomstring")

const { updateOne } = require('../models/usermodel');

const Cart = require('../models/cartmodel')

const Category = require("../models/categorymodel")

const Order = require('../models/ordermodel')

const Razorpay = require('razorpay');

const { response } = require('../router/adminRoute');

const crypto = require('crypto');

var instance = new Razorpay({
    key_id: process.env.RAZOR_KEYID,
    key_secret: process.env.RAZOR_SECRET_KEY,
});

const TWILIO_SERVICE_SID = process.env.TWILIO_SERVICE_ID ;
const accountsid = process.env.TWILIO_ACCOUNT_ID;
const authtoken = process.env.TWILIO_AUTHTOKEN;
const client = require("twilio")(accountsid, authtoken);

let mes
let mess

const securePassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10);
        return passwordHash;
    } catch (error) {
        console.log(error.message);
    }

}

//for sent mail

const sentVerifyMail = async (name, email, user_id) => {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: config.emailUser,
                pass: config.emailPassword
            }
        })
        const mailOptions = {
            from: config.emailUser,
            to: email,
            subject: "for verification mail",
            html: '<p>Hii ' + name + ',Please click here to <a href="http://localhost:3000/verify?id=' + user_id + '"> Verify </a> your mail.</p>'

        }
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log("Email has been sent:- ", info.response);
            }
        })


    } catch (error) {
        console.log(error.message);
    }


}

// for reset password send mail
const sentResetPassword = async (name, email, token) => {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: config.emailUser,
                pass: config.emailPassword
            }
        })
        const mailOptions = {
            from: config.emailUser,
            to: email,
            subject: "For Reset Password",
            html: '<p>Hii ' + name + ',Please click here to <a href="http://localhost:3000/forget-password?token=' + token + '"> Reset </a> your Password.</p>'

        }
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log("Email has been sent:- ", info.response);
            }
        })


    } catch (error) {
        console.log(error.message);
    }


}

//load register page
const loadRegister = async (req, res) => {
    try {

        res.render("registration")

    } catch (error) {
        console.log(error.message);
    }
}

const insertUser = async (req, res) => {

    console.log(req.body.mno);
    req.session.phone = req.body.mno;

    try {
        const userexist = await User.findOne({ mobile: req.body.mno })
        if (userexist) {
            res.render("registration", { message: "This Mobile Number is Already Registered" })
        } else {
            const spassword = await securePassword(req.body.password)
            const user = new User({
                name: req.body.name,
                email: req.body.email,
                mobile: req.body.mno,
                password: spassword,
                is_admin: 0,
                is_verifed: 1,
                access: true

            })




            const userData = await user.save()


            if (userData) {
                sentVerifyMail(req.body.name, req.body.email, userData._id);
                res.redirect('/otphome');
                try {
                    const verification = await client.verify
                        .services(TWILIO_SERVICE_SID)
                        .verifications.create({ to: `+91${req.body.mno}`, channel: "sms" });
                    res.sendStatus(200);
                } catch (err) {
                    console.error(err);
                    res.sendStatus(500);
                }

            } else {
                var msg =
                    res.render("registration", { message: "Your Registration has been failed.." })
            }
        }

    } catch (error) {
        console.log(error.message);
    }
}

///verify mail

const verifyMail = async (req, res) => {

    try {

        const updateInfo = await User.updateOne({ _id: req.query.id }, { $set: { is_verifed: 1 } })
        console.log(updateInfo);
        res.render('email-verified');

    } catch (error) {
        console.log(error.message);
    }

}

// login user methods
const loginLoad = async (req, res) => {
    try {
        res.render('login');
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
};


///verify login
const verifyLogin = async (req, res) => {
    try {

        const email = req.body.email;
        const password = req.body.password;

        const userData = await User.findOne({ email: email })


        if (userData.access == true) {
            const passwordMatch = await bcrypt.compare(password, userData.password)
            if (passwordMatch) {

                if (userData.is_verifed === 0) {
                    res.render("login", { message: "Please verify your email" })
                } else {
                    req.session.user_id = userData._id
                    res.redirect('/home')
                }

            } else {
                res.render('login', { message: "Email and Password is incorrect" })
            }
        } else {
            res.render('login', { message: "Email and Password is incorrect" })
        }

    } catch (error) {
        console.log(error.message);
    }
}


//load home page
const loadHome = async (req, res) => {
    try {
        if (req.session.user_id) {
            const userData = await User.findById({ _id: req.session.user_id })
            const prodactData = await Product.find({})
            const banner = await Banner.find({})
            //    console.log(prodactData,"this is productdata")
            res.render('home', { user: userData, product: prodactData, banner })
        } else {
            // console.log("ybuh")
            const banner = await Banner.find({})
            const prodactData = await Product.find({})
            res.render('home', { product: prodactData, banner })
        }
    } catch (error) {
        console.log(error.message);
    }
}

//user log out
const userLogout = async (req, res) => {
    try {
        req.session.user_id = null;
        res.redirect('/')
    } catch (error) {
        console.log(error.message);
    }
}

// for get password

const forgetLoad = async (req, res) => {
    try {
        res.render('forget');

    } catch (error) {
        console.log(error.message);
    }
}

const forgetVerify = async (req, res) => {
    try {

        const email = req.body.email;
        const userData = await User.findOne({ email: email });
        if (userData) {

            if (userData.is_verifed === 0) {
                res.render("forget", { message: "Please Verify Your Mail" })
            }
            else {
                const randomString = randomString.generate();
                const updateData = await User.updateOne({ email: email }, { $set: { token: randomString } })
                sentResetPassword(userData.name, userData.email, randomString)
                res.render('forget', { message: "Please check your mail to reset your password." })

            }
        } else {
            res.render('forget', { message: "user email is incorrect." });
        }

    } catch (error) {
        console.log(error.message);
    }
}

const forgetPasswordLoad = async (req, res) => {
    try {

        const token = req.query.token;
        const tokenData = await User.findOne({ token: token })
        if (tokenData) {
            res.render('forget-password', { user_id: tokenData._id })
        } else {
            res.render('404', { message: "Token is invalid" })
        }

    } catch (error) {
        console.log(error.message);
    }
}

const resetPassword = async (req, res) => {
    try {

        const password = req.body.password;
        const user_id = req.body.user_id

        const secure_Password = await securePassword(password)


        const updateData = await User.findByIdAndUpdate({ _id: user_id }, { $set: { password: secure_Password, token: '' } })

        res.redirect("/")

    } catch (error) {
        console.log(error.message);
    }
}


//const verification sent mail link

const verificationLoad = async (req, res) => {
    try {

        res.render('verification')


    } catch (error) {
        console.log(error.message);
    }
}


///otp verification

const verifyotp = async (req, res) => {
    try {
        const phone = req.session.phone;
        res.render('otphome', { phone })
    } catch (error) {
        console.log(error.message);
    }
}

const verifyotpnumber = async (req, res) => {
    const phone = req.session.phone;

    console.log(phone);
    const otp = req.body.otp;
    console.log(otp);

    try {
        const verification_check = await client.verify
            .v2.services(TWILIO_SERVICE_SID)
            .verificationChecks.create({ to: `+91${phone}`, code: otp });

        if (verification_check.status === "approved") {
            req.session.otpcorrect = true;
            res.redirect('/');
        } else {
            res.render('otphome', { msg: "OTP incorrect", phone });
        }
    } catch (err) {
        console.error(err);
        res.status(err.status || 500).json({ message: err.message });
    }
}

///product category

const productCategory = async (req, res) => {
    try {
        let page = 1
        let count
        if (req.query.page) {
            page = req.query.page
        }
        const category = await Category.find()
        let productData;
         if(req.query.category){
            productData = await Product.find({ id_disable: false, Category: req.query.category}).limit(6).skip((page - 1) *6).exec()

             count = await Product.find({id_disable: false,Category: req.query.category }).countDocuments()
         }else{
            productData = await Product.find({ id_disable: false }).limit(6).skip((page - 1) *6).exec()
             count = await Product.find({ id_disable: false }).countDocuments()
         }

        const userData = await User.findOne({ _id: req.session.user_id })
        if (userData) {
            res.render('productcategory', { product: productData, user: userData,category,mess,totalPages: Math.ceil(count / 6)})
            mess=null
            
        } else {
            res.render('productcategory', { product: productData, category ,mess,totalPages: Math.ceil(count/6)})
        }
    } catch (error) {
        console.log(error.message);
    }
}

//find category product

const findCategory = async(req,res)=>{
   try {
    console.log(req.params.category);
   } catch (error) {
    console.log(error.message);
   }
}

//product search by user

const productsearchuser = async (req, res) => {
    try {
        const category = await Category.find({})
       let totalPages=0;
        var search = '';
        if (req.query.search) {
            search = req.query.search;
        }
        const productData = await Product.find({
            $or: [
                { Name: { $regex: '.*' + req.body.search + '.*', $options: 'i' } }
            ]
        })
        res.render('productcategory', { product: productData,category,totalPages,mess})
        mess=null
    } catch (error) {
        console.log(error.message);
    }
}

///load user address

const loaduserAddress = async (req, res) => {
    try {
        const userData = await User.findOne({ _id: req.session.user_id });
        const data = userData.address.filter(address => address.is_disable === false)
        res.render('adduseraddress', { userData: data })
    } catch (error) {
        console.log(error.message);
    }
}
///list address
const listUserAddress = async (req, res) => {
    try {

        const userData = await User.findOne({ _id: req.session.user_id });

        res.render('adduseraddress', { userData }); // pass userData to the view
    } catch (error) {
        console.log(error.message);
    }
};

///add address 
const addaddressDetails = async (req, res) => {
    try {
        const userDetails = {
            firstName: req.body.FirstName,
            secondName: req.body.LastName,
            email: req.body.Email,
            number: req.body.Number,
            country: req.body.Country,
            state: req.body.State,
            address: req.body.Address,
            landmark: req.body.Landmark,
            pincode: req.body.Pincode,
        }
        const userData = await User.findOne({ _id: req.session.user_id })
        if (userData && userData.address) {
            await User.updateOne({ _id: req.session.user_id }, { $push: { address: userDetails } })
        } else {
            await User.updateOne({ _id: req.session.user_id }, { $set: { address: userDetails } })
        }
        res.redirect('back')
    }
    catch (error) {
        console.log(error.message);
    }
}


//delete user addresses

const deleteaddressDetails = async (req, res) => {
    try {
        const id = req.query.id;
        const a = await User.findOneAndUpdate({ 'address._id': id }, { $set: { 'address.$.is_disable': true } })
        res.redirect('/adduseraddress')

    }
    catch (error) {
        console.log(error.message);
    }

}

//load check out page

const loadCheckout = async (req, res) => {
    try {
        const user_id = req.session.user_id;
        const code = req.body.code;
        req.session.couponstatus=false
        const userData = await User.findOne({ _id: user_id })
        const checkout = await Cart.findOne({ userId: user_id }).populate("product.productId")
        const data = userData.address.filter(address => address.is_disable === false);
        if (checkout) {
            let totalPrice = checkout.product.map((product) => product.totalSalePrice).reduce((acc, cur) => acc += cur)
            if (!code) {
                res.render('checkout', { checkout: checkout.product || [], user: userData, cartData: checkout, totalPrice })
            } else {
                await Coupon.findOne({ Code: { $regex: new RegExp(code, 'i') } })
                    .then((coupon) => {
                        if (coupon.Type === "Flat" && coupon.MinOrdervalue < totalPrice) {
                            totalPrice = totalPrice - coupon.Value
                            req.session.couponstatus=true
                            req.session.totalPrice=totalPrice
                        } else if (coupon.Type === "Percentage" && coupon.MinOrdervalue < totalPrice) {
                            totalPrice = totalPrice - ((totalPrice * coupon.Value) / 100)
                            req.session.couponstatus=true
                            req.session.totalPrice=totalPrice
                        }
                        res.json({ success: coupon })
                    })
            }
        } else {
            res.redirect('/cart')
        }
    } catch (error) {
        console.log(error.message);
    }
}


//load orders page

const loadorders = async (req, res) => {
    try {
        const user_id = req.session.user_id
        const userData = await User.findById({ _id: req.session.user_id })
        const orders = await Order.find({ userId: user_id }).populate("product.productId")

        if (orders.product) {
            const totalPrice = orders.product.map((product) => product.totalSalePrice).reduce((sum, product) => sum += product);
            res.render('order', { orders: orders.product, user: userData, cartData: checkout, totalPrice });

        } else {
            res.redirect('/placeorder');
        }

    } catch (error) {
        console.log(error.message);
    }
}

//place order page
const placeorder = async (req, res) => {
    try {
        const{id}=req.params

        const user_id = req.session.user_id
        const orders = await Order.find({_id :id})
        const order = orders[orders.length - 1]
        const orderDetails = await Order.find()
        const userData = await User.findById({ _id: req.session.user_id })
        const cartData = await Cart.findOne({ userId: user_id }).populate("product.productId")
        const totalPrice = orders[0].cartTotal

        await Cart.deleteOne({ userId: req.session.user_id })
        res.render('order', { cartData, totalPrice ,order,user: userData});

    } catch (error) {
        console.log(error.message);
    }
}

//product single page view

const productsinglepage = async (req, res) => {
    try {
        const id = req.query.id;

        const productData = await Product.findOne({ _id: id })
        //console.log(productData)
        const userData = await User.findOne({ _id: req.session.user_id })

        if (userData) {
            res.render('productsinglepage', { product: productData, user: userData })
        } else {
            res.render('productsinglepage', { product: productData })
        }

    } catch (error) {
        console.log(error.message);
    }
}

//orders save

const orderSave = async (req, res) => {
    try {
        const cartData = await Cart.findOne({ userId: req.session.user_id })
        const cartProducts = cartData.product;
        let totalPrice = cartProducts.reduce((total, product) => {
            return total += product.totalSalePrice
        }, 0)
        if(req.session.couponstatus){
         totalPrice = req.session.totalPrice

        }

        // console.log("asdf")
        console.log(req.body)
        const order = new Order({
            userId: req.session.user_id,
            productData: cartProducts,
            paymentMethod: req.body.paymentMethod,
            addresId: req.body.address,
            cartTotal: totalPrice,
            paymentStatus: "Paid",
            status: "Placed"
        })
        const orderSave = await order.save()

        if (order.paymentMethod == "RazorPay") {
            instance.orders.create({
                amount: parseInt(totalPrice) * 100,
                currency: "INR",
                receipt: orderSave._id.toString()
            }).then((order) => {
                console.log(" Inn");
                res.json({ order: order,id:orderSave._id})
            })
        } else {
            // console.log("cod")
            res.json({ success: true })
        }
            
        } catch (error) {
            console.log(error.message);
        }
    }

//your orders

const YourOrder = async (req, res) => {
        try {
            const user_id = req.session.user_id;
            const userData = await User.findOne({ _id: user_id })
            const orders = await Order.find({ userId: user_id }).sort({_id:-1})
            res.render('yourorders', { orders })
        } catch (error) {
            console.log(error.message);
        }
    }

    const ordercancel = async (req, res) => {
        try {
            const id = req.query.id
            await Order.deleteOne({ _id: id })
            res.redirect('/yourorders')
        } catch (error) {
            console.log(error.message);
        }
    }

//verify payment

    const verifyPayment = async (req, res, next) => {
        try {
            const { order, payment } = req.body;
            let hmac = crypto.createHmac('sha256', 'CRzBfKPXjnfPCahhzCyqqan6')
            hmac.update(payment.razorpay_order_id + '|' + payment.razorpay_payment_id)
            hmac = hmac.digest("hex")

            if (hmac == payment.razorpay_signature) {
               let orderStatus= await Order.findOneAndUpdate({ _id: order.receipt }, {
                    $set: {
                        paymentStatus: 'Payed'
                    }
                },{new:true})

                res.json({ success: true,id:orderStatus._id })
            } else {
                await Order.updateOne({ _id: order.receipt }, {
                    $set: {
                        paymentStatus: 'Failed'
                    }
                })

                res.json({ success: false })
            }
        } catch (error) {
            next(error)
        }
    }

    //contact page

   const contact =async(req,res)=>{
      try {
        const userData = await User.findById({ _id: req.session.user_id })
        res.render('contact',{user:userData})
      } catch (error) {
        console.log(error.message);
      }
   }
   



   const productFilter = async (req, res) => {
    try {
      let product;
      let products = [];
      let Categorys;
      let Data = [];
      let Datas = [];
  
      const { categorys } = req.body;
  
        console.log(req.body);
      
        product = await Product.find({});
        console.log(product);
      Categorys = categorys.filter((value) => {
        return value !== null;
      });
      console.log("okok");
      console.log(Categorys[0]+"nnnnnnnnnnnnn",Categorys);
      if (Categorys[0]) {
        Categorys.forEach((element, i) => {
          products[i]= product.filter((value) => {
            return value.Category== element;
          });
        });
        console.log("hmmm");
        
  
       
      }
      Data=products
      console.log(products);
      console.log(Data);
      res.json({ Data });
    } catch (error) {
      console.log(error.message);
    }
  };



    module.exports = {
        loadRegister,
        insertUser,
        verifyMail,
        loginLoad,
        verifyLogin,
        loadHome,
        userLogout,
        forgetLoad,
        forgetVerify,
        forgetPasswordLoad,
        resetPassword,
        verificationLoad,
        securePassword,
        verifyotp,
        verifyotpnumber,
        productCategory,
        loaduserAddress,
        loadCheckout,
        loadorders,
        addaddressDetails,
        listUserAddress,
        productsinglepage,
        deleteaddressDetails,
        placeorder,
        orderSave,
        YourOrder,
        ordercancel,
        verifyPayment,
        findCategory,
        contact,
        productsearchuser,
        productFilter
    }







