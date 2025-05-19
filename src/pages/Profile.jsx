import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/constant';

const ProfilePage = () => {
  const { token } = useSelector(state => state.user.user);
  const [user, setUser] = useState({});
  const [editData, setEditData] = useState({
    name: '',
    email: '',
    bio: ''
  });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
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

  const handleSave = () => {
    setUser((prev) => ({
      ...prev,
      name: editData.name,
      email: editData.email,
      bio: editData.bio
    }));

    const modal = bootstrap.Modal.getInstance(document.getElementById('editProfileModal'));
    modal.hide();
  };

  const handleLogout = () => {
    window.localStorage.clear();
    navigate("/");
  };

  return (
    <div className="container-fluid">
      <div className="row" style={{ height: '89.8vh' }}>
        {/* Sidebar */}
        <div className="col-md-4 bg-white d-flex flex-column justify-content-between p-3 shadow">
          <div>
            <div className="card text-center border-0">
              <div className="card-body">
                <img
                  src={user?.user?.avatar?.url || "https://via.placeholder.com/120"}
                  alt="Avatar"
                  className="rounded-circle mb-3"
                  width="120"
                  height="120"
                />
                <h4>{user?.user?.name}</h4>
                <p className="text-muted">{user?.user?.email}</p>
                <button
                  className="btn btn-outline-primary btn-sm mt-2"
                  data-bs-toggle="modal"
                  data-bs-target="#editProfileModal"
                >
                  Edit Profile
                </button>
              </div>
            </div>
          </div>

          {/* Logout */}
          <div className="text-center">
            <button className="btn btn-outline-danger w-100" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>

        {/* Main content */}
        <div className="col-md-8 p-4" style={{ overflowY: 'auto', maxHeight: '100vh' }}>
          {/* Enrolled Courses */}
          <div className="card shadow rounded-4 border-0 mb-4">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">Enrolled Courses</h5>
            </div>
            <div className="card-body">
              {user?.subscription && user?.subscription?.length > 0 ? (
                user.subscription.map(course => (
                  <div key={course._id} className="mb-4">
                    <h6>{course.name}</h6>
                    <div className="progress">
                      <div
                        className="progress-bar"
                        role="progressbar"
                        style={{
                          width: `${course.watchedPercentage?.toFixed(0) || 0}%`
                        }}
                        aria-valuenow={course.watchedPercentage || 0}
                        aria-valuemin="0"
                        aria-valuemax="100"
                      >
                        {course.watchedPercentage?.toFixed(0) || 0}%
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p>No courses enrolled yet.</p>
              )}
            </div>
          </div>

          {/* Created Courses */}
          <div className="card shadow rounded-4 border-0">
            <div className="card-header bg-success text-white">
              <h5 className="mb-0">Your Created Courses</h5>
            </div>
            <div className="card-body">
              {user?.createdCourses && user?.createdCourses?.length > 0 ? (
                user.createdCourses.map(course => (
                  <div key={course._id} className="mb-3 border-bottom pb-3">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="mb-1">{course.name}</h6>
                        <small className="text-muted">{course.enrolledStudents} students enrolled</small>
                      </div>
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-sm btn-outline-warning"
                          onClick={() => navigate(`/course/edit/${course._id}`)}
                        >
                          Add Lecture
                        </button>
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => navigate(`/course/${course._id}`)}
                        >
                          Continue
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p>You haven’t created any courses yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      <div className="modal fade" id="editProfileModal" tabIndex="-1" aria-labelledby="editProfileModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content rounded-4">
            <div className="modal-header">
              <h5 className="modal-title" id="editProfileModalLabel">Edit Profile</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <form>
                <div className="mb-3">
                  <label className="form-label">Name</label>
                  <input type="text" className="form-control" name="name" value={editData.name} onChange={handleChange} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input type="email" className="form-control" name="email" value={editData.email} onChange={handleChange} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Bio</label>
                  <textarea className="form-control" name="bio" rows="3" value={editData.bio} onChange={handleChange}></textarea>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button type="button" className="btn btn-primary" onClick={handleSave}>Save Changes</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
