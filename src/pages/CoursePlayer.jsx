import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../utils/constant';

const LecturePlayer = () => {
  const [activeLecture, setActiveLecture] = useState(null);
  const [lectures, setLectures] = useState([]);
  const [currentLecture, setCurrentLecture] = useState(null);
  const { user, subscription } = useSelector(state => state.user);
  const [course, setCourse] = useState()
  const { id, lecture: lecId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLectures = async () => {
      try {
        const response = await api.get(`course/get/${id}`, {
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        });
        setCourse(response.data.data)        
        console.log(response.data.data?.liveStatus != "live" && response.data.data?.createdBy._id == user._id);
        
        

        const allLectures = response.data.data.lectures.map((data, index) => ({
          ...data,
          id: index + 1
        }));

        setLectures(allLectures);
        setActiveLecture(lecId ? Number(lecId) : 1);
      } catch (error) {
        console.error("Error fetching lectures:", error);
      }
    };

    fetchLectures();
  }, [id, user.token, lecId]);

  useEffect(() => {
    if (lectures.length > 0) {
      const lecture = lectures.find((lec) => lec.id === activeLecture);
      setCurrentLecture(lecture);
    }
  }, [lectures, activeLecture]);

  const handleVideoEnd = async () => {
    try {
      await api.get(`lecture/addWatchedLecture/${currentLecture._id}`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      console.log('Lecture marked as watched');
    } catch (error) {
      console.error("Error marking lecture as watched:", error);
    }
  };

  const handleJoinLiveClass = () => {
    navigate(`/course/live/${id}`);
  };

  return (
    <div className="container mt-2">
      <div className="row">
        {/* Left Sidebar */}
        <div className="col-md-3 d-flex flex-column justify-content-between" style={{ height: '85vh' }}>
          <div className="list-group overflow-auto mb-3" style={{ maxHeight: 'calc(100% - 60px)' }}>
            {lectures.length > 0 ? (
              lectures.map((lect) => (
                <button
                  key={lect.id}
                  className={`list-group-item list-group-item-action text-start ${activeLecture === lect.id ? 'active' : ''}`}
                  onClick={() => setActiveLecture(lect.id)}
                >
                  <strong>{lect.title}</strong>
                  <br />
                  <small className="text-muted">{lect.description}</small>
                </button>
              ))
            ) : (
              <h5 className="text-center">No Lectures Available</h5>
            )}
          </div>

          {/* Live Class Button */}
          {
            course?.liveStatus === "live" && course?.createdBy != user._id &&
            <div className="text-center mb-2">
              <button
                className="btn btn-success w-100 rounded-pill"
                onClick={handleJoinLiveClass}
              >
                 🚀 Join Live Class
              </button>
            </div>
          }
          {
            course?.liveStatus != "live" && course?.createdBy._id == user._id &&
            <div className="text-center mb-2">
              <button
                className="btn btn-success w-100 rounded-pill"
                onClick={handleJoinLiveClass}
              >
                🚀 Start Live Class
              </button>
            </div>
          }

        </div>
        {/* Main Video Area */}
        {lectures.length > 0 && (
          <div className="col-md-9">
            <div className="card shadow rounded-4 border-0">
              {currentLecture ? (
                <>
                  <div className="card-header bg-dark text-white">
                    <h5 className="mb-0">{currentLecture.title}</h5>
                    <small>{currentLecture.description}</small>
                  </div>
                  <div className="card-body p-0">
                    <div className="ratio ratio-16x9">
                      {currentLecture.videos && currentLecture.videos.length > 0 ? (
                        <video
                          key={currentLecture.videos[0].url}
                          controls
                          className="w-100 rounded-bottom"
                          style={{ borderBottomLeftRadius: '1rem', borderBottomRightRadius: '1rem' }}
                          onEnded={handleVideoEnd}
                        >
                          <source src={currentLecture.videos[0].url} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                      ) : (
                        <div className="text-center p-5">
                          <h5>No video available for this lecture.</h5>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="card-body text-center p-5">
                  <h5>No Lecture Selected</h5>
                </div>
              )}
            </div>
          </div>
        )}

        {lectures.length === 0 && (
          <h5 className='text-center'>There are no lectures in this course.</h5>
        )}
      </div>
    </div>
  );
};

export default LecturePlayer;
