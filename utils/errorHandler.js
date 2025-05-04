import ApiResponse from "./ApiResponse.js";

const errorHandler = (fun) => {
    return async (req, res, next) => {
      try {
        await fun(req, res, next);
      } catch (error) {
        console.log(error);
        const statusCode = error.statusCode || 500;
        const responseBody = {
          success: false,
          message: error.message || "Internal Server Error"
        };
        let response=new ApiResponse(null,statusCode,error.message);
        res.status(statusCode).json(response);        
      }
    };
  };
  export default errorHandler;
  