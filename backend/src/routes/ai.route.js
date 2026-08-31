// ========================================
// EventEase AI Routes
// ========================================

const express =
    require("express");


const aiController =
    require("../controllers/ai.controller");


const authMiddleware =
    require("../middlewares/auth.middleware");


const router =
    express.Router();


// ========================================
// AI Chat
// Authenticated Users
// ========================================

router.post(

    "/chat",

    authMiddleware,

    aiController.chatWithAI

);


module.exports = router;