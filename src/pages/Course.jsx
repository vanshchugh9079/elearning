import React, { useEffect, useState } from 'react';
import "../css/pages/course.css"
import { api } from '../utils/constant';
import { useNavigate } from 'react-router-dom';
const CourseCard = ({ course ,navigate }) => (
    <div className="col-md-4 mb-4">
        <div className="card h-100 shadow-sm">
            <img src={course.thumbnail.url} className="card-img-top ms-auto  me-auto p-2" alt={course.name} />
            <div className="card-body text-center">
                <h5 className="card-title">{course.name}</h5>
                <p className="card-text">Instructor : {course.createdBy.name}</p>
                <p className="card-text fw-bold">₹ {course.price}</p>
                <button className="btn btn-purple text-white " onClick={()=>{
                    navigate(`/course/buy/${course._id}`)
                }} >Get Started</button>
            </div>
        </div>
    </div>
);

const AvailableCourses = () => {
    let [courses, setCourses] = useState([])
    let navigate=useNavigate()
    useEffect(() => {
        let getCourse = async () => {
            try {
                let response = await api.get("course/")
                console.log(response);
                setCourses(response.data.data)
            } catch (error) {
                console.log(error)
            }
        }
        getCourse();
        return () => {
            // cleanup            
        }
    }, [])
    return (
        <div className="container py-5">
            <h2 className="text-center mb-4" style={{ color: '#9333ea' }}>Available Courses</h2>
            <div className="row">
                {courses.map((course, index) => (
                    <CourseCard key={index} course={course} navigate={navigate}  />
                ))}
            </div>
        </div>
    );
};

export default AvailableCourses;
