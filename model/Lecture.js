import mongoose from "mongoose";

const lectureSchema = new mongoose.Schema({
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true,
    },
    title: {
        type: String,
        required: [true, "Lecture title is required"],
        trim: true,
    },
    description: {
        type: String,
    },
    thumbnail: {
        type: String,
    },
    videos: [
        {
            public_id: {
                type: String,
                required: [true, "Video public_id is required"],
            },
            url: {
                type: String,
                required: [true, "Video URL is required"],
            },
        }
    ],
}, {
    timestamps: true,
});

const Lecture = mongoose.model("Lecture", lectureSchema);

export default Lecture;
