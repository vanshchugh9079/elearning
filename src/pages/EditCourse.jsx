import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { api } from '../utils/constant';

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
    if (!newLecture.title || !newLecture.description || !lectureFile) {
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
      await api.post(`course/${id}/add`, formData, {
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setCourse((prevCourse) => ({
        ...prevCourse,
        lectures: [...prevCourse.lectures, {
          _id: Date.now(),
          title: newLecture.title,
          description: newLecture.description,
        }],
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

  const handleDeleteLecture = async (lectureId) => {
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

  const handleLectureClick = (lectureIndex) => {
    navigate(`/course/${id}/${lectureIndex}`);
  };

  const handleDeleteCourse = async () => {
    if (!window.confirm("Are you sure you want to delete this course? This action cannot be undone.")) {
      return;
    }

    setDeleteCourseLoading(true);
    try {
      await api.delete(`course/${id}`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      showSuccess("Course deleted successfully!");
      setTimeout(() => {
        navigate("/course"); // Adjust this route as per your project structure
      }, 2000);
    } catch (error) {
      showError(error);
    } finally {
      setDeleteCourseLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <h2 className="mb-4 text-center text-primary">Edit Course</h2>

      {error && (
        <div className="alert alert-danger text-center" role="alert">
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success text-center" role="alert">
          {success}
        </div>
      )}

      {!course ? (
        <div className="text-center">Loading...</div>
      ) : (
        <>
          <div className="text-center mb-4">
            <img
              src={course.thumbnail?.url}
              alt="Course Thumbnail"
              className="img-fluid rounded shadow"
              style={{ maxHeight: "250px", objectFit: "contain" }}
            />
          </div>

          <div className="card p-4 mb-4 shadow rounded-4">
            <h4 className="mb-3">Update Course Details</h4>
            <div className="mb-3">
              <label className="form-label">Course Title</label>
              <input
                type="text"
                className="form-control"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Description</label>
              <textarea
                className="form-control"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <button className="btn btn-primary" onClick={handleUpdateCourse} disabled={updateLoading}>
              {updateLoading ? (
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              ) : '💾'} Save Changes
            </button>
          </div>

          <div className="card p-4 mb-4 shadow rounded-4">
            <h4 className="mb-3">Add New Lecture</h4>
            <div className="mb-3">
              <label className="form-label">Lecture Title</label>
              <input
                type="text"
                className="form-control"
                value={newLecture.title}
                onChange={(e) => setNewLecture({ ...newLecture, title: e.target.value })}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Lecture Description</label>
              <textarea
                className="form-control"
                rows={3}
                value={newLecture.description}
                onChange={(e) => setNewLecture({ ...newLecture, description: e.target.value })}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Lecture Video File</label>
              <input
                type="file"
                className="form-control"
                accept="video/*"
                onChange={(e) => setLectureFile(e.target.files[0])}
              />
            </div>
            <button className="btn btn-success" onClick={handleAddLecture} disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Adding...
                </>
              ) : '➕ Add Lecture'}
            </button>
          </div>

          <div className="card p-4 shadow rounded-4">
            <h4 className="mb-3">Lectures</h4>
            {course.lectures?.length > 0 ? (
              <ul className="list-group">
                {course.lectures.map((lecture, index) => (
                  <li
                    key={lecture._id}
                    className="list-group-item d-flex justify-content-between align-items-center"
                    onClick={() => handleLectureClick(index + 1)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div>
                      <strong>
                        {index + 1}. {lecture.title}
                      </strong>
                      <br />
                      <small className="text-muted">{lecture.description}</small>
                    </div>
                    <button
                      className="btn btn-sm btn-danger"
                      disabled={deleteLoading === lecture._id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteLecture(lecture._id);
                      }}
                    >
                      {deleteLoading === lecture._id ? (
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      ) : '🗑️ Delete'}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted">No lectures added yet.</p>
            )}
          </div>

          <div className="text-center mt-4">
            <button
              className="btn fw-bold btn-danger text-white"
              onClick={handleDeleteCourse}
              disabled={deleteCourseLoading}
            >
              {deleteCourseLoading ? (
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              ) : '🗑️ Delete This Course'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default EditCourse;
