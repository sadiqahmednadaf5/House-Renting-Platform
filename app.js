if (process.env.NODE_ENV != "production") {
    require('dotenv').config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override")
const ejsMate = require("ejs-mate")
const ExpressError = require("./utils/ExpressError.js")
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

const cookieParser = require('cookie-parser');
const session = require("express-session");
const MongoStore = require('connect-mongo');
const passport = require("passport");
const LocalStrategy = require("passport-local")
const User = require("./models/user.js");

// const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const dbUrl = process.env.ATLASTDB_URL;

main().then(() => {
    console.log("connected db suceessfully")
}).catch((err) => {
    console.log(err)
})

async function main() {
    await mongoose.connect(dbUrl)
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"))
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")));
const flash = require("connect-flash")

app.use(cookieParser("secretcode"));

const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter:24*3600,

})
store.on("error",(err)=>{
    console.log("ERROR in MONGO SESSION STORE",err)
})

const sessionOptions = {
    store,
    secret:process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    },
}
// app.get("/", (req, res) => {
//     // console.log(req.cookies)
//     res.send("Hi I am root")
// });




app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())


app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    // console.log(res.locals.success )
    next();
});

// app.get("/demouser", async (req, res) => {
//     let fakeUser = new User({
//         email: "Student@gmail.com",
//         username: "delta-student"
//     });
//     let registerUser = await User.register(fakeUser, "helloworld");
//     res.send(registerUser)
// })


// app.get("/getsignedcookies", (req, res) => {
//     res.cookie("made-in", "india", { signed: true });
//     res.send("signed-cookies send")
// })

// app.get("/verify", (req, res) => {
//     console.log(req.signedCookies);
//     res.send("verified")
// })

// app.get("/getcookies", (req, res) => {
//     res.cookie("greet", "hello");
//     res.cookie("madeIn", "India")
//     res.send("send you a cookies!")
// })
// app.get("/greeting", (req, res) => {
//     let { name = 'sadiq' } = req.cookies;
//     res.send(`hi ${name}`)
// })

//routing 
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);





// app.get("/testlisting",async(req,res)=>{
//     let sampleListing = new Listing({
//         title:"my New Home",
//         description:"by the beach",
//         price:1200,
//         location:"Catangute , Goa",
//         country:"India",
//     });
//     await sampleListing.save();
//     console.log("sample was saved");
//     res.send("successful testing")
// })
app.all("*", (req, res, next) => {
    next(new ExpressError(404, "page Not Found!"))
})

app.use((err, req, res, next) => {
    let { statusCode = 500, message = "something went wrong" } = err;
    //res.status(statusCode).send(message)
    res.status(statusCode).render("error.ejs", { message })
})


app.listen(8080, () => {
    console.log("server listening to port 8080")
})
