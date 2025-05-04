import React, { useEffect, useState } from 'react';
import "../css/pages/course.css";
import { api } from '../utils/constant';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Course Card Component
const CourseCard = ({ course, navigate, user }) => {
    return (
        <div className="col-md-4 mb-4">
            <div className="card h-100 shadow rounded-4">
                <img
                    src={course.thumbnail?.url}
                    className="card-img-top p-3 mx-auto"
                    alt={course.name}
                    style={{ maxHeight: '200px', objectFit: 'contain' }}
                />
                <div className="card-body text-center">
                    <h5 className="card-title">{course.name}</h5>
                    <p className="text-muted">Instructor: {course.createdBy?.name}</p>
                    <p className="fw-bold fs-5">₹ {course.price}</p>
                    <button
                        className="btn btn-purple text-white rounded-pill px-4"
                        onClick={async () => {                            
                            if(!course.purchased){
                                if (course.price > 0) {
                                    navigate(`/course/buy/${course._id}`);
                                } else {
                                    try {
                                        const response = await api.post(
                                            `course/${course._id}/purchase`,
                                            {},
                                            {
                                                headers: { Authorization: `Bearer ${user.token}` },
                                            }
                                        );
                                        console.log(response);
                                    } catch (err) {
                                        console.error("Error purchasing course:", err);
                                    }
                                }
                            }
                            else{
                                navigate(`/course/${course._id}`);
                            }
                        }}
                    >
                        {course.purchased ? 'Continue' : 'Get Started'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// Main Component
const AvailableCourses = () => {
    const [purchasedCourses, setPurchasedCourses] = useState([]);
    const [otherCourses, setOtherCourses] = useState([]);
    const { user } = useSelector((state) => state.user);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                // Fetch purchased courses
                const purchasedResponse = await api.get("course/purchased/get", {
                    headers: { Authorization: `Bearer ${user.token}` },
                });

                // Fetch all courses
                const allCoursesResponse = await api.get("course/get/");
                const allCourses = allCoursesResponse.data.data;

                const purchasedIds = purchasedResponse.data.data.map(course => course._id);

                // Mark which courses are purchased
                const purchased = allCourses
                    .filter(course => purchasedIds.includes(course._id))
                    .map(course => ({ ...course, purchased: true }));

                const others = allCourses
                    .filter(course => !purchasedIds.includes(course._id))
                    .map(course => ({ ...course, purchased: false }));

                setPurchasedCourses(purchased);
                setOtherCourses(others);
            } catch (error) {
                console.error("Error fetching courses:", error);
            }
        };

        fetchCourses();
    }, [user.token]);

    return (
        <div className="container py-5">
            <h2 className="text-center mb-5" style={{ color: '#9333ea' }}>Available Courses</h2>

            {/* Purchased Courses Section */}
            {purchasedCourses.length > 0 && (
                <>
                    <h4 className="mb-3 text-success">Your Purchased Courses</h4>
                    <div className="row mb-5">
                        {purchasedCourses.map((course, index) => (
                            <CourseCard
                                key={`p-${index}`}
                                course={course}
                                navigate={navigate}
                                user={user}
                            />
                        ))}
                    </div>
                </>
            )}

            {/* All Other Courses Section */}
            <h4 className="mb-3">All Other Courses</h4>
            <div className="row">
                {otherCourses.length > 0 ? (
                    otherCourses.map((course, index) => (
                        <CourseCard
                            key={`o-${index}`}
                            course={course}
                            navigate={navigate}
                            user={user}
                        />
                    ))
                ) : (
                    <div className="text-muted text-center">No new courses available.</div>
                )}
            </div>
        </div>
    );
};

export default AvailableCourses;
