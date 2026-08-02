const authService = require("../services/auth.service")



// ****Register User****

const registerUser = async (req, res) => {
  try {
    const result = await authService.registerUser(req.body);

    return res.status(201).json({
      success: true,
      message: "User registered successfully.",
      data: result,
    });
  } 
  
  catch (error) 
  {
    return res.status(400).json(
        {
            success: false,
            message: error.message,
         });
  }
};



// ****Register Organizer****

const registerOrganizer = async (req, res) => {
  try 
  {
    const result = await authService.registerOrganizer(req.body);

    return res.status(201).json(
    {
        success: true,
        message: "Organizer registered successfully.",
        data: result,
    });
  } 
  catch (error) 
  {
    return res.status(400).json(
    {
            success: false,
            message: error.message,
    });
  }
};


// ****Login User****

const loginUser = async (req, res) => {
  try 
  {
    const result = await authService.loginUser(req.body);

    return res.status(200).json(
     {
      success: true,
      message: "Login successful.",
      data: result,
    });
  } 
  
  catch (error)
  {
    return res.status(401).json(
    {
      success: false,
      message: error.message,
    });
  }
};


// ****Forgot Password****
const forgotPassword = async (req, res) => {
  try {
    const result = await authService.forgotPassword(req.body);

    return res.status(200).json(
    {
      success: true,
      message: result.message,
    });
  } 
  
  catch (error) 
  {
    return res.status(400).json(
    {
      success: false,
      message: error.message,
    });
  }
};


// ****Reset Password****

const resetPassword = async (req, res) => {
  try {
    const result = await authService.resetPassword(req.body);

    return res.status(200).json(
    {
      success: true,
      message: result.message,
    });
  } 
  catch (error)
  {
    return res.status(400).json(
    {
      success: false,
      message: error.message,
    });
  }
};

// ****Change Password****

const changePassword = async (req, res) => {
  try {
    const result = await authService.changePassword(
      req.user.id,
      req.body
    );

    return res.status(200).json(
    {
      success: true,
      message: result.message,
    });
  } 
  catch (error)
  {
    return res.status(400).json(
    {
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  registerUser,
  registerOrganizer,
  loginUser,
  forgotPassword,
  resetPassword,
  changePassword,
};