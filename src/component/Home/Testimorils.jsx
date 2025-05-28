import React from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import "../../css/layoutComponet/testimorial.css"

// Import testimonial images
import testimonial1 from '../../pages/img/testimonial-1.jpg';
import testimonial2 from '../../pages/img/testimonial-2.jpg';
import testimonial3 from '../../pages/img/testimonial-3.jpg';
import testimonial4 from '../../pages/img/testimonial-4.jpg';

const TestimonialCarousel = () => {
  // Carousel settings
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    pauseOnHover: true,
    arrows: false,
    responsive: [
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 2
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1
        }
      }
    ]
  };

  const testimonials = [
    {
      image: testimonial1,
      name: "Client Name",
      profession: "Profession",
      quote: "Tempor erat elitr rebum at clita. Diam dolor diam ipsum sit diam amet diam et eos. Clita erat ipsum et lorem et sit."
    },
    {
      image: testimonial2,
      name: "Client Name",
      profession: "Profession",
      quote: "Tempor erat elitr rebum at clita. Diam dolor diam ipsum sit diam amet diam et eos. Clita erat ipsum et lorem et sit."
    },
    {
      image: testimonial3,
      name: "Client Name",
      profession: "Profession",
      quote: "Tempor erat elitr rebum at clita. Diam dolor diam ipsum sit diam amet diam et eos. Clita erat ipsum et lorem et sit."
    },
    {
      image: testimonial4,
      name: "Client Name",
      profession: "Profession",
      quote: "Tempor erat elitr rebum at clita. Diam dolor diam ipsum sit diam amet diam et eos. Clita erat ipsum et lorem et sit."
    }
  ];

  return (
    <div className="testimonial-carousel position-relative">
      <Slider {...settings}>
        {testimonials.map((testimonial, index) => (
          <div key={index} className="px-2"> {/* Add padding between slides */}
            <div className="testimonial-item text-center h-100">
              <img 
                className="border rounded-circle p-2 mx-auto mb-3" 
                src={testimonial.image} 
                alt={testimonial.name}
                style={{ width: 80, height: 80, objectFit: 'cover' }}
              />
              <h5 className="mb-0">{testimonial.name}</h5>
              <p>{testimonial.profession}</p>
              <div className="testimonial-text bg-light text-center p-4 h-100">
                <p className="mb-0">{testimonial.quote}</p>
              </div>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default TestimonialCarousel;