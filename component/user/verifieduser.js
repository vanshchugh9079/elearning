// File: controllers/auth/verifyOtp.js
import User from "../../model/User.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import errorHandler from "../../utils/errorHandler.js";
import { tempUsers } from "./register.js";

const verifyOtp = async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        throw new ApiError(400, "Email and OTP are required.");
    }

    const tempUser = tempUsers.get(email);
    if (!tempUser) {
        throw new ApiError(404, "No OTP request found for this email.");
    }

    if (tempUser.otp !== otp) {
        throw new ApiError(401, "Invalid OTP.");
    }

    if (Date.now() > tempUser.otpExpiresAt) {
        tempUsers.delete(email);
        throw new ApiError(410, "OTP has expired.");
    }
    const newUser = await User.create({
        email,
        name: tempUser.name,
        password: tempUser.password,
        avatar: tempUser.avatarData
    });

    tempUsers.delete(email);
    const response = new ApiResponse({
        email: newUser.email,
        name: newUser.name,
        message: "User verified and created successfully."
    }, 201, "User Registered");

    res.status(response.statusCode).json(response);
};
export default errorHandler(verifyOtp);
