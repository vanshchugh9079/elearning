import jwt from "jsonwebtoken"
import User from "../model/User.js"
import ApiError from "../utils/ApiError.js"
import errorHandler from "../utils/errorHandler.js"
let tokenCheck=async(req,res,next)=>{
    const token = req.header('Authorization')?.replace('Bearer ', '') || req.cookies["token"];    
    console.log(token);
    if(!token){
        throw new ApiError(401,"plese provide token or login")
    }
   let decoded= jwt.verify(token, process.env.JWT_SECRET)
   let user=await User.findOne({_id: decoded.id})    
   if(!user){
       throw new ApiError(401,"user not found or invalid token")
   }
   console.log(decoded);
   req.user=decoded
   next();
}
export default errorHandler(tokenCheck);