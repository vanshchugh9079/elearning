import Lecture from "../../model/Lecture.js"
import ApiError from "../../utils/ApiError.js"
import Course from "../../model/Course.js"
import errorHandler from "../../utils/errorHandler.js"
let deleteLecture=async(req,res)=>{
    let user=req.user
    let lectureId=req.params.id
    let lecture=await Lecture.findById(lectureId).populate("course")
    if(lecture.course.createdBy.toString()!==user.id.toString()){
        throw new ApiError(400,"you are not authorized to delete this lecture")
    }
    let course=await Course.findById(lecture.course._id)
    await Lecture.findByIdAndDelete(lectureId)
    let lectures=course.lectures.filter(lecture=>lecture._id.toString()!==lectureId)
    course.lectures=lectures
    await course.save()
    res.status(200).json({message:"lecture deleted successfully"})
}
export default errorHandler(deleteLecture);