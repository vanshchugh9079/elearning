import User from "../../model/User.js";
import ApiError from "../../utils/ApiError.js";
import sendEmail from "../../utils/sendMail.js";
import generateOTP from "../../utils/genrateOtp.js";
import errorHandler from "../../utils/errorHandler.js";

let loginOtpMap = new Map()
let verifyUserLogin = async (req, res) => {    const { email, otp } = req.body;
    if (!email || !otp) {
      throw new ApiError(400, "Email and OTP are required");
    }
    const userLoginOtp = loginOtpMap.get(email)
    if (!userLoginOtp) {
      throw new ApiError(404, "User not found")
    }
    if (userLoginOtp.otpExpiresAt < new Date().getTime()) {
      throw new ApiError(400, "OTP has expired")
    }
    if (userLoginOtp.otp !== otp) {
      throw new ApiError(400, "Invalid OTP")
    }
    let {user}=userLoginOtp;
    user=await User.findById(user._id);
    const token = user.genrateToken();
    await user.save();
    let sendUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      token:token,
      subscription: user.subscription
    }
    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: sendUser
    })
}
const login = async (req, res) => {    
  const { email, password, otp, loginType } = req.body;
    if (!email || !loginType) {
      throw new ApiError(400, "Email and loginType are required");
    }

    const user = await User.findOne({ email });
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    let sendUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      token: user.token,
      subscription: user.subscription
    }
    // 1️⃣ Login by password
    if (loginType === "password") {
      if (!password) {
        throw new ApiError(400, "Password is required for password login");
      }
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        throw new ApiError(401, "Invalid password");
      }
      const token = user.genrateToken();
      await user.save();

      return res.status(200).json({
        success: true,
        message: "Login successful",
        token,
        user: user
      });
    }
    // 2️⃣ Login by OTP
    if (loginType === "otp") {
      if (!otp) {
        const generatedOTP = generateOTP(6);
        const otpExpiresAt = Date.now() + 1 * 60 * 1000;
        loginOtpMap.set(user.email, {
          user: sendUser,
          otp: generatedOTP,
          otpExpiresAt
        })
        await sendEmail({
          to: user.email,
          subject: "Your OTP Code",
          text: `Your OTP is ${generatedOTP}. It will expire in 1 minutes.`,
        });
        return res.status(200).json({
          success: true,
          message: "OTP sent to email. Please verify",
        });
      }
    }
    throw new ApiError(400, "Invalid loginType");
};
export{verifyUserLogin};
export default errorHandler(login);
