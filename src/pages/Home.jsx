import { useEffect, useState } from "react";
import Testimonials from "../component/Home/Testimorils";
import "../css/pages/home.css"
import "animate.css"
import { useNavigate } from "react-router-dom";
// Home.jsx
const Home = () => {
  const [showText, setShowText] = useState(false);
  let navigate=useNavigate()
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowText(true);
    }, 3000); // Delay to show the complete text after the animation
    return () => clearTimeout(timer); // Clean up the timer
  }, []);
  return (
    <>
      <section className="py-5 bg-light text-center">
        <div className="container">
          <h1 className="display-5 fw-bold">
            {["Welcome", "to", "our", "E-Learning", "Platform"].map((word, index) => (
              <span
                key={index}
                className={`word animate__animated ${showText ? "animate__fadeInLeft" : ""} animate__delay-${index}s`}
              >
                {word}{" "}
              </span>
            ))}
          </h1>
          {showText && (
            <>
              <p className="lead text-muted">Learn, Grow, Excel</p>
              <div className="mt-4">
                <button className="btn btn-lg btn-primary" onClick={()=>{
                  navigate("/course")
                }} style={{ backgroundColor: "#8e44ad", border: "none" }}>
                  Get Started
                </button>
              </div>
            </>
          )}
        </div>
      </section>
      <Testimonials />
    </>
  );
};

export default Home;
