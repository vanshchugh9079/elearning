import { Router } from "express";
import register from "../component/user/register.js";
import { upload } from "../middleware/upload.js";
import login, { verifyUserLogin } from "../component/user/login.js";
import verifyOtp from "../component/user/verifieduser.js";
import errorHandler from "../utils/errorHandler.js";

const router = Router();

router.post('/register', upload.single("file"), register);
router.post('/login', login);
router.post("/login/verify-otp", errorHandler(verifyUserLogin));
router.post('/register/verify-otp', verifyOtp); 

export default router;
