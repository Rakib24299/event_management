const jwt = require("jsonwebtoken");

const generateToken = (user) =>{
    const payload ={
                    id: user._id,
                    role : user.role,
                   };

    return jwt.sign(payload, process.env.JWT_SECRET,
                {
                        expresIn : process.env.JWT_EXPIRES_IN,
                }
            );
}

module.exports =generateToken;