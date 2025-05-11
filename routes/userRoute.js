import { Router } from "express";
import register from "../component/user/register.js";
import { upload } from "../middleware/upload.js";
import login, { verifyUserLogin } from "../component/user/login.js";
import verifyOtp from "../component/user/verifieduser.js";
import errorHandler from "../utils/errorHandler.js";
import tokenCheck from "../middleware/tokenCheck.js";
import profile from "../component/user/profile.js";

const router = Router();

router.post('/register', upload.single("file"), register);
router.post('/login', login);
router.post("/login/verify-otp", errorHandler(verifyUserLogin));
router.post('/register/verify-otp', verifyOtp); 
router.get("/profile",tokenCheck,errorHandler(profile))

export default router;
