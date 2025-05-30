import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import ScrollToTop from "../utils/ScrollToTop.jsx";
import { api } from "../utils/constant.js";
import "../css/pages/course.css";
import { useInView } from "react-intersection-observer";
import { motion, AnimatePresence } from "framer-motion";
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { useNavigate } from "react-router-dom";

const CourseCard = ({
  title,
  instructor,
  duration,
  students,
  price,
  image,
  level,
  tags,
  buttons,
  isCompleted,
  watchedPercentage,
  liveStatus,
  courseId,
  onPurchase,
  isPurchasing
}) => {
  let navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const handleButtonClick = (label, courseId) => {
    switch (label) {
      case "Continue":
        navigate("/course/"+courseId);
        break;
      case "Edit Course":
        window.location.href = `/course/edit/${courseId}`;
        break;
      case "Start LiveClass":
      case "Join LiveClass":
        navigate("/course/live/" + courseId);
        break;
      case "Purchase":
        onPurchase(courseId);
        break;
      default:
        break;
    }
  };

  const enhancedButtons = [...buttons];
  if (price === "Purchased" && liveStatus === "live" && !buttons.some(btn => btn.label === "Join LiveClass")) {
    enhancedButtons.unshift({
      label: "Join LiveClass",
      variant: "btn-danger pulse-button"
    });
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
      className={`course-card card h-100 border-0 rounded-4 overflow-hidden ${isCompleted ? "completed-course" : ""}`}
      style={{
        position: "relative",
        boxShadow: "0 10px 20px rgba(0,0,0,0.08)",
      }}
      whileHover={{
        y: -5,
        boxShadow: "0 15px 30px rgba(0,0,0,0.12)"
      }}
    >
      <div className="image-container" style={{ height: "180px", overflow: "hidden" }}>
        <img
          src={image}
          className="card-img-top"
          alt={title}
          style={{
            height: "100%",
            width: "100%",
            objectFit: "cover",
            transition: "transform 0.5s ease",
          }}
        />
      </div>

      {isCompleted && (
        <div className="completion-badge position-absolute top-0 end-0 m-2">
          <span className="badge bg-success rounded-pill px-2 py-1">
            <i className="fas fa-check-circle me-1"></i> Completed
          </span>
        </div>
      )}
      {liveStatus === "live" && (
        <div className="position-absolute top-0 start-0 m-2">
          <span className="badge bg-danger rounded-pill px-2 py-1 pulse-animation">
            <i className="fas fa-broadcast-tower me-1"></i> LIVE
          </span>
        </div>
      )}

      <div className="card-body px-4 py-3">
        <h5 className="fw-bold mb-2 text-truncate">{title}</h5>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <span className="badge bg-primary bg-opacity-10 text-primary text-uppercase rounded-pill px-3 py-1">
            {level}
          </span>
          <span className={`fw-bold ${price === "Purchased"
              ? "text-success"
              : price === "Free"
                ? "text-info"
                : "text-primary"
            }`}>
            {price}
          </span>
        </div>

        <div className="d-flex flex-wrap gap-1 mb-3">
          {tags.slice(0, 3).map((tag, i) => (
            <span key={i} className="badge bg-light text-muted border rounded-pill px-2">
              {tag.length > 12 ? `${tag.substring(0, 10)}...` : tag}
            </span>
          ))}
          {tags.length > 3 && (
            <span className="badge bg-light text-muted border rounded-pill px-2">
              +{tags.length - 3}
            </span>
          )}
        </div>

        <div className="course-meta mb-3">
          <div className="d-flex align-items-center text-muted small mb-1">
            <i className="fas fa-user-tie me-2 text-primary"></i>
            <span className="text-truncate">{instructor}</span>
          </div>
          <div className="d-flex align-items-center text-muted small mb-1">
            <i className="fas fa-clock me-2 text-primary"></i>
            <span>{duration}</span>
          </div>
          <div className="d-flex align-items-center text-muted small">
            <i className="fas fa-users me-2 text-primary"></i>
            <span>{students} Students</span>
          </div>
        </div>

        <div className="row g-2">
          {enhancedButtons.map((btn, idx) => (
            <div className={enhancedButtons.length > 2 && idx === enhancedButtons.length - 1 ? "col-12" : "col-6"} key={idx}>
              <button
                className={`btn btn-sm w-100 rounded-pill ${btn.variant} ${btn.label === "Continue" && expanded ? "active" : ""}`}
                onClick={() => handleButtonClick(btn.label, courseId)}
                disabled={isPurchasing && btn.label === "Purchase"}
                style={{
                  height: '50px',
                  minWidth: '100px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0.375rem 0.75rem',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {btn.label === "Continue" && (
                  <i className={`fas fa-${expanded ? "compress" : "expand"} me-1`}></i>
                )}
                {btn.label === "Join LiveClass" && (
                  <i className="fas fa-broadcast-tower me-1"></i>
                )}
                {btn.label === "Purchase" && isPurchasing ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Processing...
                  </>
                ) : (
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {btn.label}
                  </span>
                )}
              </button>
            </div>
          ))}
        </div>

        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-3 pt-3 border-top"
          >
            <div className="d-flex justify-content-between small mb-1">
              <span className="text-muted">Progress</span>
              <span className="fw-semibold">{watchedPercentage || 75}%</span>
            </div>
            <div className="progress mb-3" style={{ height: "6px" }}>
              <div
                className="progress-bar bg-success progress-bar-striped progress-bar-animated"
                role="progressbar"
                style={{ width: `${watchedPercentage || 75}%` }}
                aria-valuenow={watchedPercentage || 75}
                aria-valuemin="0"
                aria-valuemax="100"
              ></div>
            </div>
            {isCompleted ? (
              <button className="btn btn-success btn-sm w-100 rounded-pill">
                <i className="fas fa-certificate me-1"></i> Get Certificate
              </button>
            ) : (
              <p className="small text-center text-muted mb-0">
                Continue watching to complete
              </p>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

const Section = ({ title, courses, highlight = false, gradient, onPurchase, purchasingCourseId }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  if (!courses || courses.length === 0) return null;

  return (
    <div
      ref={ref}
      className="section-wrapper py-5 position-relative"
      style={{ background: gradient }}
    >
      <div className="container position-relative">
        <div className="text-center mb-5">
          <h2 className={`fw-bold position-relative d-inline-block ${highlight ? "text-white" : "text-dark"}`}>
            {title}
            <span className="title-underline" />
          </h2>
        </div>

        {inView && (
          <Swiper
            modules={[Navigation, Autoplay]}
            spaceBetween={20}
            slidesPerView={1}
            autoplay={{
              delay: 5000,
              disableOnInteraction: true,
            }}
            breakpoints={{
              576: { slidesPerView: 1 },
              768: { slidesPerView: 2.2 },
              992: { slidesPerView: 3.2 },
              1200: { slidesPerView: 4 },
            }}
            navigation={{
              nextEl: '.swiper-button-next',
              prevEl: '.swiper-button-prev',
            }}
            loop={courses.length > 3}
          >
            {courses.map((course, idx) => (
              <SwiperSlide key={idx}>
                <CourseCard
                  {...course}
                  onPurchase={onPurchase}
                  isPurchasing={purchasingCourseId === course.courseId}
                />
              </SwiperSlide>
            ))}
            <div className="swiper-button-next"></div>
            <div className="swiper-button-prev"></div>
          </Swiper>
        )}
      </div>
    </div>
  );
};

const PurchaseSuccessModal = ({ courseName, onClose }) => {
  const { width, height } = useWindowSize();

  return (
    <div className="modal-backdrop" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999
    }}>
      <Confetti
        width={width}
        height={height}
        recycle={false}
        numberOfPieces={500}
      />
      <motion.div
        className="modal-content bg-white rounded-4 p-5 text-center"
        style={{ maxWidth: '500px', width: '90%' }}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
      >
        <h3 className="fw-bold mb-3">Purchase Successful!</h3>
        <p className="mb-4">
          You've successfully enrolled in <strong>{courseName}</strong>. Start learning now!
        </p>
        <button
          onClick={onClose}
          className="btn btn-primary btn-lg px-4"
        >
          Start Learning
        </button>
      </motion.div>
    </div>
  );
};

const PaymentProcessingModal = () => {
  return (
    <div className="modal-backdrop" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999
    }}>
      <div className="modal-content bg-white rounded-4 p-5 text-center" style={{ maxWidth: '400px' }}>
        <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }} role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <h4 className="mb-3">Processing Payment</h4>
        <p className="text-muted">Please wait while we process your payment...</p>
      </div>
    </div>
  );
};

