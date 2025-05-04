import mongoose from "mongoose";
const courseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Course name is required"],
    trim: true,
  },
  description: {
    type: String,
    required: [true, "Course description is required"],
    trim: true,
  },
  price: {
    type: Number,
    required: [true, "Course price is required"],
  },
  thumbnail: {
    public_id: {
      type: String,
      required: [true, "Thumbnail public_id is required"],
    },
    url: {
      type: String,
      required: [true, "Thumbnail URL is required"],
    },
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  lectures: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lecture",
    }
  ],
}, {
  timestamps: true,
});

const Course = mongoose.model("Course", courseSchema);
export default Course;
