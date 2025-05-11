import Course from "../../model/Course.js";
import User from "../../model/User.js";

const profile = async (req, res) => {
  try {
    const { id } = req.user;

    let user = await User.findById(id).populate("subscription watchedLecture");

    user = user.toObject();

    // Enhance subscribed courses
    const updatedSubscriptions = await Promise.all(
      user.subscription.map(async (course) => {
        let watchedLectureCount = 0;

        user.watchedLecture.forEach((lecture) => {
          if (lecture.course.toString() === course._id.toString()) {
            watchedLectureCount++;
          }
        });

        const totalLectures = course.lectures.length || 1;
        const watchedPercentage = (watchedLectureCount / totalLectures) * 100;

        const enrolledCount = await User.countDocuments({ subscription: course._id });

        return {
          ...course,
          watchedLectureCount,
          watchedPercentage: Math.round(watchedPercentage),
          enrolledStudents: enrolledCount
        };
      })
    );

    // Find created courses and enrich with enrolled count
    const userCourseRaw = await Course.find({ createdBy: id });

    const userCourse = await Promise.all(
      userCourseRaw.map(async (course) => {
        const enrolledCount = await User.countDocuments({ subscription: course._id });

        return {
          ...course.toObject(),
          enrolledStudents: enrolledCount
        };
      })
    );

    const response = {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio
      },
      createdCourses: userCourse,
      subscription: updatedSubscriptions
    };

    res.status(200).json(response);
  } catch (err) {
    res.status(500).json({ message: "Error fetching profile", error: err.message });
  }
};

export default profile;
