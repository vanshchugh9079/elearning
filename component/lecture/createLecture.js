import Lecture from "../../model/Lecture.js";
import Course from "../../model/Course.js";
import ApiError from "../../utils/ApiError.js";
import cloudinaryUpload from "../../utils/cloudinaryUpload.js"; // assuming cloudinary upload utility
import errorHandler from "../../utils/errorHandler.js";

export const createLecture = async (req, res) => {
    const { title, description} = req.body;
    const courseId=req.params.id
    console.log(courseId);
    console.log(title);
    
    
    const file = req.file; // video file upload via multer

    // 1. Check admin permission
    // if (!user || user.role !== "admin") {
    //   throw new ApiError(403, "Only admins can create lectures");
    // }

    // 2. Validate input fields
    if (!title || !file || !courseId) {
      throw new ApiError(400, "Title, video, and courseId are required");
    }

    // 3. Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      throw new ApiError(404, "Course not found");
    }

    // 4. Upload video to Cloudinary
    const video = await cloudinaryUpload(file.path); // assuming cloudinary utility handles video upload

    // 5. Create lecture document
    const lecture = await Lecture.create({
      course: courseId,
      title,
      description,
      thumbnail: req.body.thumbnail, // optional thumbnail field
      videos: [{
        public_id: video.public_id,
        url: video.url,
      }],
    });
    course.lectures.push(lecture._id);
    await course.save();
    res.status(201).json({
      success: true,
      message: "Lecture created successfully",
      lecture,
    })
};
export default errorHandler(createLecture);