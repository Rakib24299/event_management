const jwt = require("jsonwebtoken");

// Fallback to a long-lived session if the env
// value is missing or misconfigured, so the
// token can never silently become short-lived.


// 30 DAY TOKEN
const TOKEN_EXPIRES_IN =
    process.env.JWT_EXPIRES_IN || "30d";

const JWT_SECRET =
    process.env.JWT_SECRET;
    //CREATE TOKEN
    //GENERATE TOKE

const generateToken = (user) => {

    const payload = {
        id: user._id,
        role: user.role,
    };

    return jwt.sign(
        payload,
        JWT_SECRET,
        {
            expiresIn: TOKEN_EXPIRES_IN,
        }
    );

};

module.exports = generateToken;