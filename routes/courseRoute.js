import { Router } from "express";
import createCourse from "../component/course/createCourse.js";
import getAllCourse from "../component/course/getAllCourse.js";
import Course from "../model/Course.js";
import errorHandler from "../utils/errorHandler.js";
import { upload } from "../middleware/upload.js";
import tokenCheck from "../middleware/tokenCheck.js";
import createLecture from "../component/lecture/createLecture.js";
import User from "../model/User.js";
import deleteLecture from "../component/lecture/deleteLecture.js";
import deleteCourse from "../component/lecture/deleteCoure.js";
import Razorpay from "razorpay";
import crypto from 'crypto';

// Initialize Razorpay instance


/**
 * Create a Razorpay order for course purchase
 */
let createOrder = async (req, res) => {
    const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
    });
    try {
        const { courseId } = req.params;
        const userId = req.user.id;

        // Validate course exists
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        // Check if user already purchased the course
        const user = await User.findById(userId);
        if (user.subscription.includes(courseId)) {
            return res.status(400).json({
                success: false,
                message: 'Course already purchased'
            });
        }

        // Create order options
        const options = {
            amount: course.price * 100, // Razorpay expects amount in paise
            currency: 'INR',
            receipt: `course_${courseId}_${Date.now()}`,
            payment_capture: 1, // Auto-capture payment
            notes: {
                courseId: courseId.toString(),
                userId: userId.toString()
            }
        };

        // Create Razorpay order
        const order = await razorpay.orders.create(options);

        res.status(200).json({
            success: true,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            key: process.env.RAZORPAY_KEY_ID
        });
    } catch (err) {
        console.error('Error creating Razorpay order:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to create payment order',
            error: err.message
        });
    }
};

/**
 * Verify Razorpay payment and enroll user in course
 */
let verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_payment_id,
            razorpay_order_id,
            razorpay_signature,
            courseId
        } = req.body;
        const userId = req.user.id;

        // Verify payment signature
        const generatedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex');

        if (generatedSignature !== razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: 'Payment verification failed - invalid signature'
            });
        }

        // Get user and course
        const user = await User.findById(userId);
        const course = await Course.findById(courseId);

        if (!user || !course) {
            return res.status(404).json({
                success: false,
                message: 'User or course not found'
            });
        }

        // Check if user already purchased the course (double-check)
        if (user.subscription.includes(courseId)) {
            return res.status(400).json({
                success: false,
                message: 'Course already purchased'
            });
        }

        // Add course to user's subscription
        user.subscription.push(courseId);
        await user.save();

        // Add user to course's students
        course.students.push(user._id);
        course.studentsCount = course.students.length;
        await course.save();

        // Payment success response
        res.status(200).json({
            success: true,
            message: 'Payment verified and course enrolled successfully',
            course: {
                id: course._id,
                name: course.name,
                thumbnail: course.thumbnail
            },
            paymentId: razorpay_payment_id
        });

    } catch (err) {
        console.error('Error verifying payment:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to verify payment',
            error: err.message
        });
    }
};
const router = Router();


