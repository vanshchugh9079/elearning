import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import "../../css/layoutComponet/courseSuccess.css";

const CourseSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timeout = setTimeout(() => {
      navigate("/");
    }, 3000); // give time for animation to complete

    return () => clearTimeout(timeout);
  }, [navigate]);

  return (
    <motion.div
      className="success-overlay"
      initial={{ y: "-100%" }}
      animate={{ y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ type: "spring", stiffness: 70 }}
    >
      <div className="cloud cloud-left" />
      <div className="cloud cloud-right" />
      <div className="message-box">
        <h1 className="success-heading">🎉 Course Created Successfully!</h1>
        <p className="success-subtext">Redirecting to dashboard...</p>
      </div>
    </motion.div>
  );
};

export default CourseSuccess;
