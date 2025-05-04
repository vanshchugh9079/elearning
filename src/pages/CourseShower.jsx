import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useParams } from 'react-router-dom';
import { api } from '../utils/constant';
import { useSelector } from 'react-redux';

const CourseShower = () => {
  let [course, setCourse] = useState({});
  let { user } = useSelector((state) => state.user);
  let [purchase, setPurchase] = useState(false);
  let { id } = useParams();

  useEffect(() => {
    const getCourse = async () => {
      try {
        const response = await api.get(`course/get/${id}`, {
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        });
        setCourse(response.data.data);
        setPurchase(response.data.purchase);
      } catch (error) {
        console.error(error);
      }
    };
    getCourse();
  }, [id, user.token]);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePurchase = async () => {
    const res = await loadRazorpayScript();
    if (!res) {
      alert("Razorpay SDK failed to load.");
      return;
    }

    try {
      const orderResponse = await api.post("/payment/checkout", {
        amount: course.price * 100, // amount in paise
        courseId: course._id
      }, {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });

      const { order } = orderResponse.data;

      const options = {
        key: "YOUR_RAZORPAY_KEY_ID", // Replace with your Razorpay key
        amount: order.amount,
        currency: "INR",
        name: "Course Purchase",
        description: `Purchase for ${course.name}`,
        image: "/logo.png", // optional
        order_id: order.id,
        handler: async (response) => {
          try {
            const verifyResponse = await api.post("/payment/verify", {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              courseId: course._id
            }, {
              headers: {
                Authorization: `Bearer ${user.token}`
              }
            });

            if (verifyResponse.data.success) {
              alert("Payment successful! You now have access to the course.");
              setPurchase(true);
            }
          } catch (err) {
            console.error("Payment verification failed", err);
            alert("Payment verification failed. Please try again.");
          }
        },
        prefill: {
          name: user.name,
          email: user.email
        },
        theme: {
          color: "#3399cc"
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (error) {
      console.error("Payment initiation failed", error);
      alert("Unable to initiate payment. Please try again later.");
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center mb-auto min-vh-100 bg-light p-0">
      <div className="card shadow-lg border-0 rounded-4 p-4 text-center mb-auto w-100 mt-2" style={{ maxWidth: '400px' }}>
        <img
          src={course?.thumbnail?.url}
          alt={course.name}
          className="card-img-top rounded ms-auto me-auto"
          style={{ height: '200px', objectFit: 'cover' }}
        />
        <div className="card-body">
          <h4 className="card-title fw-bold">{course.name}</h4>
          <p className="text-muted mb-1">Instructor: <strong>{course?.createdBy?.name}</strong></p>
          <p className="text-muted">Duration: <strong>5 Weeks</strong></p>
          <p className="card-text fst-italic">{course.description}</p>
          <p className="card-text mb-1">Let's get started with the course at </p>
          <h4 className="fw-bold text-primary mb-3 p-0">₹{course.price}</h4>
          {
            purchase &&
            <button className="btn btn-primary btn-lg w-100" onClick={handlePurchase}>Buy Now</button>
          }
          {
            !purchase &&
            <p className="text-success fw-bold mt-3">You have already purchased this course.</p>
          }
        </div>
      </div>
    </div>
  );
};

export default CourseShower;
