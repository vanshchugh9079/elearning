import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { useSelector,useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/constant';
import { motion } from 'framer-motion';
import { setUserData } from "../redux/slice/userSlice";
const ProfilePage = () => {
  const { token } = useSelector(state => state.user.user);
  const dispatch=useDispatch();
  // const { user } = useSelector(state => state.user);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    window.localStorage.clear();
    dispatch(setUserData({
      user:{},
      loggedIn:false
    }))
    navigate("/");
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };
  const [editData, setEditData] = useState({
    name: '',
    email: '',
    bio: ''
  });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await api.get("user/profile", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = response.data;
        setUser(data);

        setEditData({
          name: data.name || '',
          email: data.email || '',
          bio: data.bio || ''
        });
      } catch (err) {
        console.error("Error fetching user profile", err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchProfile();
  }, [token]);

  const handleChange = (e) => {
    setEditData({
      ...editData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async () => {
    try {
      await api.put("user/profile", editData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setUser(prev => ({
        ...prev,
        ...editData
      }));

      const modal = bootstrap.Modal.getInstance(document.getElementById('editProfileModal'));
      modal.hide();

      // Show success toast
      const toast = new bootstrap.Toast(document.getElementById('saveSuccessToast'));
      toast.show();
    } catch (err) {
      console.error("Error saving profile", err);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-gradient-primary">
        <div className="spinner-border text-light" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid profile-container p-0 position-relative">
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
      {/* Background gradient animation */}
      <div className="position-fixed w-100 h-100 bg-animation">
        <div className="gradient-circle top-left"></div>
        <div className="gradient-circle bottom-right"></div>
      </div>

      {/* Success Toast */}
      <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 11 }}>
        <div id="saveSuccessToast" className="toast" role="alert" aria-live="assertive" aria-atomic="true">
          <div className="toast-header bg-success text-white">
            <strong className="me-auto">Success</strong>
            <button type="button" className="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
          </div>
          <div className="toast-body">
            Profile updated successfully!
          </div>
        </div>
      </div>

      <div className="row g-0" style={{ minHeight: '100vh', position: 'relative' }}>
        {/* Sidebar */}
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="col-lg-3 col-md-4 bg-white d-flex flex-column justify-content-between p-4 shadow-lg"
          style={{ zIndex: 10 }}
        >
          <div>
            <div className="card text-center border-0 bg-transparent">
              <div className="card-body">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="avatar-container mb-4"
                >
                  <img
                    src={user.user?.avatar?.url || "https://via.placeholder.com/150"}
                    alt="Avatar"
                    className="rounded-circle img-thumbnail shadow-sm"
                    width="150"
                    height="150"
                  />
                </motion.div>
                <h3 className="fw-bold mb-2">{user?.user.name}</h3>
                <p className="text-muted mb-3">{user?.user.email}</p>
                <p className="text-muted mb-4">{user?.user?.bio || "No bio yet"}</p>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn btn-primary btn-gradient rounded-pill px-4"
                  data-bs-toggle="modal"
                  data-bs-target="#editProfileModal"
                >
                  <i className="bi bi-pencil-fill me-2"></i>Edit Profile
                </motion.button>
              </div>
            </div>
          </div>

          {/* Logout */}
          <div className="text-center">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="btn btn-outline-danger rounded-pill px-4 w-100"
              onClick={handleLogout}
            >
              <i className="bi bi-box-arrow-right me-2"></i>Logout
            </motion.button>
          </div>
        </motion.div>

        {/* Main content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="col-lg-9 col-md-8 p-4 p-lg-5"
          style={{ overflowY: 'auto', maxHeight: '100vh', position: 'relative', zIndex: 10 }}
        >
          <h2 className="fw-bold mb-4 text-white">Dashboard</h2>


          {/* Enrolled Courses */}
          <motion.div
            whileHover={{ y: -5 }}
            className="card shadow-lg rounded-4 border-0 mb-4 bg-glass"
          >
            <div className="card-header bg-primary bg-gradient text-white rounded-top-4">
              <h4 className="mb-0">
                <i className="bi bi-book me-2"></i>Enrolled Courses
              </h4>
            </div>
            <div className="card-body">
              {user?.subscription && user?.subscription?.length > 0 ? (
                <div className="row g-4">
                  {user.subscription.map(course => (
                    <div key={course._id} className="col-md-6">
                      <div className="card h-100 border-0 shadow-sm">
                        <div className="card-body">
                          <h5 className="card-title">{course.name}</h5>
                          <div className="progress mb-3" style={{ height: '10px' }}>
                            <div
                              className="progress-bar bg-success progress-bar-striped progress-bar-animated"
                              role="progressbar"
                              style={{
                                width: `${course.watchedPercentage?.toFixed(0) || 0}%`
                              }}
                              aria-valuenow={course.watchedPercentage || 0}
                              aria-valuemin="0"
                              aria-valuemax="100"
                            >
                            </div>
                          </div>
                          <div className="d-flex justify-content-between">
                            <span className="badge bg-primary">
                              {course.watchedPercentage?.toFixed(0) || 0}% Complete
                            </span>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => navigate(`/course/${course._id}`)}
                            >
                              Continue
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <i className="bi bi-book text-muted" style={{ fontSize: '3rem', opacity: 0.5 }}></i>
                  <h5 className="mt-3">No courses enrolled yet</h5>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn btn-primary mt-3"
                    onClick={() => navigate('/courses')}
                  >
                    Browse Courses
                  </motion.button>
                </div>
              )}
            </div>
          </motion.div>

          {/* Created Courses */}
          <motion.div
            whileHover={{ y: -5 }}
            className="card shadow-lg rounded-4 border-0 bg-glass"
          >
            <div className="card-header bg-success bg-gradient text-white rounded-top-4">
              <h4 className="mb-0">
                <i className="bi bi-mortarboard me-2"></i>Your Created Courses
              </h4>
            </div>
            <div className="card-body">
              {user?.createdCourses && user?.createdCourses?.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Course Name</th>
                        <th>Students</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {user.createdCourses.map(course => (
                        <tr key={course._id}>
                          <td>
                            <strong>{course.name}</strong>
                          </td>
                          <td>
                            <span className="badge bg-info">
                              {course.enrolledStudents || 0} students
                            </span>
                          </td>
                          <td>
                            <div className="d-flex gap-2">
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="btn btn-sm btn-warning"
                                onClick={() => navigate(`/course/edit/${course._id}`)}
                              >
                                <i className="bi bi-plus-circle me-1"></i>Add Lecture
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="btn btn-sm btn-primary"
                                onClick={() => navigate(`/course/${course._id}`)}
                              >
                                <i className="bi bi-arrow-right me-1"></i>View
                              </motion.button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4">
                  <i className="bi bi-mortarboard text-muted" style={{ fontSize: '3rem', opacity: 0.5 }}></i>
                  <h5 className="mt-3">You haven't created any courses yet</h5>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn btn-success mt-3"
                    onClick={() => navigate('/create-course')}
                  >
                    Create Your First Course
                  </motion.button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Edit Profile Modal */}
      <div className="modal fade" id="editProfileModal" tabIndex="-1" aria-labelledby="editProfileModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content rounded-4 border-0 shadow-lg">
            <div className="modal-header bg-primary text-white rounded-top-4">
              <h5 className="modal-title" id="editProfileModalLabel">
                <i className="bi bi-person-gear me-2"></i>Edit Profile
              </h5>
              <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <form>
                <div className="mb-3">
                  <label className="form-label">Name</label>
                  <input
                    type="text"
                    className="form-control rounded-3"
                    name="name"
                    value={editData.name}
                    onChange={handleChange}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control rounded-3"
                    name="email"
                    value={editData.email}
                    onChange={handleChange}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Bio</label>
                  <textarea
                    className="form-control rounded-3"
                    name="bio"
                    rows="3"
                    value={editData.bio}
                    onChange={handleChange}
                    placeholder="Tell us about yourself..."
                  ></textarea>
                </div>
              </form>
            </div>
            <div className="modal-footer border-0">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                type="button"
                className="btn btn-secondary rounded-pill px-4"
                data-bs-dismiss="modal"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                type="button"
                className="btn btn-primary rounded-pill px-4"
                onClick={handleSave}
              >
                Save Changes
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <div className="modal fade" id="logoutConfirmModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content rounded-4 border-0 shadow-lg">
            <div className="modal-header bg-danger text-white rounded-top-4">
              <h5 className="modal-title">
                <i className="bi bi-exclamation-triangle me-2"></i>Confirm Logout
              </h5>
              <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
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
                data-bs-dismiss="modal"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                type="button"
                className="btn btn-danger rounded-pill px-4"
                id="confirmLogoutBtn"
                data-bs-dismiss="modal"
              >
                Yes, Logout
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

// Add this CSS to your global styles
const styles = `
.profile-container {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  max-height:90vh;
  overflow-y:scroll;
}
.bg-glass {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.18);
}

.bg-gradient-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.btn-gradient {
  background: linear-gradient(to right, #4facfe 0%, #00f2fe 100%);
  border: none;
  color: white;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.bg-animation {
  overflow: hidden;
  z-index: 1;
}

.gradient-circle {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.3;
}

.gradient-circle.top-left {
  width: 300px;
  height: 300px;
  top: -100px;
  left: -100px;
  background: radial-gradient(circle, #4facfe 0%, #00f2fe 100%);
}

.gradient-circle.bottom-right {
  width: 400px;
  height: 400px;
  bottom: -150px;
  right: -150px;
  background: radial-gradient(circle, #764ba2 0%, #667eea 100%);
}

.avatar-container {
  position: relative;
  display: inline-block;
}

.avatar-container::after {
  content: '';
  position: absolute;
  top: -5px;
  left: -5px;
  right: -5px;
  bottom: -5px;
  border-radius: 50%;
  background: linear-gradient(45deg, #4facfe, #00f2fe, #764ba2, #667eea);
  background-size: 400% 400%;
  z-index: -1;
  animation: gradientBorder 6s ease infinite;
  filter: blur(10px);
  opacity: 0.7;
}

@keyframes gradientBorder {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1) !important;
}

.progress-bar-animated {
  animation: progressAnimation 2s ease-in-out infinite;
}

@keyframes progressAnimation {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}
`;

// Add the styles to the document
const styleElement = document.createElement('style');
styleElement.innerHTML = styles;
document.head.appendChild(styleElement);