import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Course name is required"],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  duration: {
    type: String,
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
    },
  ],
  // Live class status field
  liveStatus: {
    type: String,
    enum: ["not-started", "live", "ended"],
    default: "not-started",
  },
}, {
  timestamps: true,
});

const Course = mongoose.model("Course", courseSchema);
export default Course;