const CoursePage = () => {
  const { user } = useSelector((state) => state.user);
  const [purchasedCourses, setPurchasedCourses] = useState([]);
  const [createdCourses, setCreatedCourses] = useState([]);
  const [otherCourses, setOtherCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [purchasingCourseId, setPurchasingCourseId] = useState(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState({
    show: false,
    courseName: ''
  });

  const gradients = {
    purchased: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    created: "linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)",
    others: "linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)"
  };

  const mapCourseData = (course, isPurchased = false, isCreatedByYou = false) => {
    let buttons = [];

    if (isPurchased) {
      buttons.push({
        label: "Continue",
        variant: "btn-success"
      });
    } else if (isCreatedByYou) {
      buttons.push(
        { label: "Continue", variant: "btn-success" },
        { label: "Edit Course", variant: "btn-warning" },
        { label: "Start LiveClass", variant: "btn-danger" }
      );
    } else {
      buttons.push(
        { label: "Read More", variant: "btn-outline-primary" },
        { label: "Purchase", variant: "btn-primary" }
      );
    }

    return {
      title: course.name || "Untitled Course",
      instructor: course.createdBy?.name || "Unknown Instructor",
      duration: course.duration || "Not specified",
      students: course.studentsCount || course.students || 0,
      price: isPurchased
        ? "Purchased"
        : course.price === 0
          ? "Free"
          : `₹${course.price || 0}`,
      level: course.level || "Beginner",
      tags: course.tags || ["New"],
      image: course.thumbnail?.url || "https://source.unsplash.com/random/300x200/?education",
      buttons,
      isCompleted: isPurchased && course.watchedPercentage === 100,
      watchedPercentage: course.watchedPercentage || 0,
      liveStatus: course.liveStatus || "not-started",
      courseId: course._id,
    };
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        return resolve();
      }
      
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => {
        console.log('Razorpay SDK loaded');
        resolve();
      };
      script.onerror = () => {
        console.error('Failed to load Razorpay SDK');
        setError('Failed to load payment processor. Please try again later.');
        resolve();
      };
      document.body.appendChild(script);
    });
  };

  const handlePurchase = async (courseId) => {
    try {
      setPurchasingCourseId(courseId);
      setError(null);

      // Find the course to purchase
      const courseToPurchase = otherCourses.find(c => c.courseId === courseId);
      if (!courseToPurchase) {
        throw new Error('Course not found');
      }

      // If course is free, directly complete purchase
      if (courseToPurchase.price === "Free" || courseToPurchase.price === "$0") {
        await completePurchase(courseId, courseToPurchase);
        return;
      }

      // For paid courses, initialize Razorpay payment
      setPaymentProcessing(true);
      
      // Load Razorpay script if not already loaded
      await loadRazorpayScript();

      if (!window.Razorpay) {
        throw new Error('Payment processor failed to load');
      }

      // Create order on backend
      const config = {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      };

      const orderResponse = await api.post(`course/${courseId}/create-order`, {}, config);
      if (!orderResponse.data.success) {
        throw new Error(orderResponse.data.message || 'Failed to create order');
      }

      const { orderId, amount, currency, key } = orderResponse.data;
      console.log(orderResponse)
      console.log(orderId)
      // Razorpay options
      const options = {
        key: key,
        amount: amount,
        currency: currency,
        name: 'educine',
        description: `Purchase of ${courseToPurchase.title}`,
        order_id: orderId,
        handler: async (response) => {
          try {
            // Verify payment on backend
            const verificationResponse = await api.post('course/verify-payment', {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              courseId: courseId
            }, config);

            if (verificationResponse.data.success) {
              // Complete the purchase
              await completePurchase(courseId, courseToPurchase);
            } else {
              throw new Error(verificationResponse.data.message || 'Payment verification failed');
            }
          } catch (err) {
            setError(err.message || 'Payment verification failed');
          } finally {
            setPaymentProcessing(false);
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: user.phone || ''
        },
        theme: {
          color: '#4f46e5'
        },
        modal: {
          ondismiss: () => {
            setPaymentProcessing(false);
            setPurchasingCourseId(null);
          }
        }
      };

      // Open Razorpay payment modal
      const rzp = new window.Razorpay(options);
      rzp.open();

      rzp.on('payment.failed', (response) => {
        setError(response.error.description || 'Payment failed. Please try again.');
        setPaymentProcessing(false);
        setPurchasingCourseId(null);
      });

    } catch (err) {
      console.error('Purchase error:', err);
      setError(err.response?.data?.message || err.message || "Failed to initiate purchase");
      setPaymentProcessing(false);
      setPurchasingCourseId(null);
    }
  };

  const completePurchase = async (courseId, courseToPurchase) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      };

      // Call the purchase API
      await api.post(`course/${courseId}/purchase`, {}, config);

      // Show success modal
      setPurchaseSuccess({
        show: true,
        courseName: courseToPurchase?.title || 'the course'
      });

      // Update the courses lists
      const updatedOtherCourses = otherCourses.filter(c => c.courseId !== courseId);
      setOtherCourses(updatedOtherCourses);

      // Add to purchased courses
      if (courseToPurchase) {
        const newPurchasedCourse = {
          ...courseToPurchase,
          price: "Purchased",
          buttons: [{ label: "Continue", variant: "btn-success" }]
        };
        setPurchasedCourses(prev => [...prev, newPurchasedCourse]);
      }

    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to complete purchase");
    } finally {
      setPaymentProcessing(false);
      setPurchasingCourseId(null);
    }
  };

  useEffect(() => {
    async function fetchCourses() {
      try {
        setLoading(true);
        setError(null);

        const config = {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        };

        const [purchasedRes, createdRes, othersRes] = await Promise.all([
          api.get("course/purchased/get", config),
          api.get("course/you", config),
          api.get("course/get", config),
        ]);

        const purchased = purchasedRes.data.data.map((c) =>
          mapCourseData(c, true, false)
        );
        const created = createdRes.data.data.map((c) =>
          mapCourseData(c, false, true)
        );

        const purchasedIds = new Set(purchasedRes.data.data.map((c) => c._id));
        const createdIds = new Set(createdRes.data.data.map((c) => c._id));
        const filteredOthers = othersRes.data.data.filter(
          (c) => !purchasedIds.has(c._id) && !createdIds.has(c._id)
        );
        const others = filteredOthers.map((c) => mapCourseData(c));

        setPurchasedCourses(purchased);
        setCreatedCourses(created);
        setOtherCourses(others);
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Failed to load courses");
      } finally {
        setLoading(false);
      }
    }

    if (user?.token) {
      fetchCourses();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
        <div className="text-center">
          <div className="spinner-grow text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <h4 className="mt-4 text-primary">Loading your courses...</h4>
          <p className="text-muted">Please wait while we prepare your learning dashboard</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
        <div className="alert alert-danger text-center p-4" style={{ maxWidth: '500px' }}>
          <i className="fas fa-exclamation-triangle fa-2x mb-3 text-danger"></i>
          <h4>Oops! Something went wrong</h4>
          <p className="mb-3">{error}</p>
          <button
            className="btn btn-primary"
            onClick={() => window.location.reload()}
          >
            <i className="fas fa-sync-alt me-2"></i> Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <ScrollToTop />
      <div className="course-page">
        <AnimatePresence>
          {paymentProcessing && <PaymentProcessingModal />}
          {purchaseSuccess.show && (
            <PurchaseSuccessModal
              courseName={purchaseSuccess.courseName}
              onClose={() => setPurchaseSuccess({ show: false, courseName: '' })}
            />
          )}
        </AnimatePresence>

        <Section
          title="🎓 Your Learning Journey"
          courses={purchasedCourses}
          highlight
          gradient={gradients.purchased}
        />

        <Section
          title="📚 Your Created Courses"
          courses={createdCourses}
          gradient={gradients.created}
        />

        <Section
          title="🌐 Explore More Courses"
          courses={otherCourses}
          gradient={gradients.others}
          onPurchase={handlePurchase}
          purchasingCourseId={purchasingCourseId}
        />

        {/* Empty state if no courses at all */}
        {purchasedCourses.length === 0 &&
          createdCourses.length === 0 &&
          otherCourses.length === 0 && (
            <div className="container py-5 my-5 text-center">
              <div className="empty-state bg-white p-5 rounded-4 shadow-sm">
                <i className="fas fa-book-open fa-4x text-muted mb-4"></i>
                <h3 className="mb-3">No Courses Found</h3>
                <p className="text-muted mb-4">
                  It looks like you haven't purchased or created any courses yet.
                  Explore our catalog to get started!
                </p>
                <button
                  className="btn btn-primary btn-lg px-4"
                  onClick={() => window.location.href = "/courses"}
                >
                  <i className="fas fa-search me-2"></i> Browse Courses
                </button>
              </div>
            </div>
          )}
      </div>
    </>
  );
};

export default CoursePage;