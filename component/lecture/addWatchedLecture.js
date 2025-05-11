import Lecture from "../../model/Lecture.js";
import User from "../../model/User.js";

let addWatchedLecture = async (req, res) => {
    try {
        let { id } = req.user;
        let { id: lectureId } = req.params;

        if (!lectureId) {
            return res.status(400).json({ message: "lectureId is required" });
        }

        let lecture = await Lecture.findById(lectureId);
        if (!lecture) {
            return res.status(404).json({ message: "Lecture not found" });
        }

        let user = await User.findById(id);

        // Check if the lecture is already in watchedLecture
        if (!user.watchedLecture.includes(lectureId)) {
            user.watchedLecture.push(lectureId);
            await user.save();
            return res.status(200).json({ message: "Lecture added to watched" });
        } else {
            return res.status(200).json({ message: "Lecture already in watched list" });
        }
    } catch (error) {
        console.error("Error adding watched lecture:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

export default addWatchedLecture;
