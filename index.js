const mongoose = require("mongoose");


const express = require("express")
const session = require('express-session');
const app = express()

app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true // Set this option to true or false, depending on your use case
  }));
const path=require("path")

app.set('view engine', 'ejs');    

app.use(express.static(path.join(__dirname,"/public")))

//for users route
const userRoute = require("./router/userRoute")
app.use('/',userRoute);


//for admin route
const adminRoute = require("./router/adminRoute")
app.use('/admin',adminRoute);

const error = require("./controller/errorcontroller")
app.use(error. get404);


// const PORT = process.env.PORT || 3002; // use process.env.PORT if it exists, otherwise use 3002
app.listen(3000, () => {
  console.log(`Server listening on 3000`);
});









