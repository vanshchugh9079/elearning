import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { api } from '../utils/constant';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSave, FiPlus, FiTrash2, FiChevronRight, FiVideo, FiEdit2, FiX, FiCheck, FiUpload } from 'react-icons/fi';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import "../css/layoutComponet/editCourse.css"

const EditCourse = () => {
  const { id } = useParams();
  const { user } = useSelector((state) => state.user);
  const [course, setCourse] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [newLecture, setNewLecture] = useState({ title: '', description: '', videoUrl: '' });
  const [lectureFile, setLectureFile] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [deleteCourseLoading, setDeleteCourseLoading] = useState(false);
  const [expandedLecture, setExpandedLecture] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const navigate = useNavigate();

  const showError = (err) => {
    setError(err?.response?.data?.message || 'Something went wrong.');
    setTimeout(() => setError(''), 4000);
  };

  const showSuccess = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 4000);
  };

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await api.get(`course/get/${id}`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
        const fetchedCourse = res.data.data;
        setCourse(fetchedCourse);
        setTitle(fetchedCourse.name);
        setDescription(fetchedCourse.description);
      } catch (error) {
        showError(error);
      }
    };

    fetchCourse();
  }, [id, user.token]);

  const handleUpdateCourse = async () => {
    if (!title.trim() || !description.trim()) {
      showError("Please fill in all required fields");
      return;
    }

    setUpdateLoading(true);
    try {
      await api.put(`course/update/${id}`, {
        name: title,
        description: description,
      }, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      showSuccess("Course updated successfully!");
    } catch (err) {
      showError(err);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleAddLecture = async () => {
    if (!newLecture.title.trim() || !newLecture.description.trim() || !lectureFile) {
      setError("Please provide a title, description, and select a video file.");
      setTimeout(() => setError(''), 4000);
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("title", newLecture.title);
    formData.append("description", newLecture.description);
    formData.append("file", lectureFile);

    try {
      const res = await api.post(`course/${id}/add`, formData, {
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setCourse((prevCourse) => ({
        ...prevCourse,
        lectures: [...prevCourse.lectures, res.data.data],
      }));

      setNewLecture({ title: '', description: '', videoUrl: '' });
      setLectureFile(null);
      showSuccess("Lecture added successfully!");
    } catch (err) {
      showError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLecture = async (lectureId, e) => {
    e.stopPropagation();
    setDeleteLoading(lectureId);
    try {
      await api.delete(`course/lecture/${lectureId}`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      setCourse((prevCourse) => ({
        ...prevCourse,
        lectures: prevCourse.lectures.filter((lecture) => lecture._id !== lectureId),
      }));

      showSuccess("Lecture deleted!");
    } catch (err) {
      showError(err);
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleLectureClick = (lectureId) => {
    if (expandedLecture === lectureId) {
      setExpandedLecture(null);
    } else {
      setExpandedLecture(lectureId);
    }
  };

  const handleNavigateToLecture = (lectureIndex, e) => {
    e?.stopPropagation();
    navigate(`/course/${id}/${lectureIndex}`);
  };

  const handleDeleteCourse = async () => {
    setDeleteCourseLoading(true);
    try {
      await api.delete(`course/${id}`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      showSuccess("Course deleted successfully!");
      setTimeout(() => {
        navigate("/course");
      }, 1500);
    } catch (error) {
      showError(error);
    } finally {
      setDeleteCourseLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        when: "beforeChildren"
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.4,
        ease: "easeOut"
      } 
    },
    hover: {
      y: -5,
      boxShadow: "0 15px 30px rgba(0, 0, 0, 0.1)"
    }
  };

  const lectureItemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { 
      opacity: 1, 
      x: 0, 
      transition: { 
        duration: 0.3,
        ease: "backOut"
      } 
    },
    hover: { 
      scale: 1.01,
      boxShadow: "0 10px 25px rgba(0,0,0,0.1)"
    },
    tap: { scale: 0.98 }
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.3 }
    }
  };

  const buttonHover = {
    scale: 1.05,
    boxShadow: "0 5px 15px rgba(0, 0, 0, 0.1)"
  };

  const buttonTap = {
    scale: 0.98
  };

  return (
    <motion.div 
      className="container py-5 px-3 px-md-4 px-lg-5 text-black"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      style={{
        background: "radial-gradient(circle at top right, rgba(245,245,255,0.8) 0%, rgba(240,248,255,0.9) 100%)",
        minHeight: "100vh"
      }}
    >
      <motion.div 
        className="text-center mb-5"
        variants={fadeIn}
      >
        <motion.h2 
          className="mb-3 fw-bold"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, type: "spring", stiffness: 100 }}
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            display: "inline-block"
          }}
        >
          Edit Course
        </motion.h2>
        <motion.p 
          className="text-muted"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Manage your course content and structure
        </motion.p>
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.div
            className="alert alert-danger alert-dismissible fade show d-flex align-items-center"
            role="alert"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex-grow-1">{error}</div>
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => setError('')}
              aria-label="Close"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {success && (
          <motion.div
            className="alert alert-success alert-dismissible fade show d-flex align-items-center"
            role="alert"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <FiCheck className="me-2" size={18} />
            <div className="flex-grow-1">{success}</div>
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => setSuccess('')}
              aria-label="Close"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {!course ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <motion.div variants={containerVariants}>
          {/* Course Thumbnail */}
          <motion.div 
            className="text-center mb-5"
            variants={fadeIn}
          >
            <motion.div
              className="thumbnail-container mx-auto position-relative"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
              style={{
                maxWidth: "600px",
                borderRadius: "20px",
                overflow: "hidden",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)"
              }}
            >
              <img
                src={course.thumbnail?.url}
                alt="Course Thumbnail"
                className="img-fluid w-100"
                style={{ 
                  height: "280px", 
                  objectFit: "cover",
                }}
              />
              <div 
                className="position-absolute top-0 start-0 w-100 h-100"
                style={{
                  background: "linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.3) 100%)"
                }}
              />
            </motion.div>
          </motion.div>

          {/* Course Details Card */}
          <motion.div 
            className="card p-4 mb-5 rounded-4 border-0 text-black"
            variants={cardVariants}
            whileHover="hover"
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.9) 100%)",
              backdropFilter: "blur(10px)",
              boxShadow: "0 8px 32px rgba(31, 38, 135, 0.1)",
              border: "1px solid rgba(255, 255, 255, 0.2)"
            }}
          >
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4 className="mb-0 d-flex align-items-center">
                <FiEdit2 className="me-2" style={{ color: "#667eea" }} /> 
                <span style={{
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent"
                }}>
                  Course Details
                </span>
              </h4>
              <motion.button 
                className="btn d-flex align-items-center"
                onClick={handleUpdateCourse} 
                disabled={updateLoading}
                whileHover={buttonHover}
                whileTap={buttonTap}
                data-tooltip-id="save-tooltip"
                style={{
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: "12px"
                }}
              >
                {updateLoading ? (
                  <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                ) : <FiSave className="me-1" />}
                Save Changes
              </motion.button>
              <ReactTooltip id="save-tooltip" place="top" effect="solid" content="Save course changes" />
            </div>
            
            <div className="row g-3 text-black">
              <div className="col-md-6">
                <label className="form-label fw-bold">Course Title</label>
                <input
                  type="text"
                  className="form-control form-control-lg border-0 text-black shadow-sm"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter course title"
                  style={{
                    background: "rgba(255,255,255,0.8)",
                    borderRadius: "12px",
                    padding: "12px 16px"
                  }}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">Thumbnail</label>
                <div className="input-group">
                  <input
                    type="file"
                    className="form-control form-control-lg border-0 shadow-sm"
                    accept="image/*"
                    disabled
                    style={{
                      background: "rgba(255,255,255,0.8)",
                      borderRadius: "12px",
                      padding: "12px 16px"
                    }}
                  />
                  <motion.button 
                    className="btn border-0"
                    type="button" 
                    disabled
                    whileHover={buttonHover}
                    whileTap={buttonTap}
                    style={{
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      color: "white",
                      borderRadius: "12px"
                    }}
                  >
                    Change
                  </motion.button>
                </div>
                <small className="text-muted">Thumbnail updates coming soon</small>
              </div>
              <div className="col-12">
                <label className="form-label fw-bold">Description</label>
                <textarea
                  className="form-control border-0 shadow-sm"
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter detailed course description"
                  style={{
                    background: "rgba(255,255,255,0.8)",
                    borderRadius: "12px",
                    padding: "12px 16px",
                    minHeight: '120px'
                  }}
                />
              </div>
            </div>
          </motion.div>

          {/* Add New Lecture Card */}
          <motion.div 
            className="card p-4 mb-5 rounded-4 border-0"
            variants={cardVariants}
            whileHover="hover"
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.9) 100%)",
              backdropFilter: "blur(10px)",
              boxShadow: "0 8px 32px rgba(31, 38, 135, 0.1)",
              border: "1px solid rgba(255, 255, 255, 0.2)"
            }}
          >
            <h4 className="mb-4 d-flex align-items-center">
              <FiPlus className="me-2" style={{ color: "#667eea" }} /> 
              <span style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent"
              }}>
                Add New Lecture
              </span>
            </h4>
            
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-bold">Lecture Title</label>
                <input
                  type="text"
                  className="form-control border-0 shadow-sm"
                  value={newLecture.title}
                  onChange={(e) => setNewLecture({ ...newLecture, title: e.target.value })}
                  placeholder="Enter lecture title"
                  style={{
                    background: "rgba(255,255,255,0.8)",
                    borderRadius: "12px",
                    padding: "12px 16px"
                  }}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold d-flex align-items-center gap-2">
                  <FiVideo style={{ color: "#667eea" }} /> Lecture Video
                </label>
                <div className="input-group">
                  <input
                    type="file"
                    className="form-control border-0 shadow-sm"
                    accept="video/*"
                    onChange={(e) => setLectureFile(e.target.files[0])}
                    id="lectureFileInput"
                    style={{
                      background: "rgba(255,255,255,0.8)",
                      borderRadius: "12px",
                      padding: "12px 16px"
                    }}
                  />
                  <motion.label 
                    className="input-group-text d-flex align-items-center justify-content-center"
                    htmlFor="lectureFileInput"
                    whileHover={buttonHover}
                    whileTap={buttonTap}
                    style={{
                      cursor: 'pointer',
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      color: "white",
                      border: "none",
                      borderRadius: "12px"
                    }}
                  >
                    <FiUpload className="me-1" /> Browse
                  </motion.label>
                </div>
                {lectureFile && (
                  <div className="mt-2 d-flex align-items-center" style={{ color: "#667eea" }}>
                    <FiCheck className="me-1" /> {lectureFile.name}
                  </div>
                )}
              </div>
              <div className="col-12">
                <label className="form-label fw-bold">Lecture Description</label>
                <textarea
                  className="form-control border-0 shadow-sm"
                  rows={3}
                  value={newLecture.description}
                  onChange={(e) => setNewLecture({ ...newLecture, description: e.target.value })}
                  placeholder="Enter lecture description"
                  style={{
                    background: "rgba(255,255,255,0.8)",
                    borderRadius: "12px",
                    padding: "12px 16px",
                    minHeight: '100px'
                  }}
                />
              </div>
              <div className="col-12 text-end">
                <motion.button 
                  className="btn px-4 py-2 d-inline-flex align-items-center gap-2"
                  onClick={handleAddLecture} 
                  disabled={loading}
                  whileHover={buttonHover}
                  whileTap={buttonTap}
                  data-tooltip-id="add-lecture-tooltip"
                  style={{
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "white",
                    border: "none",
                    borderRadius: "12px",
                    boxShadow: "0 4px 15px rgba(102, 126, 234, 0.3)"
                  }}
                >
                  {loading ? (
                    <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                  ) : <FiPlus className="me-1" />}
                  Add Lecture
                </motion.button>
                <ReactTooltip id="add-lecture-tooltip" place="top" effect="solid" content="Add a new lecture to your course" />
              </div>
            </div>
          </motion.div>

          {/* Course Lectures Card */}
          <motion.div 
            className="card p-4 rounded-4 border-0"
            variants={cardVariants}
            whileHover="hover"
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.9) 100%)",
              backdropFilter: "blur(10px)",
              boxShadow: "0 8px 32px rgba(31, 38, 135, 0.1)",
              border: "1px solid rgba(255, 255, 255, 0.2)"
            }}
          >
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4 className="mb-0" style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent"
              }}>
                Course Lectures
              </h4>
              <div className="badge rounded-pill" style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                padding: "8px 16px",
                fontSize: "0.9rem"
              }}>
                {course.lectures?.length || 0} lectures
              </div>
            </div>
            
            {course.lectures?.length > 0 ? (
              <div className="list-group list-group-flush">
                <AnimatePresence>
                  {course.lectures.map((lecture, index) => (
                    <motion.div
                      key={lecture._id}
                      className="list-group-item list-group-item-action rounded-3 mb-3 p-0 overflow-hidden"
                      style={{ 
                        cursor: 'pointer',
                        borderLeft: '4px solid #667eea',
                        background: "rgba(255,255,255,0.7)",
                        boxShadow: "0 4px 6px rgba(0,0,0,0.05)"
                      }}
                      onClick={() => handleLectureClick(lecture._id)}
                      variants={lectureItemVariants}
                      whileHover="hover"
                      whileTap="tap"
                      layout
                    >
                      <div className="p-3">
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="d-flex align-items-center gap-3">
                            <div 
                              className="text-white rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" 
                              style={{ 
                                width: '40px', 
                                height: '40px',
                                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                boxShadow: "0 4px 8px rgba(102, 126, 234, 0.3)"
                              }}
                            >
                              {index + 1}
                            </div>
                            <div>
                              <h5 className="mb-1">{lecture.title}</h5>
                              <p className="mb-0 text-muted">{lecture.description.substring(0, 70)}...</p>
                            </div>
                          </div>
                          <div className="d-flex gap-2">
                            <motion.button
                              className="btn btn-sm rounded-circle d-flex align-items-center justify-content-center"
                              style={{ 
                                width: '32px', 
                                height: '32px',
                                background: "rgba(102, 126, 234, 0.1)",
                                color: "#667eea"
                              }}
                              onClick={(e) => handleNavigateToLecture(index + 1, e)}
                              data-tooltip-id={`view-lecture-${index}-tooltip`}
                              whileHover={{ 
                                scale: 1.1,
                                background: "rgba(102, 126, 234, 0.2)"
                              }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <FiChevronRight size={16} />
                            </motion.button>
                            <motion.button
                              className="btn btn-sm rounded-circle d-flex align-items-center justify-content-center"
                              style={{ 
                                width: '32px', 
                                height: '32px',
                                background: "rgba(247, 37, 133, 0.1)",
                                color: "#f72585"
                              }}
                              disabled={deleteLoading === lecture._id}
                              onClick={(e) => handleDeleteLecture(lecture._id, e)}
                              data-tooltip-id={`delete-lecture-${index}-tooltip`}
                              whileHover={{ 
                                scale: 1.1,
                                background: "rgba(247, 37, 133, 0.2)"
                              }}
                              whileTap={{ scale: 0.9 }}
                            >
                              {deleteLoading === lecture._id ? (
                                <span className="spinner-border spinner-border-sm" role="status"></span>
                              ) : <FiTrash2 size={14} />}
                            </motion.button>
                            
                            <ReactTooltip 
                              id={`view-lecture-${index}-tooltip`} 
                              place="top" 
                              effect="solid" 
                              content="View this lecture" 
                            />
                            <ReactTooltip 
                              id={`delete-lecture-${index}-tooltip`} 
                              place="top" 
                              effect="solid" 
                              content="Delete this lecture" 
                            />
                          </div>
                        </div>
                      </div>
                      
                      <AnimatePresence>
                        {expandedLecture === lecture._id && (
                          <motion.div
                            className="px-3 pb-3 pt-0"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ 
                              opacity: 1, 
                              height: 'auto',
                              transition: { duration: 0.3 }
                            }}
                            exit={{ 
                              opacity: 0, 
                              height: 0,
                              transition: { duration: 0.2 }
                            }}
                          >
                            <div className="border-top pt-3">
                              <p className="mb-2 fw-bold">Full Description:</p>
                              <p className="mb-3">{lecture.description}</p>
                              <div className="d-flex justify-content-end">
                                <motion.button 
                                  className="btn btn-sm d-flex align-items-center gap-1"
                                  onClick={(e) => handleNavigateToLecture(index + 1, e)}
                                  whileHover={buttonHover}
                                  whileTap={buttonTap}
                                  style={{
                                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "12px",
                                    padding: "6px 12px"
                                  }}
                                >
                                  Go to Lecture <FiChevronRight />
                                </motion.button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <motion.div 
                className="text-center py-5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="mb-4">
                  <FiVideo size={64} className="opacity-25" style={{ color: "#667eea" }} />
                </div>
                <h5 className="text-muted mb-2">No lectures added yet</h5>
                <p className="text-muted">Start by adding your first lecture above</p>
              </motion.div>
            )}
          </motion.div>

          {/* Delete Course Section */}
          <motion.div 
            className="text-center mt-5 pt-3"
            variants={fadeIn}
          >
            {!showDeleteConfirm ? (
              <motion.button
                className="btn px-4 py-2 d-inline-flex align-items-center gap-2"
                onClick={() => setShowDeleteConfirm(true)}
                whileHover={buttonHover}
                whileTap={buttonTap}
                data-tooltip-id="delete-course-tooltip"
                style={{
                  background: "linear-gradient(135deg, #f72585 0%, #b5179e 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  boxShadow: "0 4px 15px rgba(247, 37, 133, 0.3)"
                }}
              >
                <FiTrash2 /> Delete This Course
              </motion.button>
            ) : (
              <motion.div 
                className="delete-confirmation p-4 rounded-3"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{
                  background: "linear-gradient(135deg, rgba(247, 37, 133, 0.05) 0%, rgba(255, 255, 255, 1) 100%)",
                  border: "1px solid rgba(247, 37, 133, 0.2)",
                  maxWidth: "500px",
                  margin: "0 auto"
                }}
              >
                <p className="fw-bold mb-3">Are you sure you want to delete this course? This action cannot be undone.</p>
                <div className="d-flex justify-content-center gap-3">
                  <motion.button
                    className="btn px-3 py-1 d-flex align-items-center"
                    onClick={() => setShowDeleteConfirm(false)}
                    whileHover={buttonHover}
                    whileTap={buttonTap}
                    style={{
                      background: "rgba(0,0,0,0.05)",
                      border: "1px solid rgba(0,0,0,0.1)",
                      borderRadius: "12px"
                    }}
                  >
                    <FiX className="me-1" /> Cancel
                  </motion.button>
                  <motion.button
                    className="btn px-3 py-1 d-flex align-items-center"
                    onClick={handleDeleteCourse}
                    disabled={deleteCourseLoading}
                    whileHover={buttonHover}
                    whileTap={buttonTap}
                    style={{
                      background: "linear-gradient(135deg, #f72585 0%, #b5179e 100%)",
                      color: "white",
                      border: "none",
                      borderRadius: "12px"
                    }}
                  >
                    {deleteCourseLoading ? (
                      <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                    ) : <FiTrash2 className="me-1" />}
                    Confirm Delete
                  </motion.button>
                </div>
              </motion.div>
            )}
            <ReactTooltip id="delete-course-tooltip" place="top" effect="solid" content="Permanently delete this course" />
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default EditCourse;