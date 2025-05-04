import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import User from "../../model/User.js"
import fs from "fs";
import errorHandler from "../../utils/errorHandler.js";
import sendEmail from "../../utils/sendMail.js";
import generateOTP from "../../utils/genrateOtp.js";
// Temporary store (you can use Redis or DB in production)
const tempUsers = new Map();

const register = async (req, res) => {
    const { email, name, password } = req.body;

    if (!email || !name || !password) {
        throw new ApiError(400, "Please provide all required fields.");
    }
    if (password.length < 6) {
        throw new ApiError(400, "Password must be at least 6 characters.");
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        if (req.file) fs.unlinkSync(req.file.path);
        throw new ApiError(403, "User already exists.");
    }

    let avatarData = {
        url: "https://res.cloudinary.com/dmvchwbdp/image/upload/v1745818513/uploads/tgkv3r0bvp3a4hlolrhz.png",
        public_id: Date.now()
    };
    if (req.file) {
        const upload = await cloudinaryUpload(req.file.path);
        fs.unlinkSync(req.file.path);
        avatarData = {
            url: upload.url,
            public_id: upload.public_id
        };
    }

    const otp = generateOTP(4);
    const otpExpiresAt = Date.now() + 1 * 60 * 1000;
    console.log(otp);
    tempUsers.set(email, { name, password, avatarData, otp, otpExpiresAt });

    await sendEmail({
        to: email,
        subject: "Verify Your Email",
        text: `Your OTP is ${otp}`,
        html: `<h1>Your OTP is ${otp}</h1>`
    });
    const response = new ApiResponse({ email, message: "OTP sent to your email." }, 200, "OTP Sent");
    res.status(response.statusCode).json(response);
};
export {tempUsers};
export default errorHandler(register);
