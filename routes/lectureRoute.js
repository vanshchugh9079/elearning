import { Router } from "express";
import addWatchedLecture from "../component/lecture/addWatchedLecture.js";
import tokenCheck from "../middleware/tokenCheck.js";
import errorHandler from "../utils/errorHandler.js";

let router=Router();
router.get('/addWatchedLecture/:id',tokenCheck, errorHandler(addWatchedLecture));
export default router;
