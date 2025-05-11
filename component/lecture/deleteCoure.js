import Course from "../../model/Course.js"
import ApiError from "../../utils/ApiError.js"

let deleteCourse=async(req,res)=>{
    // console.log(req.params.id)
    let user=req.user
    let course=await Course.findById(req.params.id)
    if(course.createdBy.toString()!=user.id.toString()){
        throw new ApiError(400,"you are not authorized to delete this course")
    }
    await Course.findByIdAndDelete(req.params.id)
    res.status(200).json({
        message:"course deleted successfully"
    })
}
export default deleteCourse