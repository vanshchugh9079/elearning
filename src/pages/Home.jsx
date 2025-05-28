import { useEffect, useState } from "react";
import "animate.css"
import "bootstrap/dist/css/bootstrap.min.css"; // Add this
import "font-awesome/css/font-awesome.min.css"; // Add this
import "owl.carousel/dist/assets/owl.carousel.css";
import "owl.carousel/dist/assets/owl.theme.default.css";
import Head from "./Head.jsx"
import "./css/style.css"
import aboutImg from "./img/about.jpg";
import cat1 from "./img/cat-1.jpg";
import cat2 from "./img/cat-2.jpg";
import cat3 from "./img/cat-3.jpg";
import cat4 from "./img/cat-4.jpg";
import course1 from "./img/course-1.jpg";
import course2 from "./img/course-2.jpg";
import course3 from "./img/course-3.jpg";
import team1 from "./img/team-1.jpg";
import team2 from "./img/team-2.jpg";
import team3 from "./img/team-3.jpg";
import team4 from "./img/team-4.jpg";
import testimonial1 from "./img/testimonial-1.jpg";
import testimonial2 from "./img/testimonial-2.jpg";
import testimonial3 from "./img/testimonial-3.jpg";
import testimonial4 from "./img/testimonial-4.jpg";
import HeroConsole from "./HeroConsole.jsx"
import Testimorial from "../component/Home/Testimorils.jsx"
import {useNavigate} from "react-router-dom"
import ScrollToTop from "../utils/ScrollToTop.jsx"
const Home = () => {
  const [isLoading, setIsLoading] = useState(true);

  let navigate=useNavigate();
  useEffect(() => {
    // Initialize carousels and other JS components after load
    const timer = setTimeout(() => {
      setIsLoading(false);

      // Initialize Owl Carousel if it exists on the page
      if (window.$ && window.$.fn.owlCarousel) {
        $('.owl-carousel').owlCarousel({
          items: 1,
          loop: true,
          autoplay: true,
          autoplayTimeout: 5000,
          autoplayHoverPause: true
        });

        $('.testimonial-carousel').owlCarousel({
          items: 1,
          loop: true,
          margin: 10,
          autoplay: true,
          autoplayTimeout: 5000,
          autoplayHoverPause: true
        });
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="position-fixed w-100 vh-100 d-flex align-items-center justify-content-center bg-white">
        <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }
  else {
    return (
      <>
        <Head />
        <ScrollToTop/>
        <div className="text-black">
          <HeroConsole />
          <div className="container-xxl py-5">
            <div className="container">
              <div className="row g-4">
                <div className="col-lg-3 col-sm-6 wow fadeInUp" data-wow-delay="0.1s">
                  <div className="service-item text-center pt-3">
                    <div className="p-4">
                      <i className="fa fa-3x fa-graduation-cap text-primary mb-4" />
                      <h5 className="mb-3">Skilled Instructors</h5>
                      <p>Skilled, passionate instructor delivering clear, engaging lessons to help students succeed and reach their potential.</p>
                    </div>
                  </div>
                </div>
                <div className="col-lg-3 col-sm-6 wow fadeInUp" data-wow-delay="0.3s">
                  <div className="service-item text-center pt-3">
                    <div className="p-4">
                      <i className="fa fa-3x fa-globe text-primary mb-4" />
                      <h5 className="mb-3">Online Classes</h5>
                      <p>Expert online instructor delivering engaging, interactive lessons to help students learn effectively from anywhere.</p>
                    </div>
                  </div>
                </div>
                <div className="col-lg-3 col-sm-6 wow fadeInUp" data-wow-delay="0.5s">
                  <div className="service-item text-center pt-3">
                    <div className="p-4">
                      <i className="fa fa-3x fa-home text-primary mb-4" />
                      <h5 className="mb-3">Home Projects</h5>
                      <p>Creative instructor guiding fun, hands-on home projects that build skills, inspire learning, spark curiosity, and confidence.</p>
                    </div>
                  </div>
                </div>
                <div className="col-lg-3 col-sm-6 wow fadeInUp" data-wow-delay="0.7s">
                  <div className="service-item text-center pt-3">
                    <div className="p-4">
                      <i className="fa fa-3x fa-book-open text-primary mb-4" />
                      <h5 className="mb-3">Book Library</h5>
                      <p>Knowledgeable instructor helping students explore, understand, and enjoy books through engaging library-based learning.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="container-xxl py-5">
            <div className="container">
              <div className="row g-5">
                <div className="col-lg-6 wow fadeInUp" data-wow-delay="0.1s" style={{ minHeight: 400 }}>
                  <div className="position-relative h-100">
                    <img className="img-fluid position-absolute w-100 h-100" src={aboutImg} alt="this is image" style={{ objectFit: 'cover' }} />
                  </div>
                </div>
                <div className="col-lg-6 wow fadeInUp" data-wow-delay="0.3s">
                  <h6 className="section-title bg-white text-start text-primary pe-3">About Us</h6>
                  <h1 className="mb-4">Welcome to eLEARNING</h1>
                  <p>At <strong>EDUCINE</strong>, we believe that quality education should be accessible to everyone, anytime, anywhere. Our platform is designed to empower learners of all ages through engaging, flexible, and expertly crafted online courses. Whether you're looking to build new skills, explore a passion, or advance your career, we provide the tools and support to help you succeed.</p>

                  <p>We collaborate with experienced instructors and industry professionals to deliver practical, real-world learning experiences. Our interactive lessons, project-based learning, and personalized feedback ensure that you not only understand the material but can apply it confidently.</p>

                  <p>Join our growing community of learners and start your journey toward lifelong learning and personal growth today.</p>

                  <div className="row gy-2 gx-4 mb-4">
                    <div className="col-sm-6">
                      <p className="mb-0"><i className="fa fa-arrow-right text-primary me-2" />Skilled Instructors</p>
                    </div>
                    <div className="col-sm-6">
                      <p className="mb-0"><i className="fa fa-arrow-right text-primary me-2" />Online Classes</p>
                    </div>
                    <div className="col-sm-6">
                      <p className="mb-0"><i className="fa fa-arrow-right text-primary me-2" />International Certificate</p>
                    </div>
                    <div className="col-sm-6">
                      <p className="mb-0"><i className="fa fa-arrow-right text-primary me-2" />Skilled Instructors</p>
                    </div>
                    <div className="col-sm-6">
                      <p className="mb-0"><i className="fa fa-arrow-right text-primary me-2" />Online Classes</p>
                    </div>
                    <div className="col-sm-6">
                      <p className="mb-0"><i className="fa fa-arrow-right text-primary me-2" />International Certificate</p>
                    </div>
                  </div>
                  <a className="btn btn-primary py-3 px-5 mt-2" onClick={()=>{
                    navigate("/about")
                  }}>Read More</a>
                </div>
              </div>
            </div>
          </div>
          <div className="container-xxl py-5 category">
            <div className="container">
              <div className="text-center wow fadeInUp" data-wow-delay="0.1s">
                <h6 className="section-title bg-white text-center text-primary px-3">Categories</h6>
                <h1 className="mb-5">Courses Categories</h1>
              </div>
              <div className="row g-3">
                <div className="col-lg-7 col-md-6">
                  <div className="row g-3">
                    <div className="col-lg-12 col-md-12 wow zoomIn" data-wow-delay="0.1s">
                      <a className="position-relative d-block overflow-hidden" href="#">
                        <img className="img-fluid" src={cat1} alt="this is image" />
                        <div className="bg-white text-center position-absolute bottom-0 end-0 py-2 px-3" style={{ margin: 1 }}>
                          <h5 className="m-0">Web Design</h5>
                          <small className="text-primary">49 Courses</small>
                        </div>
                      </a>
                    </div>
                    <div className="col-lg-6 col-md-12 wow zoomIn" data-wow-delay="0.3s">
                      <a className="position-relative d-block overflow-hidden" href="#">
                        <img className="img-fluid" src={cat2} alt="this is image" />
                        <div className="bg-white text-center position-absolute bottom-0 end-0 py-2 px-3" style={{ margin: 1 }}>
                          <h5 className="m-0">Graphic Design</h5>
                          <small className="text-primary">49 Courses</small>
                        </div>
                      </a>
                    </div>
                    <div className="col-lg-6 col-md-12 wow zoomIn" data-wow-delay="0.5s">
                      <a className="position-relative d-block overflow-hidden" href="#">
                        <img className="img-fluid" src={cat3} alt="this is image" />
                        <div className="bg-white text-center position-absolute bottom-0 end-0 py-2 px-3" style={{ margin: 1 }}>
                          <h5 className="m-0">Video Editing</h5>
                          <small className="text-primary">49 Courses</small>
                        </div>
                      </a>
                    </div>
                  </div>
                </div>
                <div className="col-lg-5 col-md-6 wow zoomIn" data-wow-delay="0.7s" style={{ minHeight: 350 }}>
                  <a className="position-relative d-block h-100 overflow-hidden" href="#">
                    <img className="img-fluid position-absolute w-100 h-100" src={cat4} alt="this is image" style={{ objectFit: 'cover' }} />
                    <div className="bg-white text-center position-absolute bottom-0 end-0 py-2 px-3" style={{ margin: 1 }}>
                      <h5 className="m-0">Online Marketing</h5>
                      <small className="text-primary">49 Courses</small>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div className="container-xxl py-5">
            <div className="container">
              <div className="text-center wow fadeInUp" data-wow-delay="0.1s">
                <h6 className="section-title bg-white text-center text-primary px-3">Courses</h6>
                <h1 className="mb-5">Popular Courses</h1>
              </div>
              <div className="row g-4 justify-content-center">
                <div className="col-lg-4 col-md-6 wow fadeInUp" data-wow-delay="0.1s">
                  <div className="course-item bg-light">
                    <div className="position-relative overflow-hidden">
                      <img className="img-fluid" src={course1} alt="this is image" />
                      <div className="w-100 d-flex justify-content-center position-absolute bottom-0 start-0 mb-4">
                        <a className="flex-shrink-0 btn btn-sm btn-primary px-3 border-end" style={{ borderRadius: '30px 0 0 30px' }} onClick={()=>{
                          navigate("/about")
                        }}>Read More</a>
                        <a href="#" className="flex-shrink-0 btn btn-sm btn-primary px-3" style={{ borderRadius: '0 30px 30px 0' }}>Join Now</a>
                      </div>
                    </div>
                    <div className="text-center p-4 pb-0">
                      <h3 className="mb-0">$149.00</h3>
                      <div className="mb-3">
                        <small className="fa fa-star text-primary" />
                        <small className="fa fa-star text-primary" />
                        <small className="fa fa-star text-primary" />
                        <small className="fa fa-star text-primary" />
                        <small className="fa fa-star text-primary" />
                        <small>(123)</small>
                      </div>
                      <h5 className="mb-4">Web Design &amp; Development Course for Beginners</h5>
                    </div>
                    <div className="d-flex border-top">
                      <small className="flex-fill text-center border-end py-2"><i className="fa fa-user-tie text-primary me-2" />John Doe</small>
                      <small className="flex-fill text-center border-end py-2"><i className="fa fa-clock text-primary me-2" />1.49 Hrs</small>
                      <small className="flex-fill text-center py-2"><i className="fa fa-user text-primary me-2" />30 Students</small>
                    </div>
                  </div>
                </div>
                <div className="col-lg-4 col-md-6 wow fadeInUp" data-wow-delay="0.3s">
                  <div className="course-item bg-light">
                    <div className="position-relative overflow-hidden">
                      <img className="img-fluid" src={course2} alt="this is image" />
                      <div className="w-100 d-flex justify-content-center position-absolute bottom-0 start-0 mb-4">
                        <a href="#" className="flex-shrink-0 btn btn-sm btn-primary px-3 border-end" style={{ borderRadius: '30px 0 0 30px' }}>Read More</a>
                        <a href="#" className="flex-shrink-0 btn btn-sm btn-primary px-3" style={{ borderRadius: '0 30px 30px 0' }}>Join Now</a>
                      </div>
                    </div>
                    <div className="text-center p-4 pb-0">
                      <h3 className="mb-0">$149.00</h3>
                      <div className="mb-3">
                        <small className="fa fa-star text-primary" />
                        <small className="fa fa-star text-primary" />
                        <small className="fa fa-star text-primary" />
                        <small className="fa fa-star text-primary" />
                        <small className="fa fa-star text-primary" />
                        <small>(123)</small>
                      </div>
                      <h5 className="mb-4">Web Design &amp; Development Course for Beginners</h5>
                    </div>
                    <div className="d-flex border-top">
                      <small className="flex-fill text-center border-end py-2"><i className="fa fa-user-tie text-primary me-2" />John Doe</small>
                      <small className="flex-fill text-center border-end py-2"><i className="fa fa-clock text-primary me-2" />1.49 Hrs</small>
                      <small className="flex-fill text-center py-2"><i className="fa fa-user text-primary me-2" />30 Students</small>
                    </div>
                  </div>
                </div>
                <div className="col-lg-4 col-md-6 wow fadeInUp" data-wow-delay="0.5s">
                  <div className="course-item bg-light">
                    <div className="position-relative overflow-hidden">
                      <img className="img-fluid" src={course3} alt="this is image" />
                      <div className="w-100 d-flex justify-content-center position-absolute bottom-0 start-0 mb-4">
                        <a href="#" className="flex-shrink-0 btn btn-sm btn-primary px-3 border-end" style={{ borderRadius: '30px 0 0 30px' }}>Read More</a>
                        <a href="#" className="flex-shrink-0 btn btn-sm btn-primary px-3" style={{ borderRadius: '0 30px 30px 0' }}>Join Now</a>
                      </div>
                    </div>
                    <div className="text-center p-4 pb-0">
                      <h3 className="mb-0">$149.00</h3>
                      <div className="mb-3">
                        <small className="fa fa-star text-primary" />
                        <small className="fa fa-star text-primary" />
                        <small className="fa fa-star text-primary" />
                        <small className="fa fa-star text-primary" />
                        <small className="fa fa-star text-primary" />
                        <small>(123)</small>
                      </div>
                      <h5 className="mb-4">Web Design &amp; Development Course for Beginners</h5>
                    </div>
                    <div className="d-flex border-top">
                      <small className="flex-fill text-center border-end py-2"><i className="fa fa-user-tie text-primary me-2" />John Doe</small>
                      <small className="flex-fill text-center border-end py-2"><i className="fa fa-clock text-primary me-2" />1.49 Hrs</small>
                      <small className="flex-fill text-center py-2"><i className="fa fa-user text-primary me-2" />30 Students</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="container-xxl py-5">
            <div className="container">
              <div className="text-center wow fadeInUp" data-wow-delay="0.1s">
                <h6 className="section-title bg-white text-center text-primary px-3">Instructors</h6>
                <h1 className="mb-5">Expert Instructors</h1>
              </div>
              <div className="row g-4">
                <div className="col-lg-3 col-md-6 wow fadeInUp" data-wow-delay="0.1s">
                  <div className="team-item bg-light">
                    <div className="overflow-hidden">
                      <img className="img-fluid" src={team1} alt="this is image" />
                    </div>
                    <div className="position-relative d-flex justify-content-center" style={{ marginTop: '-23px' }}>
                      <div className="bg-light d-flex justify-content-center pt-2 px-1">
                        <a className="btn btn-sm-square btn-primary mx-1" href="#"><i className="fab fa-facebook-f" /></a>
                        <a className="btn btn-sm-square btn-primary mx-1" href="#"><i className="fab fa-twitter" /></a>
                        <a className="btn btn-sm-square btn-primary mx-1" href="#"><i className="fab fa-instagram" /></a>
                      </div>
                    </div>
                    <div className="text-center p-4">
                      <h5 className="mb-0">Instructor Name</h5>
                      <small>Designation</small>
                    </div>
                  </div>
                </div>
                <div className="col-lg-3 col-md-6 wow fadeInUp" data-wow-delay="0.3s">
                  <div className="team-item bg-light">
                    <div className="overflow-hidden">
                      <img className="img-fluid" src={team2} alt="this is image" />
                    </div>
                    <div className="position-relative d-flex justify-content-center" style={{ marginTop: '-23px' }}>
                      <div className="bg-light d-flex justify-content-center pt-2 px-1">
                        <a className="btn btn-sm-square btn-primary mx-1" href="#"><i className="fab fa-facebook-f" /></a>
                        <a className="btn btn-sm-square btn-primary mx-1" href="#"><i className="fab fa-twitter" /></a>
                        <a className="btn btn-sm-square btn-primary mx-1" href="#"><i className="fab fa-instagram" /></a>
                      </div>
                    </div>
                    <div className="text-center p-4">
                      <h5 className="mb-0">Instructor Name</h5>
                      <small>Designation</small>
                    </div>
                  </div>
                </div>
                <div className="col-lg-3 col-md-6 wow fadeInUp" data-wow-delay="0.5s">
                  <div className="team-item bg-light">
                    <div className="overflow-hidden">
                      <img className="img-fluid" src={team3} alt="this is image" />
                    </div>
                    <div className="position-relative d-flex justify-content-center" style={{ marginTop: '-23px' }}>
                      <div className="bg-light d-flex justify-content-center pt-2 px-1">
                        <a className="btn btn-sm-square btn-primary mx-1" href="#"><i className="fab fa-facebook-f" /></a>
                        <a className="btn btn-sm-square btn-primary mx-1" href="#"><i className="fab fa-twitter" /></a>
                        <a className="btn btn-sm-square btn-primary mx-1" href="#"><i className="fab fa-instagram" /></a>
                      </div>
                    </div>
                    <div className="text-center p-4">
                      <h5 className="mb-0">Instructor Name</h5>
                      <small>Designation</small>
                    </div>
                  </div>
                </div>
                <div className="col-lg-3 col-md-6 wow fadeInUp" data-wow-delay="0.7s">
                  <div className="team-item bg-light">
                    <div className="overflow-hidden">
                      <img className="img-fluid" src={team4} alt="this is image" />
                    </div>
                    <div className="position-relative d-flex justify-content-center" style={{ marginTop: '-23px' }}>
                      <div className="bg-light d-flex justify-content-center pt-2 px-1">
                        <a className="btn btn-sm-square btn-primary mx-1" href="#"><i className="fab fa-facebook-f" /></a>
                        <a className="btn btn-sm-square btn-primary mx-1" href="#"><i className="fab fa-twitter" /></a>
                        <a className="btn btn-sm-square btn-primary mx-1" href="#"><i className="fab fa-instagram" /></a>
                      </div>
                    </div>
                    <div className="text-center p-4">
                      <h5 className="mb-0">Instructor Name</h5>
                      <small>Designation</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="container-xxl py-5 wow fadeInUp" data-wow-delay="0.1s">
            <div className="container">
              <div className="text-center">
                <h6 className="section-title bg-white text-center text-primary px-3">Testimonial</h6>
                <h1 className="mb-5">Our Students Say!</h1>
              </div>
              <Testimorial />
            </div>
          </div>
          <div className="container-fluid bg-dark text-light footer pt-5 mt-5 wow fadeIn" data-wow-delay="0.1s">
            <div className="container py-5">
              <div className="row g-5">
                <div className="col-lg-3 col-md-6">
                  <h4 className="text-white mb-3">Quick Link</h4>
                  <a className="btn btn-link" href="#">About Us</a>
                  <a className="btn btn-link" href="#">Contact Us</a>
                  <a className="btn btn-link" href="#">Privacy Policy</a>
                  <a className="btn btn-link" href="#">Terms &amp; Condition</a>
                  <a className="btn btn-link" href="#">FAQs &amp; Help</a>
                </div>
                <div className="col-lg-3 col-md-6">
                  <h4 className="text-white mb-3">Contact</h4>
                  <p className="mb-2"><i className="fa fa-map-marker" alt="this is image" />123 Street, New York, USA</p>
                  <p className="mb-2"><i className="fa fa-phone me-3" alt="this image" />+012 345 67890</p>
                  <p className="mb-2"><i className="fa fa-envelope me-3" />info@example.com</p>
                  <div className="d-flex pt-2">
                    <a className="btn btn-outline-light btn-social" href="#"><i className="fab fa-twitter" /></a>
                    <a className="btn btn-outline-light btn-social" href="#"><i className="fab fa-facebook-f" /></a>
                    <a className="btn btn-outline-light btn-social" href="#"><i className="fab fa-youtube" /></a>
                    <a className="btn btn-outline-light btn-social" href="#"><i className="fab fa-linkedin-in" /></a>
                  </div>
                </div>
                <div className="col-lg-3 col-md-6">
                  <h4 className="text-white mb-3">Gallery</h4>
                  <div className="row g-2 pt-2">
                    <div className="col-4">
                      <img className="img-fluid bg-light p-1" src={course1} alt="this is image" />
                    </div>
                    <div className="col-4">
                      <img className="img-fluid bg-light p-1" src={course2} alt="this is image" />
                    </div>
                    <div className="col-4">
                      <img className="img-fluid bg-light p-1" src={course3} alt="this is image" />
                    </div>
                    <div className="col-4">
                      <img className="img-fluid bg-light p-1" src={course1} alt="this is image" />
                    </div>
                    <div className="col-4">
                      <img className="img-fluid bg-light p-1" src={course2} alt="this is image" />
                    </div>
                    <div className="col-4">
                      <img className="img-fluid bg-light p-1" src={course3} alt="this is image" />
                    </div>
                  </div>
                </div>
                <div className="col-lg-3 col-md-6">
                  <h4 className="text-white mb-3">Newsletter</h4>
                  <p>Dolor amet sit justo amet elitr clita ipsum elitr est.</p>
                  <div className="position-relative mx-auto" style={{ maxWidth: 400 }}>
                    <input className="form-control border-0 w-100 py-3 ps-4 pe-5" type="text" placeholder="Your email" />
                    <button type="button" className="btn btn-primary py-2 position-absolute top-0 end-0 mt-2 me-2">SignUp</button>
                  </div>
                </div>
              </div>
            </div>
            <div className="container">
              <div className="copyright">
                <div className="row">
                  <div className="col-md-6 text-center text-md-start mb-3 mb-md-0">
                    © <a className="border-bottom" href="#">Your Site Name</a>
                    <a className="border-bottom" href="https://htmlcodex.com">HTML Codex</a><br /><br />
                    <a className="border-bottom" href="https://themewagon.com">ThemeWagon</a>
                  </div>
                  <div className="col-md-6 text-center text-md-end">
                    <div className="footer-menu">
                      <a href="#">Home</a>
                      <a href="#">Cookies</a>
                      <a href="#">Help</a>
                      <a href="#">FQAs</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <a href="#" className="btn btn-lg btn-primary btn-lg-square back-to-top" alt="this is image"><i className="bi bi-arrow-up" /></a>
        </div>
      </>
    );
  }
};

export default Home;