// Get full or limited course details
let singleCourse = async (req, res) => {
    try {

        let courseId = req.params.id;
        let user = req.user;
        // Validate courseId
        if (!courseId || courseId.length !== 24) {
            return res.status(400).json({ message: "Invalid course ID" });
        }

        let getUser = await User.findById(user.id);
        if (!getUser) {
            return res.status(404).json({ message: "User not found" });
        }

        let course = await Course.findById(courseId).populate("lectures createdBy");
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        const isCreator = course.createdBy._id.toString() === user.id;
        const isSubscribed = getUser.subscription.includes(courseId);

        if (!isSubscribed && !isCreator) {
            const data = {
                name: course.name,
                description: course.description,
                thumbnail: course.thumbnail,
                createdBy: course.createdBy,
                price: course.price
            };
            return res.status(200).json({
                data,
                message: "Course fetched successfully (limited access)",
                purchase: true
            });
        }

        res.status(200).json({
            data: course,
            message: "Course fetched successfully (full access)",
            purchase: false
        });
    } catch (error) {
        console.log("Single Course Error:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};


// Get all courses user has purchased
const getYourPurchasedCourse = async (req, res) => {
    try {
        const user = req.user;
        const getUser = await User.findById(user.id)
            .populate("watchedLecture").populate({
                path: "subscription",
                populate: "createdBy"
            });

        // Transform each course into a plain JS object and calculate watched percentage
        const updatedSubscriptions = getUser.subscription.map((courseDoc) => {
            const course = courseDoc.toObject(); // Convert Mongoose doc to plain object
            let watchedLectureCount = 0;

            getUser.watchedLecture.forEach((lecture) => {
                if (lecture.course.toString() === course._id.toString()) {
                    watchedLectureCount++;
                }
            });

            const totalLectures = course.lectures.length || 1; // Avoid division by zero
            const watchedPercentage = (watchedLectureCount / totalLectures) * 100;

            return {
                ...course,
                watchedLectureCount,
                watchedPercentage
            };
        });


        res.status(200).json({
            data: updatedSubscriptions,
            message: "Your courses with watched percentages fetched successfully"
        });
    } catch (err) {
        res.status(500).json({ message: "Error fetching user courses", error: err.message });
    }
};





// Purchase a course
let getYourCourse = async (req, res) => {
    const user = req.user;
    let course = await Course.find({ createdBy: user.id }).populate("createdBy", "name")
    res.status(200).json({
        data: course,
        message: "Your courses fetched successfully"
    })
}
const purchaseCourse = async (req, res) => {
    try {
        const courseId = req.params.id;
        const user = req.user;

        const getUser = await User.findById(user.id);
        if (!getUser) return res.status(404).json({ message: "User not found" });

        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ message: "Course not found" });

        if (getUser.subscription.includes(courseId)) {
            return res.status(400).json({ message: "Course already purchased" });
        }

        getUser.subscription.push(courseId);
        await getUser.save();

        res.status(200).json({
            message: "Course purchased successfully",
            courseId: courseId
        });
    } catch (err) {
        res.status(500).json({ message: "Error purchasing course", error: err.message });
    }
};
const searchCourse = async (req, res) => {
    try {
        let { input } = req.params;

        if (!input) {
            return res.status(400).json({ message: "Search input is required" });
        }

        // Case-insensitive search on course title (or any other relevant field)
        const courses = await Course.find({
            name: { $regex: input, $options: "i" }
        });

        res.status(200).json({ data: courses });
    } catch (error) {
        console.error("Error searching courses:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


// Routes
router.post('/create', tokenCheck, upload.single('file'), createCourse);
router.post("/:id/add", tokenCheck, upload.single('file'), createLecture);
router.post("/:id/purchase", tokenCheck, errorHandler(purchaseCourse));
router.get("/get/:id", tokenCheck, singleCourse);
router.get("/search/:input", searchCourse)
router.get("/you", tokenCheck, errorHandler(getYourCourse))
router.get("/purchased/get", tokenCheck, errorHandler(getYourPurchasedCourse));
router.get("/get", errorHandler(getAllCourse));
router.delete("/lecture/:id", tokenCheck, deleteLecture)
router.delete("/:id", tokenCheck, errorHandler(deleteCourse))
 router.post("/:id/create-order", tokenCheck, errorHandler(async (req, res) => {
    const courseId = req.params.id;
    const course = await Course.findById(courseId);

    if (!course) {
        return res.status(404).json({ message: "Course not found" });
    }

    const amount = course.price * 100; // Convert to paise
    const currency = "INR";

    req.body = { amount, currency, courseId };
    return createOrder(req, res);
}));

router.post("/verify-payment", tokenCheck, errorHandler(async (req, res) => {
    // The verifyPayment controller will handle the verification and course enrollment
    return verifyPayment(req, res);
}));
export default router;
