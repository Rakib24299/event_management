const {z} = require("zod")



// REGISTERUSER SCHEMA****

const registerUserSchema = z.object(

    {

         body: z.object(
              {
               name: z
                    .string()
                    .trim()
                    .min(3, "Name must be at least 3 characters")
                    .max(50, "Name cannot exceed 50 characters"),

              email: z
                    .string()
                    .trim()
                    .email("Invalid email address")
                    .toLowerCase(),

              phone: z
                    .string()
                    .trim()
                    .regex(
                        /^(\+8801|01)[3-9]\d{8}$/,
                    "Invalid  phone number"
                ),

              password: z
                    .string()
                    .min(8, "Password must be at least 8 characters")
                    .max(30, "Password cannot exceed 30 characters"),

               address: z
                    .string()
                    .trim()
                    .max(200, "Address cannot exceed 200 characters")
                    .optional(),
            })
    
    }
)


// REGESTER _ORGANIZWE SCHEMS****


const registerOrganizerSchema = z.object
({

 body: z.object(
    {
        name: z
            .string()
            .trim()
            .min(3, "Name must be at least 3 characters")
            .max(50, "Name cannot exceed 50 characters"),

      email: z
            .string()
            .trim()
            .email("Invalid email address")
            .toLowerCase(),

     phone: z
            .string()
            .trim()
            .regex(
                /^(\+8801|01)[3-9]\d{8}$/,
                "Invalid phone number"
      ),

     password: z
            .string()
            .min(8, "Password must be at least 8 characters")
            .max(30, "Password cannot exceed 30 characters"),

     address: z
            .string()
            .trim()
            .max(200, "Address cannot exceed 200 characters")
            .optional(),

    organizationName: z
            .string()
            .trim()
            .min(3, "Organization name must be at least 3 characters")
            .max(100, "Organization name cannot exceed 100 characters"),

    tradeLicense: z
            .string()
            .trim()
            .min(5, "Trade license is required"),
    }),

})


// LOGIN _SCHEMA***

const loginSchema = z.object
({

     body: z.object(
        {
          email: z
            .string()
            .trim()
            .email("Invalid email address")
            .toLowerCase(),

          password: z
            .string()
            .min(1, "Password is required"),
         }),
})



// FORGET_PASSWORD_SCHEMA*****

const forgotPasswordSchema = z.object
({
  body: z.object(
       {
          email: z
            .string()
            .trim()
            .email("Invalid email address")
            .toLowerCase(),
        }),
});


// RESET_PASSWORD_SCHEMA

const resetPasswordSchema = z.object
({

      body: z.object({
            email: z
                .string()
                .trim()
                .email("Invalid email address")
                .toLowerCase(),

             otp: z
                .string()
                .length(6, "OTP must be exactly 6 digits"),

              newPassword: z
                .string()
                .min(8, "Password must be at least 8 characters")
                .max(30, "Password cannot exceed 30 characters"),
  }),
})


// CHANGE_PASSWORD SCHEMA*****

const changePasswordSchema = z.object
({
      body: z.object(
        {
            currentPassword: z
                    .string()
                    .min(1, "Current password is required"),

            newPassword: z
                    .string()
                    .min(8, "Password must be at least 8 characters")
                    .max(30, "Password cannot exceed 30 characters"),
         }),
});



//  VERIFY_EMAIL_SCHEMA***

const verifyEmailSchema = z.object({
  body: z.object({
    email: z
      .string()
      .trim()
      .email("Invalid email address")
      .toLowerCase(),

    otp: z
      .string()
      .length(6, "OTP must be exactly 6 digits"),
  }),
});


// RESEND_VARIFICATION_SCHEMA

const resendVerificationOtpSchema = z.object({
  body: z.object({
    email: z
      .string()
      .trim()
      .email("Invalid email address")
      .toLowerCase(),
  }),
});

module.exports=
{
    registerUserSchema,
    registerOrganizerSchema,
    loginSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    changePasswordSchema,
      verifyEmailSchema,
    resendVerificationOtpSchema,
};