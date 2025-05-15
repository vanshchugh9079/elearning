import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../css/liveclass/liveClass.css'

const GoogleMeetUI = () => {
  let [camera,setCamera]=useState(false);
  let [mic,setMic]=useState(false);
  let [hand,setHand]=useState(false);
  let [end,setEnd]=useState(false)
  return (  
    <div className="container-fluid bg-dark text-light vh-100">
      <div className="d-flex flex-column h-100">
        <h2 className="text-center my-4">Google Meet UI</h2>
        <div className="row flex-grow-1">
          <div className="col-md-8 col-sm-12 mb-3">
            <div className="video-large bg-secondary d-flex justify-content-center align-items-center h-100">
              <p>Main Video</p>
            </div>
          </div>
          <div className="col-md-4 col-sm-12">
            <div className="row h-100">
              {Array.from({ length: 6 }).map((_, index) => (
                <div className="col-4 mb-3" key={index}>
                  <div className="video-small bg-secondary d-flex justify-content-center align-items-center">
                    <p>Video {index + 1}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="controls mt-4 text-center">
          <button className="btn btn-danger mr-2">
            <i className="bi bi-telephone-x-fill mr-1"></i> End Call
          </button>
          <button className="btn btn-light mr-2">
            <i className="bi bi-hand-thumbs-up-fill mr-1"></i> Raise Hand
          </button>
          <button className="btn btn-light mr-2">
            <i className="bi bi-mic-fill mr-1"></i> Mic On
          </button>
          <button className="btn btn-light">
            <i className="bi bi-camera-video-fill mr-1"></i> Camera
          </button>
        </div>
      </div>
    </div>
  );
};

export default GoogleMeetUI;
