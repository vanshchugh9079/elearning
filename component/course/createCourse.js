import Course from "../../model/Course.js"; // assuming your Course model path
import ApiError from "../../utils/ApiError.js"; // custom error handler
import cloudinaryUpload from "../../utils/cloudinaryUpload.js"; // assuming your cloudinary upload function
export const createCourse = async (req, res, next) => {
  try {
    const { name ,description,price} = req.body;
    const { user } = req; // assuming you attached user in middleware after auth
    const file = req.file; // if you upload thumbnail image via multer

    // if (!user || user.role !== "admin") {
    //   throw new ApiError(403, "Only admins can create courses");
    // }
    if (!name || !file) {
      throw new ApiError(400, "Name and thumbnail are required");
    }
    let thumnail=await cloudinaryUpload(file.path)
    console.log(thumnail);
    const course = await Course.create({
      name,
      thumbnail: {
        public_id:thumnail.public_id, // or if you upload to cloud: file.public_id
        url: thumnail.url, // local upload example
      },
      description,
      price,
      createdBy: user.id,
    });
    res.status(201).json({
      success: true,
      message: "Course created successfully",
      course,
      lecture:[]
    });

  } catch (error) {
    next(error);
  }
};
export default createCourse;