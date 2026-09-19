// EventEase AI Routes

const express =
    require("express");


const aiController =
    require("../controllers/ai.controller");


const optionalAuthMiddleware =
    require("../middlewares/optionalAuth.middleware");


const router =
    express.Router();


// AI Chat
// Optional Authentication

router.post(

    "/chat",

    optionalAuthMiddleware,

    aiController.chatWithAI

);


module.exports = router;