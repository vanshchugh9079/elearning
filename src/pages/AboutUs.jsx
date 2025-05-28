import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import aboutImage from './img/about.jpg'; // Make sure this path is correct
import ScrollToTop from "../utils/ScrollToTop.jsx"

const AboutUs = () => {
  const navigate = useNavigate();

  return (
    <>
    <ScrollToTop/>
    <div style={{ transform: 'scale(0.85)', transformOrigin: 'top center' }}>
      <div className="container-xxl py-5">
        <div className="container">
          <div className="row g-5">
            <div className="col-lg-6" style={{ minHeight: '400px' }}>
              <motion.div
                className="position-relative h-100"
                initial={{ opacity: 0, x: -100 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1 }}
              >
                <img
                  className="img-fluid position-absolute w-100 h-100"
                  src={aboutImage}
                  alt="About eLEARNING"
                  style={{ objectFit: 'cover' }}
                />
              </motion.div>
            </div>
            <div className="col-lg-6">
              <motion.div
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1 }}
              >
                <h6 className="section-title bg-white text-start text-primary pe-3">About Us</h6>
                <h1 className="mb-4">Empowering Learning, Anywhere Anytime</h1>
                <p className="mb-4">
                  At <strong>eLEARNING</strong>, we believe education should be accessible, flexible, and effective for everyone. 
                  Our platform is designed to provide top-quality courses delivered by industry experts, 
                  allowing learners to study at their own pace from anywhere in the world.
                </p>
                <p className="mb-4">
                  Whether you're looking to upskill, change careers, or enhance your knowledge, 
                  our curated content, interactive tools, and supportive community ensure an enriching learning experience.
                </p>
                <div className="row gy-2 gx-4 mb-4">
                  {[
                    'Certified Instructors',
                    'Self-paced Learning',
                    'Real-World Projects',
                    'Interactive Content',
                    'Community Support',
                    'Recognized Certificates',
                  ].map((item, index) => (
                    <div className="col-sm-6" key={index}>
                      <p className="mb-0">
                        <i className="fa fa-arrow-right text-primary me-2"></i>
                        {item}
                      </p>
                    </div>
                  ))}
                </div>
                <button
                  className="btn btn-primary py-3 px-5 mt-2"
                  onClick={() => navigate('/course')}
                >
                  Explore Courses
                </button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default AboutUs;
