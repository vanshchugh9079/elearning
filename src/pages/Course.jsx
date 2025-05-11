import React, { useEffect, useState } from 'react';
import "../css/pages/course.css";
import { api } from '../utils/constant';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Course Card Component
const CourseCard = ({ course, navigate, user, showEdit }) => {
    const handlePrimaryClick = async () => {
        if (!course.purchased) {
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
                    navigate(`/course/${course._id}`);
                } catch (err) {
                    window.localStorage.clear()
                    navigate("/")
                    console.error("Error purchasing course:", err);
                }
            }
        } else {
            navigate(`/course/${course._id}`);
        }
    };

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
                        className="btn btn-purple text-white rounded-pill px-4 me-2"
                        onClick={handlePrimaryClick}
                    >
                        {course.purchased ? 'Continue' : 'Get Started'}
                    </button>

                    {showEdit && (
                        <>
                            <button
                                className="btn btn-outline-primary rounded-pill px-4 mt-2"
                                onClick={() => navigate(`/course/edit/${course._id}`)}
                            >
                                ✏️ Edit
                            </button>

                            <button
                                className="btn btn-outline-success rounded-pill px-4 mt-2 ms-2"
                                onClick={() => navigate(`/course/live/${course._id}`)}
                            >
                                🚀 Start Live Class
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

// Main Component
const AvailableCourses = () => {
    const [purchasedCourses, setPurchasedCourses] = useState([]);
    const [otherCourses, setOtherCourses] = useState([]);
    const [yourCourses, setYourCourses] = useState([]);
    const { user } = useSelector((state) => state.user);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const purchasedResponse = await api.get("course/purchased/get", {
                    headers: { Authorization: `Bearer ${user.token}` },
                });

                const yourCourseResponse = await api.get("course/you", {
                    headers: { Authorization: `Bearer ${user.token}` },
                });

                const purchasedList = purchasedResponse.data.data;
                const createdList = yourCourseResponse.data.data;

                setPurchasedCourses(purchasedList.map(c => ({ ...c, purchased: true })));
                setYourCourses(createdList.map(c => ({ ...c, purchased: true })));

                const allCoursesResponse = await api.get("course/get/");
                const allCourses = allCoursesResponse.data.data;

                const excludedIds = new Set([
                    ...purchasedList.map(c => c._id),
                    ...createdList.map(c => c._id),
                ]);

                const others = allCourses
                    .filter(course => !excludedIds.has(course._id))
                    .map(course => ({ ...course, purchased: false }));

                setOtherCourses(others);
            } catch (error) {
                console.log(error);
                
                window.localStorage.clear()
                navigate("/")
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
                                showEdit={false}
                            />
                        ))}
                    </div>
                </>
            )}

            {/* Your Created Courses Section */}
            {yourCourses.length > 0 && (
                <>
                    <h4 className="mb-3 text-primary">Your Created Courses</h4>
                    <div className="row mb-5">
                        {yourCourses.map((course, index) => (
                            <CourseCard
                                key={`y-${index}`}
                                course={course}
                                navigate={navigate}
                                user={user}
                                showEdit={true}
                            />
                        ))}
                    </div>
                </>
            )}

            {/* Other Courses Section */}
            <h4 className="mb-3">All Other Courses</h4>
            <div className="row">
                {otherCourses.length > 0 ? (
                    otherCourses.map((course, index) => (
                        <CourseCard
                            key={`o-${index}`}
                            course={course}
                            navigate={navigate}
                            user={user}
                            showEdit={false}
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
