import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import 'bootstrap/dist/css/bootstrap.min.css';
import {
  Accordion, ProgressBar, Spinner, Toast, ToastContainer,
  Button, Badge, Tooltip, OverlayTrigger, Container, Row, Col
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlay, faBookmark, faArrowRight, faVideo, faCheck, faClock,
  faChevronDown, faTrashAlt, faStar, faCertificate, faUserTie,
  faGraduationCap, faChartLine, faListUl, faBookOpen, faArrowLeft
} from '@fortawesome/free-solid-svg-icons';
import { api } from '../utils/constant';
import ScrollToTop from "../utils/ScrollToTop"
const CourseDetailsViewer = () => {
  const pulse = {
    animate: {
      scale: [1, 1.05, 1],
      opacity: [1, 0.8, 1],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const { id, lecture:lectureIndex } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useSelector(state => state.user);
  const [courseData, setCourseData] = useState({
    name: "Loading Course...",
    description: "",
    category: "General",
    level: "Beginner",
    duration: "0 hours",
    thumbnail: { url: "" },
    lectures: [],
    createdAt: new Date().toISOString(),
    createdBy: {
      name: "Instructor",
      avatar: { url: "" }
    }
  });
  const [selectedLecture, setSelectedLecture] = useState(lectureIndex||0);
  const [watchLater, setWatchLater] = useState([]);
  const [completedLectures, setCompletedLectures] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [expandedAccordion, setExpandedAccordion] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hoveredLecture, setHoveredLecture] = useState(null);
  const videoRef = useRef(null);
  const videoTitleRef = useRef(null);
  const lecturesRef = useRef(null);

  const showNotification = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const scrollToLectures = () => {
    if (lecturesRef.current) {
      const offset = lecturesRef.current.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: offset, behavior: 'smooth' });
    }
  };

  const toggleAccordion = (index) => {
    setExpandedAccordion(expandedAccordion === index ? null : index);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleWatchClick = async (index) => {
    // Validate index is within bounds
    const validIndex = Math.max(0, Math.min(index, courseData.lectures.length - 1));
    
    // Update URL with the new lecture index
    navigate(`/course/${id}/${validIndex}`, { replace: true });
    setSelectedLecture(validIndex);

    // Scroll to video section
    window.scrollTo({ top: videoTitleRef.current?.offsetTop - 500, behavior: 'smooth' });

    // Wait for the state to update and the video element to be available
    await new Promise(resolve => setTimeout(resolve, 100));
    
    if (videoRef.current) {
      // First load the new video source
      videoRef.current.load();
      
      // Then attempt to play (must be in a user-triggered event handler)
      const playPromise = videoRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch(error => {
            console.log("Auto-play prevented:", error);
            setIsPlaying(false);
          });
      }
    }
  };

  const toggleWatchLater = (lecture) => {
    if (watchLater.some(l => l._id === lecture._id)) {
      setWatchLater(watchLater.filter(l => l._id !== lecture._id));
      showNotification(`Removed from Watch Later: ${lecture.title}`);
    } else {
      setWatchLater([...watchLater, lecture]);
      showNotification(`Added to Watch Later: ${lecture.title}`);
    }
  };

  const markCompleted = (index) => {
    if (!completedLectures.includes(index)) {
      setCompletedLectures([...completedLectures, index]);
      showNotification(`Marked as completed: ${courseData.lectures[index].title}`);
    }
  };

  const handleVideoProgress = () => {
    if (videoRef.current) {
      const percent = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(percent);
    }
  };

  const handleVideoEnd = () => {
    markCompleted(selectedLecture);
    if (selectedLecture < courseData.lectures.length - 1) {
      setTimeout(() => {
        handleWatchClick(selectedLecture + 1);
        showNotification(`Starting next lecture: ${courseData.lectures[selectedLecture + 1].title}`);
      }, 1500);
    } else {
      showNotification("Congratulations! You've completed the course!");
    }
  };

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } }
  };

  const slideUp = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1]
      }
    }
  };

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(`course/get/${id}`, {
          headers: {
            Authorization: `Bearer ${currentUser.token}`
          }
        });
        setCourseData(response.data.data);
        setCompletedLectures([]);
        setWatchLater([]);

        let progress = 0;
        const interval = setInterval(() => {
          progress += Math.random() * 10 + 5;
          if (progress >= 100) {
            clearInterval(interval);
            setTimeout(() => setIsLoading(false), 300);
          }
          setProgress(progress);
        }, 150);

      } catch (error) {
        console.error('Failed to fetch course:', error);
        setIsLoading(false);
        showNotification('Failed to load course details');
      }
    };

    if (currentUser?.token) {
      fetchCourse();
    }
  }, [id, currentUser?.token]);

  useEffect(() => {
    // When course data loads or URL changes, set the selected lecture
    if (courseData.lectures && courseData.lectures.length > 0) {
      const initialLectureIndex = lectureIndex ? 
        Math.min(parseInt(lectureIndex), courseData.lectures.length - 1) : 
        0;
      
      setSelectedLecture(initialLectureIndex);
      
      // If URL doesn't have lecture index, redirect to include it
      if (!lectureIndex) {
        navigate(`/course/${id}/${initialLectureIndex}`, { replace: true });
      }
    }
  }, [courseData.lectures, lectureIndex, id, navigate]);

  if (isLoading) {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="d-flex flex-column align-items-center justify-content-center"
        style={{ height: '80vh' }}
      >
        <motion.div variants={pulse} className="text-center">
          <Spinner animation="grow" variant="primary" style={{ width: '5rem', height: '5rem' }} />
          <motion.h3 className="mt-4 gradient-text" variants={slideUp}>
            Preparing your learning experience...
          </motion.h3>
          <motion.div className="w-100 mt-4" variants={slideUp}>
            <ProgressBar now={progress} animated striped label={`${Math.round(progress)}%`} style={{ height: '10px' }} />
          </motion.div>
        </motion.div>
      </motion.div>
    );
  }

  const isCreator = currentUser?._id === (courseData.createdBy?._id || "");
  const totalLectures = courseData.lectures?.length || 0;
  const completedCount = completedLectures.length;
  const completionPercentage = totalLectures > 0 ? Math.round((completedCount / totalLectures) * 100) : 0;

  return (
    <>
      <ScrollToTop/>
      <ToastContainer position="top-center" className="p-3">
        <Toast show={showToast} onClose={() => setShowToast(false)} autohide>
          <Toast.Body className="d-flex align-items-center">
            <FontAwesomeIcon icon={faCheck} className="me-2" />
            {toastMessage}
          </Toast.Body>
        </Toast>
      </ToastContainer>

      {/* Course Header with responsive thumbnail */}
      <div className="bg-dark text-white py-5 position-relative" style={{
        minHeight: '400px',
        overflow: 'hidden'
      }}>
        {courseData.thumbnail?.url && (
          <div className="position-absolute top-0 start-0 w-100 h-100">
            <img
              src={courseData.thumbnail.url || "https://via.placeholder.com/800x450?text=Course+Thumbnail"}
              alt="Course thumbnail"
              className="w-100 h-100 object-fit-cover"
              style={{
                objectFit: 'cover',
                opacity: 0.3,
                filter: 'blur(2px)'
              }}
            />
            <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-70"></div>
          </div>
        )}

        <Container className="position-relative" style={{ zIndex: 1 }}>
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="d-flex align-items-center mb-3">
              <Badge pill bg="warning" className="me-2">
                <FontAwesomeIcon icon={faStar} className="me-1" />
                Featured
              </Badge>
              <Badge pill bg="info">
                {courseData.category || "General"}
              </Badge>
            </div>

            <h1 className="display-4 fw-bold mb-3">
              {courseData.name || "Course Title"}
            </h1>

            <p className="lead mb-4">
              {courseData.description || "Master this subject with our comprehensive course"}
            </p>

            <div className="d-flex flex-wrap align-items-center gap-3 mb-4">
              <div className="d-flex align-items-center">
                <img
                  src={courseData.createdBy?.avatar?.url || "https://i.pravatar.cc/150"}
                  alt="Instructor"
                  className="rounded-circle me-2"
                  width="40"
                  height="40"
                />
                <div>
                  <span className="d-block fw-semibold">
                    {courseData.createdBy?.name || "Instructor"}
                    {isCreator && (
                      <Badge bg="light" text="dark" className="ms-2">
                        Instructor
                      </Badge>
                    )}
                  </span>
                  <small className="text-white-50">{courseData.level || "Beginner"} Level</small>
                </div>
              </div>

              <div className="vr text-white-50 mx-2"></div>

              <div className="d-flex align-items-center">
                <FontAwesomeIcon icon={faVideo} className="me-2" />
                <span>{totalLectures} Lectures</span>
              </div>

              <div className="vr text-white-50 mx-2"></div>

              <div className="d-flex align-items-center">
                <FontAwesomeIcon icon={faClock} className="me-2" />
                <span>{courseData.duration || "0 hours"}</span>
              </div>
            </div>

            <div className="d-flex flex-wrap gap-3">
              <Button variant="primary" size="lg" onClick={scrollToLectures}>
                <FontAwesomeIcon icon={faPlay} className="me-2" />
                Start Learning
              </Button>
              <Button variant="outline-light" size="lg" onClick={() => showNotification("Feature coming soon!")}>
                <FontAwesomeIcon icon={faBookmark} className="me-2" />
                Save Course
              </Button>
            </div>
          </motion.div>
        </Container>
      </div>

      {/* Main Content */}
      <Container className="my-5">
        <Row className="g-4">
          <Col lg={8}>
            {/* Video Player Section */}
            <div className="mb-5">
              <div className="ratio ratio-16x9 rounded-3 overflow-hidden shadow-lg mb-4">
                {totalLectures > 0 ? (
                  <video
                    ref={videoRef}
                    src={courseData.lectures[selectedLecture]?.videos[0].url || ""}
                    controls
                    poster={courseData.thumbnail?.url || ""}
                    className="bg-dark"
                    onTimeUpdate={handleVideoProgress}
                    onEnded={handleVideoEnd}
                    key={selectedLecture}
                  />
                ) : (
                  <div className="bg-dark d-flex flex-column align-items-center justify-content-center text-white">
                    <FontAwesomeIcon icon={faVideo} size="3x" className="mb-3" />
                    <h4>No lectures available yet</h4>
                    {isCreator && (
                      <Button variant="primary" className="mt-3">
                        Add Your First Lecture
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {totalLectures > 0 && (
                <>
                  <div ref={videoTitleRef} className="d-flex justify-content-between align-items-center mb-3">
                    <h3 className="mb-0">
                      {courseData.lectures[selectedLecture]?.title || "Lecture Title"}
                      {completedLectures.includes(selectedLecture) && (
                        <Badge bg="success" className="ms-2">
                          <FontAwesomeIcon icon={faCheck} className="me-1" />
                          Completed
                        </Badge>
                      )}
                    </h3>
                    <div className="d-flex gap-2">
                      <Button
                        variant={watchLater.some(l => l._id === courseData.lectures[selectedLecture]._id) ? "warning" : "outline-secondary"}
                        size="sm"
                        onClick={() => toggleWatchLater(courseData.lectures[selectedLecture])}
                      >
                        <FontAwesomeIcon icon={faBookmark} />
                      </Button>
                      <Button
                        variant={completedLectures.includes(selectedLecture) ? "success" : "outline-success"}
                        size="sm"
                        onClick={() => markCompleted(selectedLecture)}
                      >
                        <FontAwesomeIcon icon={faCheck} />
                      </Button>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="lead">
                      {courseData.lectures[selectedLecture]?.description || "No description available"}
                    </p>
                  </div>

                  <div className="d-flex gap-3 mb-5">
                    {selectedLecture > 0 && (
                      <Button variant="outline-primary" onClick={() => handleWatchClick(selectedLecture - 1)}>
                        <FontAwesomeIcon icon={faArrowLeft} className="me-2 flip-x" />
                        Previous
                      </Button>
                    )}
                    {selectedLecture < totalLectures - 1 && (
                      <Button variant="primary" onClick={() => handleWatchClick(selectedLecture + 1)}>
                        Next Lecture
                        <FontAwesomeIcon icon={faArrowRight} className="ms-2" />
                      </Button>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Curriculum Section */}
            <div ref={lecturesRef} className="mb-5">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="h4 mb-0">
                  <FontAwesomeIcon icon={faListUl} className="me-2 text-primary" />
                  Course Curriculum
                </h2>
                <Badge bg="light" text="dark" pill>
                  {totalLectures} Lectures • {courseData.duration || "0 hours"}
                </Badge>
              </div>

              <Accordion activeKey={expandedAccordion} onSelect={toggleAccordion}>
                {(courseData.lectures || []).map((lecture, idx) => (
                  <Accordion.Item key={lecture._id || idx} eventKey={idx.toString()} className="mb-3">
                    <Accordion.Header className="p-3">
                      <div className="d-flex align-items-center justify-content-between w-100 pe-2">
                        <div className="d-flex align-items-center">
                          <FontAwesomeIcon icon={faPlay} className="me-3 text-primary" />
                          <div>
                            <div className="fw-semibold">
                              {lecture.title || "Lecture Title"}
                              {completedLectures.includes(idx) && (
                                <Badge bg="success" className="ms-2">
                                  <FontAwesomeIcon icon={faCheck} className="me-1" />
                                  Completed
                                </Badge>
                              )}
                            </div>
                            <small className="text-muted d-block">
                              {lecture.description?.substring(0, 60) || 'No description'}...
                            </small>
                          </div>
                        </div>
                        <div className="d-flex align-items-center">
                          <Badge bg="light" text="dark" className="me-3">
                            <FontAwesomeIcon icon={faClock} className="me-1" />
                            {formatTime(lecture.duration || 0)}
                          </Badge>
                          <FontAwesomeIcon icon={faChevronDown} />
                        </div>
                      </div>
                    </Accordion.Header>
                    <Accordion.Body className="p-3 pt-0">
                      <div className="d-flex flex-column flex-md-row justify-content-between">
                        <div className="mb-3 mb-md-0">
                          <h6 className="fw-semibold">About this lecture:</h6>
                          <p>{lecture.description || "No detailed description available"}</p>
                        </div>
                        <div className="d-flex gap-2">
                          <Button variant="primary" onClick={() => handleWatchClick(idx)}>
                            <FontAwesomeIcon icon={faPlay} className="me-2" />
                            Watch
                          </Button>
                          <Button
                            variant={watchLater.some(l => l._id === lecture._id) ? "warning" : "outline-secondary"}
                            onClick={() => toggleWatchLater(lecture)}
                          >
                            <FontAwesomeIcon icon={faBookmark} className="me-2" />
                            {watchLater.some(l => l._id === lecture._id) ? "Saved" : "Watch Later"}
                          </Button>
                        </div>
                      </div>
                    </Accordion.Body>
                  </Accordion.Item>
                ))}
              </Accordion>
            </div>

            {/* Course Description */}
            <div className="mb-5">
              <h2 className="h4 mb-3">
                <FontAwesomeIcon icon={faBookOpen} className="me-2 text-primary" />
                About This Course
              </h2>
              <div className="bg-light p-4 rounded-3">
                <p className="mb-0">
                  {courseData.description || "This comprehensive course provides in-depth knowledge and practical skills."}
                </p>
              </div>
            </div>
          </Col>

          <Col lg={4}>
            {/* Progress Card */}
            <div className="card mb-4">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h3 className="h5 mb-0">
                    <FontAwesomeIcon icon={faChartLine} className="me-2 text-primary" />
                    Your Progress
                  </h3>
                  <Badge bg="light" text="dark" pill>
                    {completedCount}/{totalLectures}
                  </Badge>
                </div>
                <ProgressBar now={completionPercentage} label={`${completionPercentage}%`} className="mb-3" />
                <Button
                  variant="primary"
                  className="w-100"
                  onClick={() => {
                    if (completedCount < totalLectures) {
                      handleWatchClick(completedCount);
                    }
                  }}
                >
                  {completedCount === totalLectures ? (
                    <>
                      <FontAwesomeIcon icon={faCheck} className="me-2" />
                      Course Completed!
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faPlay} className="me-2" />
                      Continue Learning
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Course Details Card */}
            <div className="card mb-4">
              <div className="card-body">
                <h3 className="h5 mb-3">
                  <FontAwesomeIcon icon={faGraduationCap} className="me-2 text-primary" />
                  Course Details
                </h3>
                <ul className="list-unstyled">
                  <li className="mb-2 d-flex justify-content-between">
                    <span className="text-muted">Category:</span>
                    <span className="fw-semibold">{courseData.category || "General"}</span>
                  </li>
                  <li className="mb-2 d-flex justify-content-between">
                    <span className="text-muted">Level:</span>
                    <span className="fw-semibold">{courseData.level || "Beginner"}</span>
                  </li>
                  <li className="mb-2 d-flex justify-content-between">
                    <span className="text-muted">Duration:</span>
                    <span className="fw-semibold">{courseData.duration || "0 hours"}</span>
                  </li>
                  <li className="mb-2 d-flex justify-content-between">
                    <span className="text-muted">Lectures:</span>
                    <span className="fw-semibold">{totalLectures}</span>
                  </li>
                  <li className="mb-2 d-flex justify-content-between">
                    <span className="text-muted">Created:</span>
                    <span className="fw-semibold">
                      {new Date(courseData.createdAt).toLocaleDateString()}
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Watch Later Card */}
            <div className="card">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h3 className="h5 mb-0">
                    <FontAwesomeIcon icon={faBookmark} className="me-2 text-warning" />
                    Watch Later
                  </h3>
                  <Badge bg="warning" pill>
                    {watchLater.length}
                  </Badge>
                </div>
                {watchLater.length === 0 ? (
                  <div className="text-center py-3">
                    <FontAwesomeIcon icon={faBookmark} size="2x" className="mb-3 text-muted" />
                    <p className="text-muted">No lectures saved yet</p>
                  </div>
                ) : (
                  <div className="list-group list-group-flush">
                    {watchLater.map((lecture) => (
                      <div key={lecture._id} className="list-group-item d-flex justify-content-between align-items-center">
                        <span className="text-truncate" style={{ maxWidth: '70%' }}>{lecture.title || "Lecture"}</span>
                        <Button
                          variant="link"
                          size="sm"
                          className="text-danger p-0"
                          onClick={() => toggleWatchLater(lecture)}
                        >
                          <FontAwesomeIcon icon={faTrashAlt} />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default CourseDetailsViewer;