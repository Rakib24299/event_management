const { ZodError } = require("zod");

const validateRequest = (schema) => {
  return async (req, res, next) => {
    
    try
    {
      await schema.parseAsync(
        {
                body: req.body,
                params: req.params,
                query: req.query,
        });

      next();
    } 
    
    catch (error)
    {
        if (error instanceof ZodError) 
        
        {
                return res.status(400).json(
                    {
                            success: false,
                            message: "Validation Error",
                            errors: error.issues.map((err) => (
                        {
                            field: err.path.slice(1).join("."),
                            message: err.message,
                        }
                                  )),
                    } );
        }

        return res.status(500).json(
        {
            success: false,
            message: "Internal Server Error",
        });
    }
  };
};

module.exports = validateRequest;