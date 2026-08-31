// ========================================
// EventEase Upload Routes
// ========================================

const express =
    require("express");

const router =
    express.Router();


const upload =
    require("../middlewares/upload.middleware");

const authMiddleware =
    require("../middlewares/auth.middleware");

const roleMiddleware =
    require("../middlewares/role.middleware");

const uploadController =
    require("../controllers/upload.controller");


// ========================================
// Upload Event Banner
// ========================================

router.post(

    "/single",

    authMiddleware,

    roleMiddleware(
        "organizer",
        "admin"
    ),

    upload.single(
        "image"
    ),

    uploadController.uploadSingleImage

);


// ========================================
// Upload Event Gallery
// ========================================

router.post(

    "/multiple",

    authMiddleware,

    roleMiddleware(
        "organizer",
        "admin"
    ),

    upload.array(
        "images",
        10
    ),

    uploadController.uploadMultipleImages

);


module.exports = router;