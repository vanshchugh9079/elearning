import Course from "../../model/Course.js";
import errorHandler from "../../utils/errorHandler.js";

let getAllCourse=async(req,res)=>{
    let allCourses=await Course.find({}).populate("createdBy","name");
    res.status(200).json({
        message:"getting All Courses successfully",
        data:allCourses
    });
}
export default  errorHandler(getAllCourse);