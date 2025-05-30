import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector,useDispatch } from 'react-redux';
import { FaSearch, FaBook, FaUser, FaTimes, FaSignInAlt, FaUserPlus, FaHome, FaGraduationCap, FaInfoCircle, FaPlus } from 'react-icons/fa';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import debounce from 'lodash.debounce';
import { api } from '../../utils/constant';
import {motion} from "framer-motion"
import { setUserData } from "../../redux/slice/userSlice";


const NavigationBar = () => {
    const navigate = useNavigate();
    let dispatch=useDispatch()
    const { user, loggedIn } = useSelector((state) => state.user);
    const location = useLocation();
    const [searchQuery, setSearchQuery] = useState('');
    const [isScrolled, setIsScrolled] = useState(false);
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const handleLogout = () => {
        setShowLogoutModal(true);
    };

    const confirmLogout = () => {
        window.localStorage.clear();
        dispatch(setUserData({
            user: {},
            loggedIn: false
        }))
        navigate("/");
    };

    const cancelLogout = () => {
        setShowLogoutModal(false);
    };
    const isActive = (path) => location.pathname === path ? 'active' : '';

    // Debounced search function
    const debouncedSearch = useCallback(
        debounce(async (query) => {
            if (query.trim()) {
                setIsSearching(true);
                try {
                    const response = await api.get(`course/search/${query.trim()}`);
                    setSearchResults(response.data.data);
                } catch (error) {
                    console.error('Search error:', error);
                    setSearchResults([]);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setSearchResults([]);
            }
        }, 300),
        []
    );

    // Handle search query changes
    useEffect(() => {
        debouncedSearch(searchQuery);
        return () => debouncedSearch.cancel();
    }, [searchQuery, debouncedSearch]);

    // Scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
            closeSearch();
        }
    };

    const openSearchModal = () => {
        setShowSearchModal(true);
        setShowMobileMenu(false);
    };

    const closeSearch = () => {
        setShowSearchModal(false);
        setSearchQuery('');
        setSearchResults([]);
    };

    const handleResultClick = (courseId) => {
        navigate(`/course/${courseId}`);
        closeSearch();
    };

    const toggleMobileMenu = () => {
        setShowMobileMenu(!showMobileMenu);
    };

    // Custom icon components
    const LogoIcon = () => (
        <svg width="28" height="28" viewBox="0 0 32 32" className="logo-icon">
            <path d="M16 0 L32 8 V24 L16 32 L0 24 V8 Z" fill="url(#logoGradient)" />
            <path d="M16 4 L28 10 V22 L16 28 L4 22 V10 Z" fill="white" />
            <path d="M16 8 L12 10 V22 L16 24 L20 22 V10 Z" fill="url(#logoGradient)" />
            <defs>
                <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
            </defs>
        </svg>
    );

    const MenuIcon = () => (
        <svg width="24" height="24" viewBox="0 0 24 24" className="menu-icon">
            <path d="M3 18H21V16H3V18ZM3 13H21V11H3V13ZM3 6V8H21V6H3Z" fill="currentColor" />
        </svg>
    );

    const CloseIcon = () => (
        <svg width="24" height="24" viewBox="0 0 24 24" className="close-icon">
            <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="currentColor" />
        </svg>
    );

    return (
        <>
            {/* Logout Confirmation Modal */}
            {showLogoutModal && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content rounded-4 border-0 shadow-lg">
                            <div className="modal-header bg-danger text-white rounded-top-4">
                                <h5 className="modal-title">
                                    <i className="bi bi-exclamation-triangle me-2"></i>Confirm Logout
                                </h5>
                                <button type="button" className="btn-close btn-close-white" onClick={cancelLogout} aria-label="Close"></button>
                            </div>
                            <div className="modal-body">
                                <p>Are you sure you want to logout?</p>
                                <p className="text-muted small">You'll need to sign in again to access your account.</p>
                            </div>
                            <div className="modal-footer border-0">
                                <motion.button
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    type="button"
                                    className="btn btn-secondary rounded-pill px-4"
                                    onClick={cancelLogout}
                                >
                                    Cancel
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    type="button"
                                    className="btn btn-danger rounded-pill px-4"
                                    onClick={confirmLogout}
                                >
                                    Yes, Logout
                                </motion.button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <nav
                className={`navbar navbar-expand-lg position-sticky sticky-top w-100 z-3 ${isScrolled ? 'bg-white shadow-sm py-1' : 'py-2'}`}
                style={{
                    transition: 'all 0.3s ease',
                    background: isScrolled ? 'rgba(255, 255, 255, 0.98)' : 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    borderBottom: isScrolled ? '1px solid rgba(0,0,0,0.05)' : 'none'
                }}
            >
                <div className="container-fluid px-3 px-lg-4">
                    {/* Brand Logo and Mobile Menu Toggle */}
                    <div className="d-flex align-items-center justify-content-between w-100">
                        <div className="d-flex align-items-center">
                            {/* Mobile Menu Toggle */}
                            <button
                                className="btn btn-link p-0 d-lg-none me-2"
                                onClick={toggleMobileMenu}
                                aria-label="Toggle navigation"
                                style={{
                                    color: '#3b82f6',
                                    minWidth: '40px'
                                }}
                            >
                                {showMobileMenu ? <CloseIcon /> : <MenuIcon />}
                            </button>

                            {/* Brand Logo */}
                            <Link to="/" className="navbar-brand d-flex align-items-center me-3">
                                <div className="d-flex align-items-center">
                                    <LogoIcon />
                                    <h2 className="m-0 ms-2" style={{
                                        fontFamily: "'Poppins', sans-serif",
                                        background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        fontWeight: '700',
                                        fontSize: '1.5rem'
                                    }}>
                                        <span className=" d-sm-inline">EDUCINE</span>
                                    </h2>
                                </div>
                            </Link>
                        </div>

                        {/* Desktop Navigation Items - Visible only on lg+ screens */}
                        <div className="d-none d-lg-flex align-items-center mx-4">
                            <Link
                                to="/"
                                className={`nav-link mx-2 ${isActive('/')}`}
                                style={{
                                    fontWeight: '500',
                                    fontSize: '0.95rem',
                                    color: isActive('/') ? '#3b82f6' : '#334155',
                                    padding: '0.5rem 0.75rem',
                                    borderRadius: '8px',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => !isActive('/') && (e.currentTarget.style.color = '#3b82f6')}
                                onMouseLeave={(e) => !isActive('/') && (e.currentTarget.style.color = '#334155')}
                            >
                                <FaHome className="me-1" /> Home
                            </Link>
                            <Link
                                to="/about"
                                className={`nav-link mx-2 ${isActive('/about')}`}
                                style={{
                                    fontWeight: '500',
                                    fontSize: '0.95rem',
                                    color: isActive('/about') ? '#3b82f6' : '#334155',
                                    padding: '0.5rem 0.75rem',
                                    borderRadius: '8px',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => !isActive('/about') && (e.currentTarget.style.color = '#3b82f6')}
                                onMouseLeave={(e) => !isActive('/about') && (e.currentTarget.style.color = '#334155')}
                            >
                                <FaInfoCircle className="me-1" /> About
                            </Link>
                            <Link
                                to="/course"
                                className={`nav-link mx-2 ${isActive('/course')}`}
                                style={{
                                    fontWeight: '500',
                                    fontSize: '0.95rem',
                                    color: isActive('/course') ? '#3b82f6' : '#334155',
                                    padding: '0.5rem 0.75rem',
                                    borderRadius: '8px',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => !isActive('/course') && (e.currentTarget.style.color = '#3b82f6')}
                                onMouseLeave={(e) => !isActive('/course') && (e.currentTarget.style.color = '#334155')}
                            >
                                <FaGraduationCap className="me-1" /> Courses
                            </Link>
                            {loggedIn && (
                                <Link
                                    to="/create"
                                    className={`nav-link mx-2 ${isActive('/create')}`}
                                    style={{
                                        fontWeight: '500',
                                        fontSize: '0.95rem',
                                        color: isActive('/create') ? '#3b82f6' : '#334155',
                                        padding: '0.5rem 0.75rem',
                                        borderRadius: '8px',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => !isActive('/create') && (e.currentTarget.style.color = '#3b82f6')}
                                    onMouseLeave={(e) => !isActive('/create') && (e.currentTarget.style.color = '#334155')}
                                >
                                    <FaPlus className="me-1" /> Create
                                </Link>
                            )}
                        </div>

                        {/* Desktop Search - Visible only on lg+ screens */}
                        <form
                            onSubmit={handleSearch}
                            className="d-none d-lg-flex me-3 position-relative"
                            style={{ width: '400px' }}
                        >
                            <div className="input-group">
                                <input
                                    type="text"
                                    className="form-control border-end-0 py-2 px-3"
                                    placeholder="Search courses..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    style={{
                                        borderRadius: '8px 0 0 8px',
                                        borderColor: '#d1d5db',
                                        boxShadow: 'none',
                                        fontSize: '0.9rem',
                                        background: '#f8fafc'
                                    }}
                                />
                                <button
                                    className="btn py-2 px-3"
                                    type="submit"
                                    style={{
                                        borderRadius: '0 8px 8px 0',
                                        background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                                        color: 'white',
                                        border: 'none'
                                    }}
                                >
                                    <FaSearch size={16} />
                                </button>
                            </div>
                            {searchQuery && (
                                <div className="search-results-desktop shadow-lg top-100 rounded position-absolute mt-1 bg-white"
                                    style={{
                                        zIndex: 1000,
                                        width: '400px',
                                        maxHeight: '400px',
                                        overflowY: 'auto',
                                        border: '1px solid #e2e8f0',
                                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                        left: '50%',
                                        transform: 'translateX(-50%)'
                                    }}>
                                    {isSearching ? (
                                        <div className="text-center py-3">
                                            <div className="spinner-border text-primary" role="status">
                                                <span className="visually-hidden">Loading...</span>
                                            </div>
                                        </div>
                                    ) : (
                                        searchResults.length > 0 ? (
                                            searchResults.map(course => (
                                                <div
                                                    key={course._id}
                                                    className="search-result-item p-3"
                                                    onClick={() => handleResultClick(course._id)}
                                                >
                                                    <div className="d-flex align-items-center">
                                                        <img
                                                            src={course.thumbnail?.url || '/default-course.png'}
                                                            alt={course.name}
                                                            className="rounded me-3"
                                                            style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                                        />
                                                        <div>
                                                            <h6 className="mb-1" style={{ color: '#1e293b' }}>{course.name}</h6>
                                                            <small className="text-muted">{course.instructor?.name}</small>
                                                            <div className="mt-1">
                                                                <span className="badge bg-blue-100 text-blue-800" style={{ fontSize: '0.7rem' }}>
                                                                    {course.category}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-3 text-muted">No results found for "{searchQuery}"</div>
                                        )
                                    )}
                                </div>
                            )}
                        </form>

                        {/* User Profile - Always visible */}
                        <div className="d-flex align-items-center">
                            {/* Mobile Search Toggle - Visible only on screens smaller than lg */}
                            <button
                                className="btn btn-link d-lg-none me-2 p-0"
                                onClick={openSearchModal}
                                aria-label="Search courses"
                                style={{
                                    color: '#64748b',
                                    minWidth: '40px',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.color = '#3b82f6'}
                                onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
                            >
                                <FaSearch size={18} />
                            </button>

                            {loggedIn ? (
                                <div className="dropdown">
                                    <button
                                        className="btn btn-link p-0 border-0 dropdown-toggle d-flex align-items-center"
                                        id="profileDropdown"
                                        data-bs-toggle="dropdown"
                                        aria-expanded="false"
                                        style={{ minWidth: '40px' }}
                                    >
                                        <div className="position-relative">
                                            <img
                                                src={user?.avatar?.url || '/default-profile.png'}
                                                alt="Profile"
                                                className="rounded-circle shadow-sm"
                                                style={{
                                                    width: '36px',
                                                    height: '36px',
                                                    objectFit: 'cover',
                                                    transition: 'all 0.3s ease',
                                                    border: '2px solid #e0e7ff'
                                                }}
                                            />
                                            {user?.notifications?.length > 0 && (
                                                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-red-500" style={{
                                                    fontSize: '0.6rem',
                                                    padding: '3px 5px',
                                                    minWidth: '18px'
                                                }}>
                                                    {user.notifications.length}
                                                </span>
                                            )}
                                        </div>
                                    </button>
                                    <ul className="dropdown-menu dropdown-menu-end shadow border-0 rounded-xl overflow-hidden mt-2"
                                        style={{
                                            minWidth: '200px',
                                            border: '1px solid #e2e8f0',
                                        }}>
                                        <li>
                                            <Link
                                                className="dropdown-item d-flex align-items-center py-2 px-3"
                                                to="/profile"
                                                style={{
                                                    color: '#334155',
                                                    transition: 'all 0.2s'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.backgroundColor = '#f1f5f9';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.backgroundColor = '';
                                                }}
                                            >
                                                <FaUser className="me-2 text-blue-500" /> Profile
                                            </Link>
                                        </li>
                                        <li><hr className="dropdown-divider my-1 border-gray-200" /></li>
                                        <li>
                                            <Link
                                                className="dropdown-item d-flex align-items-center py-2 px-3"
                                                onClick={() => {
                                                    handleLogout()
                                                }}
                                                style={{
                                                    color: '#ef4444',
                                                    transition: 'all 0.2s'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.backgroundColor = '#fee2e2';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.backgroundColor = '';
                                                }}
                                            >
                                                Logout
                                            </Link>
                                        </li>
                                    </ul>
                                </div>
                            ) : (
                                <>
                                    <Link
                                        to="/login"
                                        className="btn btn-sm d-none d-md-flex align-items-center py-2 px-3 me-2 rounded-lg"
                                        style={{
                                            border: '1px solid #3b82f6',
                                            color: '#3b82f6',
                                            fontWeight: '500',
                                            transition: 'all 0.3s',
                                            fontSize: '0.85rem'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = '#e0e7ff';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = '';
                                        }}
                                    >
                                        <FaSignInAlt className="me-1" /> Login
                                    </Link>
                                    <Link
                                        to="/signup"
                                        className="btn btn-sm d-none d-md-flex align-items-center py-2 px-3 rounded-lg"
                                        style={{
                                            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                                            color: 'white',
                                            fontWeight: '500',
                                            border: 'none',
                                            transition: 'all 0.3s',
                                            boxShadow: '0 2px 5px rgba(59, 130, 246, 0.3)',
                                            fontSize: '0.85rem'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-1px)';
                                            e.currentTarget.style.boxShadow = '0 4px 8px rgba(59, 130, 246, 0.4)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = '';
                                            e.currentTarget.style.boxShadow = '0 2px 5px rgba(59, 130, 246, 0.3)';
                                        }}
                                    >
                                        <FaUserPlus className="me-1" /> Sign Up
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Mobile Menu Content */}
                    <div className={`mobile-menu-content ${showMobileMenu ? 'show' : ''}`}>
                        <div className="mobile-menu-items">
                            <Link
                                to="/"
                                className={`mobile-menu-item ${isActive('/')}`}
                                onClick={() => setShowMobileMenu(false)}
                            >
                                <FaHome className="mobile-menu-icon" />
                                <span>Home</span>
                            </Link>
                            <Link
                                to="/about"
                                className={`mobile-menu-item ${isActive('/about')}`}
                                onClick={() => setShowMobileMenu(false)}
                            >
                                <FaInfoCircle className="mobile-menu-icon" />
                                <span>About</span>
                            </Link>
                            <Link
                                to="/course"
                                className={`mobile-menu-item ${isActive('/course')}`}
                                onClick={() => setShowMobileMenu(false)}
                            >
                                <FaGraduationCap className="mobile-menu-icon" />
                                <span>Courses</span>
                            </Link>
                            {loggedIn && (
                                <Link
                                    to="/create"
                                    className={`mobile-menu-item ${isActive('/create')}`}
                                    onClick={() => setShowMobileMenu(false)}
                                >
                                    <FaPlus className="mobile-menu-icon" />
                                    <span>Create</span>
                                </Link>
                            )}
                        </div>

                        {!loggedIn && (
                            <div className="mobile-auth-buttons">
                                <Link
                                    to="/login"
                                    className="btn btn-outline-primary w-100 mb-2"
                                    onClick={() => setShowMobileMenu(false)}
                                >
                                    <FaSignInAlt className="me-2" /> Login
                                </Link>
                                <Link
                                    to="/signup"
                                    className="btn btn-primary w-100"
                                    onClick={() => setShowMobileMenu(false)}
                                >
                                    <FaUserPlus className="me-2" /> Sign Up
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Desktop Search Results */}
            </nav>

            {/* Mobile Search Modal */}
            {showSearchModal && (
                <div className="search-modal">
                    <div className="search-modal-backdrop" onClick={closeSearch}></div>
                    <div className="search-modal-content">
                        <div className="search-modal-header">
                            <h5 className="search-modal-title">Search Courses</h5>
                            <button
                                onClick={closeSearch}
                                className="search-modal-close"
                            >
                                <FaTimes size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSearch} className="search-modal-form">
                            <div className="search-input-group">
                                <input
                                    type="text"
                                    className="search-input"
                                    placeholder="Search for courses..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    autoFocus
                                />
                                <button
                                    className="search-submit-btn"
                                    type="submit"
                                >
                                    <FaSearch size={16} />
                                </button>
                            </div>
                        </form>

                        {/* Search results */}
                        {isSearching ? (
                            <div className="search-loading">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                                <p className="search-loading-text">Searching courses...</p>
                            </div>
                        ) : (
                            searchResults.length > 0 ? (
                                <div className="search-results-list">
                                    {searchResults.map(course => (
                                        <div
                                            key={course._id}
                                            className="search-result-item"
                                            onClick={() => handleResultClick(course._id)}
                                        >
                                            <div className="search-result-content">
                                                <img
                                                    src={course.thumbnail?.url || '/default-course.png'}
                                                    alt={course.name}
                                                    className="search-result-image"
                                                />
                                                <div className="search-result-details">
                                                    <h6 className="search-result-title">{course.name}</h6>
                                                    <p className="search-result-instructor">{course.instructor?.name}</p>
                                                    <span className="search-result-category">
                                                        {course.category}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                searchQuery && (
                                    <div className="search-no-results">
                                        <div className="text-muted mb-1">No courses found for</div>
                                        <div className="search-query">"{searchQuery}"</div>
                                    </div>
                                )
                            )
                        )}
                    </div>
                </div>
            )}

            <ToastContainer position="top-right" autoClose={5000} />

            <style jsx>{`
                .navbar {
                    transition: all 0.3s ease;
                }
                
                .logo-icon {
                    animation: pulse 2s infinite;
                }
                
                .menu-icon, .close-icon {
                    transition: all 0.3s ease;
                }
                
                .mobile-menu-content {
                    max-height: 0;
                    overflow: hidden;
                    transition: max-height 0.3s ease;
                    width: 100%;
                }
                
                .mobile-menu-content.show {
                    max-height: 500px;
                }
                
                .mobile-menu-items {
                    padding: 1rem 0;
                }
                
                .mobile-menu-item {
                    display: flex;
                    align-items: center;
                    padding: 0.75rem 1rem;
                    color: #334155;
                    text-decoration: none;
                    border-radius: 8px;
                    margin-bottom: 0.5rem;
                    transition: all 0.2s;
                }
                
                .mobile-menu-item:hover, .mobile-menu-item.active {
                    background-color: #f1f5f9;
                    color: #3b82f6;
                }
                
                .mobile-menu-icon {
                    margin-right: 1rem;
                    font-size: 1.1rem;
                }
                
                .mobile-auth-buttons {
                    padding: 1rem;
                    border-top: 1px solid #e2e8f0;
                    margin-top: 1rem;
                }
                
                .search-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    z-index: 1050;
                    display: flex;
                    justify-content: center;
                    padding-top: 80px;
                }
                
                .search-modal-backdrop {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: rgba(15, 23, 42, 0.7);
                    backdrop-filter: blur(5px);
                }
                
                .search-modal-content {
                    position: relative;
                    width: 95%;
                    max-width: 600px;
                    max-height: 80vh;
                    background: white;
                    border-radius: 12px;
                    padding: 20px;
                    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
                    z-index: 1051;
                    overflow-y: auto;
                    animation: fadeIn 0.3s ease;
                }
                
                .search-modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                }
                
                .search-modal-title {
                    color: #1e40af;
                    margin: 0;
                    font-weight: 600;
                }
                
                .search-modal-close {
                    background: none;
                    border: none;
                    color: #64748b;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                
                .search-modal-close:hover {
                    color: #1e40af;
                    transform: rotate(90deg);
                }
                
                .search-modal-form {
                    margin-bottom: 20px;
                }
                
                .search-input-group {
                    display: flex;
                    width: 100%;
                }
                
                .search-input {
                    flex: 1;
                    padding: 12px 16px;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px 0 0 8px;
                    font-size: 1rem;
                    background: #f8fafc;
                    transition: all 0.2s;
                }
                
                .search-input:focus {
                    outline: none;
                    border-color: #93c5fd;
                    background: white;
                    box-shadow: 0 0 0 3px rgba(147, 197, 253, 0.3);
                }
                
                .search-submit-btn {
                    padding: 0 16px;
                    background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
                    color: white;
                    border: none;
                    border-radius: 0 8px 8px 0;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                
                .search-submit-btn:hover {
                    opacity: 0.9;
                }
                
                .search-results-list {
                    margin-top: 15px;
                    border-top: 1px solid #f1f5f9;
                }
                
                .search-result-item {
                    padding: 12px 0;
                    border-bottom: 1px solid #f1f5f9;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                
                .search-result-item:hover {
                    background-color: #f8fafc;
                }
                
                .search-result-content {
                    display: flex;
                    align-items: center;
                }
                
                .search-result-image {
                    width: 50px;
                    height: 50px;
                    object-fit: cover;
                    border-radius: 6px;
                    margin-right: 12px;
                }
                
                .search-result-details {
                    flex: 1;
                }
                
                .search-result-title {
                    color: #1e293b;
                    margin: 0 0 4px 0;
                    font-size: 0.95rem;
                    font-weight: 500;
                }
                
                .search-result-instructor {
                    color: #64748b;
                    margin: 0 0 6px 0;
                    font-size: 0.8rem;
                }
                
                .search-result-category {
                    display: inline-block;
                    background-color: #e0e7ff;
                    color: #3b82f6;
                    padding: 2px 8px;
                    border-radius: 4px;
                    font-size: 0.7rem;
                    font-weight: 500;
                }
                
                .search-loading {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 30px 0;
                }
                
                .search-loading-text {
                    color: #64748b;
                    margin-top: 10px;
                    font-size: 0.9rem;
                }
                
                .search-no-results {
                    text-align: center;
                    padding: 30px 0;
                }
                
                .search-query {
                    color: #1e293b;
                    font-weight: 500;
                    font-size: 1.1rem;
                }
                
                .search-results-desktop {
                    z-index: 1000;
                    width: 400px;
                    max-height: 400px;
                    overflow-y: auto;
                    border: 1px solid #e2e8f0;
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                }
                
                .active {
                    position: relative;
                }
                
                .active:after {
                    content: '';
                    position: absolute;
                    bottom: -5px;
                    left: 0;
                    right: 0;
                    height: 2px;
                    background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
                    border-radius: 2px;
                }
                
                .nav-link:hover {
                    background-color: #f1f5f9;
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                @keyframes pulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                    100% { transform: scale(1); }
                }
                
                @media (min-width: 992px) {
                    .search-modal {
                        display: none !important;
                    }
                    
                    .mobile-menu-content {
                        display: none !important;
                    }
                }
                
                @media (max-width: 991.98px) {
                    .navbar-brand h2 {
                        font-size: 1.4rem;
                    }
                    
                    .search-modal {
                        padding-top: 70px;
                    }
                    
                    .search-modal-content {
                        padding: 16px;
                    }
                }
                
                @media (max-width: 575.98px) {
                    .navbar-brand h2 {
                        font-size: 1.3rem;
                    }
                    
                    .search-modal {
                        padding-top: 60px;
                    }
                }
            `}</style>
        </>
    );
};

export default React.memo(NavigationBar);