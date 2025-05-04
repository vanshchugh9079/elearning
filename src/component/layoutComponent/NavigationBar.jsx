import React from 'react';
import '../../css/layoutComponet/navigationBar.css'; // Make sure to create this CSS file
import { Link, useNavigate, useLocation } from 'react-router-dom'; // Import useLocation
import { useSelector } from 'react-redux';

const NavigationBar = () => {
    let navigate = useNavigate();
    let { user, loggedIn } = useSelector((state) => state.user);
    let location = useLocation(); // Hook to get the current path

    // Function to check if a link is active
    const isActive = (path) => location.pathname === path ? 'active' : '';

    return (
        <div className="v-navbar fixed-top position-sticky">
            <div className="navbar-logo">
                <span className="logo-text">E-Learning</span>
            </div>
            <div className="navbar-links">
                <Link to={"/"} className={`fs-6 fw-bolder ${isActive('/')}`}>Home</Link>
                <Link to={"/"} className={`fs-6 fw-bolder ${isActive('/')}`}>Add Course</Link>
                <Link to={"/course"} className={isActive('/course') + " fw-bolder fs-6 "}>Courses</Link>
                <a href="#about" className={isActive('#about') +" fw-bolder fs-6"}>About</a>
                {loggedIn && user.avatar?.url && (
                    <img src={user.avatar.url} alt="profile" style={navStyle.imgStyle} className='rounded-circle' />
                )}
            </div>
        </div>
    );
};

let navStyle = {
    imgStyle: {
        height: 40,
        width: 40,
        objectFit: "cover",
    }
}

export default NavigationBar;
