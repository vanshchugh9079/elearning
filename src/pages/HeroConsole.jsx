import React from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import {useNavigate} from "react-router-dom"

// Import your images
import carousel1 from './img/carousel-1.jpg';
import carousel2 from './img/carousel-2.jpg';

const HeroCarousel = () => {
  let navigate=useNavigate();
  // Settings for the slider
  const settings = {
    dots: false,
    infinite: true,
    speed: 1000,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    fade: true,
    pauseOnHover: false,
    arrows: false
  };

  const slides = [
    {
      image: carousel1,
      title: "The Best Online Learning Platform",
      description: ""
    },
    {
      image: carousel2,
      title: "Get Educated Online From Your Home",
      description: ""
    }
  ];

  return (
    <div className="container-fluid p-0 mb-5">
      <Slider {...settings} className="header-carousel position-relative">
        {slides.map((slide, index) => (
          <div key={index} className="position-relative">
            <img 
              className="img-fluid w-100" 
              src={slide.image} 
              alt={`Slide ${index + 1}`}
              style={{ 
                height: '100vh',
                objectFit: 'cover'
              }}
            />
            <div 
              className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center" 
              style={{ background: 'rgba(24, 29, 56, .7)' }}
            >
              <div className="container">
                <div className="row justify-content-start">
                  <div className="col-sm-10 col-lg-8">
                    <h5 className="text-primary text-uppercase mb-3">
                      Best Online Courses
                    </h5>
                    <h1 className="display-3 text-white">
                      {slide.title}
                    </h1>
                    <p className="fs-5 text-white mb-4 pb-2">
                      {slide.description}
                    </p>
                    <div className="d-flex flex-wrap gap-3">
                      <a 
                        className="btn btn-primary py-md-3 px-md-5 me-3"
                        onClick={()=>{
                          navigate("/about")
                        }}
                      >
                        Read More
                      </a>
                      <a 
                        className="btn btn-light py-md-3 px-md-5"
                        onClick={()=>{
                          navigate("/login")
                        }}
                      >
                        Join Now
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default HeroCarousel;