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
            console.log(obj);
            toast.info(
                <div>
                    <strong>📢 {obj.name}</strong>
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
        <nav
            className="navbar navbar-expand-lg bg-white navbar-light shadow p-0 w-100 position-sticky top-0 z-3"
            style={{ zIndex: 1000000000000000000000000 }}
        >
            <a className="navbar-brand d-flex align-items-center px-4 px-lg-5" onClick={() => {
                navigate("/")
            }}>
                <h2 className="m-0 text-primary"><i className="fa fa-book me-3" />eLEARNING</h2>
            </a>
            <button
                type="button"
                className="navbar-toggler me-4 ms-auto"
                data-bs-toggle="collapse"
                data-bs-target="#navbarCollapse"
            >
                <span className="navbar-toggler-icon" />
            </button>

            <div className="collapse navbar-collapse" id="navbarCollapse">
                <div className="navbar-nav ms-auto p-4 p-lg-0">
                    <a className={`nav-item nav-link ${isActive('/')}`} onClick={() => {
                        navigate("/")
                    }}>Home</a>
                    <a className={`nav-item nav-link ${isActive('/about')}`} onClick={() => {
                        navigate("/about")
                    }}>About</a>
                    <span
                        className={`nav-item nav-link ${isActive('/course')}`}
                        role="button"
                        onClick={() => navigate("/course")}
                    >
                        Courses
                    </span>
                    {
                        loggedIn &&
                        <a className={`nav-item nav-link ${isActive('/create')}`} onClick={() => {
                            navigate("/create")
                        }}>Create Course</a>
                    }
                    <a href="/contact" className={`nav-item nav-link ${isActive('/contact')}`}>Contact</a>
                </div>

                {/* Conditional Profile or Join Now */}
                <div className="d-flex align-items-center pe-4">
                    {loggedIn ? (
                        <img
                            src={user?.avatar?.url || '/default-profile.png'}
                            alt="Profile"
                            className="rounded-circle"
                            style={{
                                width: '40px',
                                height: '40px',
                                objectFit: 'cover',
                                cursor: 'pointer'
                            }}
                            onClick={() => navigate('/profile')}
                        />
                    ) : (
                        <a href="/signup" className="btn btn-primary py-4 px-lg-5 d-none d-lg-block">
                            Join Now<i className="fa fa-arrow-right ms-3" />
                        </a>
                    )}
                </div>
            </div>
            <ToastContainer />
        </nav>
    );
};

export default NavigationBar;
