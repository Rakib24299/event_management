const jwt = require("jsonwebtoken");

const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
  try {
    
    const authorization = req.headers.authorization;

   if (!authorization || !authorization.startsWith("Bearer ")) 
    {
        return res.status(401).json(
        {
            success: false,
            message: "Unauthorized access. No token provided.",
        });
}

    
    const token = authorization.split(" ")[1];

   
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

   
    const user = await User.findById(decoded.id);

    if (!user) 
    {
        return res.status(404).json(
        {
            success: false,
            message: "User not found.",
        });
    }

    
    if (user.status === "blocked")
    {
        return res.status(403).json(
        {
            success: false,
            message: "Your account has been blocked.",
        });
    }

   
    req.user = {id: user._id  ,  role: user.role,};

    next();
  } 
  catch (error) 
  {
    return res.status(401).json(
    {
      success: false,
      message: "Invalid or expired token.",
    });
  }
};

module.exports = authMiddleware;