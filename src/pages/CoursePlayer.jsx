import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { api } from '../utils/constant';

const LecturePlayer = () => {
  const [activeLecture, setActiveLecture] = useState(null);
  const [lecture, setLecture] = useState([]);
  const { user } = useSelector(state => state.user);
  const { id } = useParams();

  useEffect(() => {
    const fetchLectures = async () => {
      try {
        const response = await api.get(`course/get/${id}`, {
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        });
        const allLectures = response.data.data.lectures.map((data, index) => ({
          ...data,
          id: index + 1
        }));
        setLecture(allLectures);
        setActiveLecture(1);
      } catch (error) {
        console.error("Error fetching lectures:", error);
      }
    };
    fetchLectures();
  }, [id, user.token]);

  const currentLecture = lecture.find((lec) => lec.id === activeLecture);

  return (
    <div className="container mt-2">
      <div className="row">
        <div className="col-md-3">
          <div className="list-group">
            {lecture.length > 0 && lecture.map((lect) => (
              <button
                key={lect.id}
                className={`list-group-item list-group-item-action text-start ${activeLecture === lect.id ? 'active' : ''}`}
                onClick={() => setActiveLecture(lect.id)}
              >
                {
                  console.log(lect)
                }
                <strong>{lect.title}</strong>
                <br />
                <small className="text-muted">{lect.description}</small>
              </button>
            ))}
          </div>
        </div>
        {
          lecture.length > 0 &&
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
                      <video controls className="w-100 rounded-bottom" style={{ borderBottomLeftRadius: '1rem', borderBottomRightRadius: '1rem' }}>
                        <source src={currentLecture.videos[0].url} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
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
        }
        {
          lecture.length === 0 &&
          (
            <h5 className='text-center'>there is no Lecture</h5>
          )
        }
      </div>
    </div>
  );
};

export default LecturePlayer;
