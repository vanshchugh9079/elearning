import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const LecturePlayer = () => {
  const [activeLecture, setActiveLecture] = useState(2);

  const lectures = [
    { id: 1, title: 'Lecture 1', description: 'Intro to Gmail setup', video: 'video1.mp4' },
    { id: 2, title: 'Lecture 2', description: 'Generate Gmail password', video: 'video2.mp4' },
    { id: 3, title: 'Lecture 3', description: 'Two-step verification', video: 'video3.mp4' },
    { id: 4, title: 'Lecture 4', description: 'Password recovery options', video: 'video4.mp4' },
  ];

  const currentLecture = lectures.find((lec) => lec.id === activeLecture);

  return (
    <div className="container mt-2">
      <div className="row">
        {/* Sidebar */}
        <div className="col-md-3">
          <div className="list-group">
            {lectures.map((lecture) => (
              <button
                key={lecture.id}
                className={`list-group-item list-group-item-action text-start ${activeLecture === lecture.id ? 'active' : ''}`}
                onClick={() => setActiveLecture(lecture.id)}
              >
                <strong>{lecture.title}</strong>
                <br />
                <small className="text-muted">{lecture.description}</small>
              </button>
            ))}
          </div>
        </div>

        {/* Video Player */}
        <div className="col-md-9">
          <div className="card shadow rounded-4 border-0">
            <div className="card-header bg-dark text-white">
              <h5 className="mb-0">{currentLecture.title}</h5>
              <small>{currentLecture.description}</small>
            </div>
            <div className="card-body p-0">
              <div className="ratio ratio-16x9">
                <video controls className="w-100 rounded-bottom" style={{ borderBottomLeftRadius: '1rem', borderBottomRightRadius: '1rem' }}>
                  <source src={currentLecture.video} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LecturePlayer;
