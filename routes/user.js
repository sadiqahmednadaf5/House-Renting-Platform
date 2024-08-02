const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const userContrrller = require("../controllers/users.js")


router.route("/signup").get(userContrrller.renderSignupForm).post(wrapAsync(userContrrller.signup));

router.route("/login").get(userContrrller.renderLoginForm).post(saveRedirectUrl, passport.authenticate("local", { failureRedirect: '/login', failureFlash: true }), userContrrller.login);


router.get("/logout", userContrrller.logout)





module.exports = router;
