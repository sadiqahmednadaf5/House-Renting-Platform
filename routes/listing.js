const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js")
const ExpressError = require("../utils/ExpressError.js")
const { listingSchema, reviewSchema } = require("../schema.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js")
const listingConteroller = require("../controllers/listings.js")
const multer = require('multer')
const { storage } = require("../cloudConfig.js")
const upload = multer({ storage });





router.route("/").get(wrapAsync(listingConteroller.index))
    .post(isLoggedIn,upload.single('listing[image]'), wrapAsync(listingConteroller.createListing)
    )

//new Route
router.get("/new", isLoggedIn, listingConteroller.renderNewForm)



router.route("/:id").get(wrapAsync(listingConteroller.showListing)).put(isLoggedIn, isOwner,upload.single('listing[image]'), validateListing, wrapAsync(listingConteroller.updateListing)).delete(isLoggedIn, isOwner, wrapAsync(listingConteroller.destoryListing));


//Edite route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingConteroller.renderEditForm));



module.exports = router;