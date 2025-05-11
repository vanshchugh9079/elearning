import React, { useEffect } from 'react';
import '../../css/layoutComponet/navigationBar.css';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setShowAddModel } from '../../redux/slice/showAddModel';
import { useSocket } from '../../socket/SocketContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const NavigationBar = () => {
    const navigate = useNavigate();
    const { user, loggedIn } = useSelector((state) => state.user);
    const dispatch = useDispatch();
    const location = useLocation();
    const socket = useSocket();

    const isActive = (path) => location.pathname === path ? 'active' : '';

    useEffect(() => {
        if (!socket) return;

        const onLiveClass = (obj) => {
            toast.info(
                <div>
                    <strong>📢 {obj.courseTitle}</strong>
                    <div>Live class started</div>
                    <div className='mt-1 d-flex justify-content-between'>
                        <button
                            className="btn btn-sm btn-primary me-2"
                            onClick={() => {
                                toast.dismiss(); // Close toast
                                navigate(`course/live/${obj.courseId}`);
                            }}
                        >
                            Join
                        </button>
                        <button
                            className="btn btn-sm btn-secondary"
                            onClick={() => toast.dismiss()}
                        >
                            Ignore
                        </button>
                    </div>
                </div>,
                {
                    position: "top-right",
                    autoClose: false,
                    closeOnClick: false,
                    draggable: false,
                    closeButton: false,
                }
            );
        };

        socket.on("live-class-started", onLiveClass);

        return () => {
            socket.off("live-class-started", onLiveClass);
        };
    }, [socket, navigate]);

    return (
        <>
            <div className="v-navbar fixed-top position-sticky">
                <div className="navbar-logo">
                    <span className="logo-text">E-Learning</span>
                </div>
                <div className="navbar-links">
                    <Link to={"/"} className={`fs-6 fw-bolder ${isActive('/')}`}>Home</Link>
                    <Link className={`fs-6 fw-bolder p-0`} onClick={() => dispatch(setShowAddModel(true))}>Add Course</Link>
                    <Link to={"/course"} className={`${isActive('/course')} fw-bolder fs-6`}>Courses</Link>
                    <a href="#about" className={`${isActive('#about')} fw-bolder fs-6`}>About</a>
                    {loggedIn && user.avatar?.url && (
                        <img
                            src={user.avatar.url}
                            alt="profile"
                            style={navStyle.imgStyle}
                            onClick={() => navigate("/profile")}
                            className="rounded-circle"
                        />
                    )}
                </div>
            </div>
            <ToastContainer />
        </>
    );
};

const navStyle = {
    imgStyle: {
        height: 40,
        width: 40,
        objectFit: "cover",
        cursor: 'pointer'
    }
};

export default NavigationBar;
