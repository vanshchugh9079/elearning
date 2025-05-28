import { useState, useEffect } from "react";
import {
    Container, Card, Tabs, Tab, Form, Button,
    InputGroup, Spinner, Alert, Row, Col
} from "react-bootstrap";
import { FaEye, FaEyeSlash, FaSignInAlt, FaKey, FaEnvelope, FaMobileAlt } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import "../css/login/login.css";
import { api } from "../utils/constant";
import { useNavigate } from "react-router-dom";
import AlertModal from "../utils/alertModel";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/slice/userSlice";

function LoginForm() {
    const [key, setKey] = useState("password");
    const [formData, setFormData] = useState({ email: "", password: "", otp: "" });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");
    const [isErrorMsg, setIsErrorMsg] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [otpSent, setOtpSent] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);
    const [activeTabBg, setActiveTabBg] = useState("password");
    const [isFlipping, setIsFlipping] = useState(false);

    // Enhanced animation variants
    const cardVariants = {
        hidden: { opacity: 0, y: 50, scale: 0.95 },
        visible: { 
            opacity: 1, 
            y: 0,
            scale: 1,
            transition: { 
                duration: 0.8,
                ease: [0.2, 0.8, 0.2, 1],
                delay: 0.1
            }
        }
    };

    const inputVariants = {
        focus: { 
            boxShadow: "0 0 0 3px rgba(100, 108, 255, 0.2)",
            borderColor: "#646cff",
            transition: { duration: 0.2 }
        },
        hover: {
            borderColor: "#646cff",
            transition: { duration: 0.2 }
        }
    };

    const flipVariants = {
        hidden: { rotateY: 90, opacity: 0, scale: 0.8 },
        visible: { rotateY: 0, opacity: 1, scale: 1 },
        exit: { rotateY: -90, opacity: 0, scale: 0.8 }
    };

    const buttonHover = {
        hover: {
            scale: 1.02,
            boxShadow: "0 5px 15px rgba(100, 108, 255, 0.4)",
            transition: { 
                type: "spring",
                stiffness: 400,
                damping: 10
            }
        },
        tap: {
            scale: 0.98,
            boxShadow: "0 2px 5px rgba(100, 108, 255, 0.2)"
        }
    };

    useEffect(() => {
        let timer;
        if (resendTimer > 0) {
            timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [resendTimer]);

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
        if (errors[e.target.name]) {
            setErrors(prev => ({ ...prev, [e.target.name]: "" }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.email) newErrors.email = "Email is required";
        else if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = "Please enter a valid email";
        
        if (key === "password" && !formData.password) newErrors.password = "Password is required";
        if (key === "otp" && otpSent && !formData.otp) newErrors.otp = "OTP is required";
        return newErrors;
    };

    const handlePasswordLogin = async (e) => {
        e.preventDefault();
        const validationErrors = validate();
        if (Object.keys(validationErrors).length) {
            setErrors(validationErrors);
            return;
        }
        setErrors({});
        setLoading(true);
        try {
            const response = await api.post("user/login", {
                email: formData.email,
                password: formData.password,
                loginType: "password",
            });

            setSuccessMsg("Logged in with Password!");

            AlertModal({
                icon: "success",
                title: `Welcome back ${response.data.user.name}`,
                message: "Your account created successfully",
                type: "success",
                timer: 2000,
                showConfirmButton: false,
                showDenyButton: false,
                showCancelButton: false,
            }).then(() => {
                dispatch(setUserData({
                    user: response.data.user,
                    loggedIn: true
                }));
                navigate("/");
            });

            setIsErrorMsg(false);
        } catch (err) {
            console.error(err);
            setSuccessMsg(err.response?.data?.message || "Login failed");
            setIsErrorMsg(true);
        } finally {
            setLoading(false);
        }
    };

    const handleSendOtp = async () => {
        if (!formData.email) {
            setErrors({ email: "Email is required to send OTP" });
            return;
        }
        setLoading(true);
        try {
            const res = await api.post("user/login", {
                email: formData.email,
                loginType: "otp"
            });
            setOtpSent(true);
            setResendTimer(60);
            setSuccessMsg("OTP sent to your email!");
            setIsErrorMsg(false);
        } catch (err) {
            console.error(err);
            setSuccessMsg(err.response?.data?.message || "Failed to send OTP");
            setIsErrorMsg(true);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        const validationErrors = validate();
        if (Object.keys(validationErrors).length) {
            setErrors(validationErrors);
            return;
        }
        setErrors({});
        setLoading(true);
        try {
            const res = await api.post("user/login/verify-otp", {
                email: formData.email,
                otp: formData.otp,
                loginType: "otp",
            });

            const user = res.data.user;

            AlertModal({
                icon: "success",
                title: `Welcome back ${user.name}`,
                message: "You have successfully logged in",
                type: "success",
                timer: 2000,
                showConfirmButton: false,
                showDenyButton: false,
                showCancelButton: false,
            }).then(() => {
                dispatch(setUserData({
                    user,
                    loggedIn: true
                }));
                navigate("/");
            });

            setSuccessMsg("OTP Verified. Logged in!");
            setIsErrorMsg(false);
        } catch (err) {
            console.error(err);
            const msg = err?.response?.data?.message || "OTP verification failed";
            setSuccessMsg(msg);
            setIsErrorMsg(true);
        } finally {
            setLoading(false);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(prev => !prev);
    };

    const handleTabChange = (tab) => {
        if (key === tab) return;
        
        setIsFlipping(true);
        setTimeout(() => {
            setKey(tab);
            setActiveTabBg(tab);
            setSuccessMsg("");
            setErrors({});
            setOtpSent(false);
            setIsFlipping(false);
        }, 300);
    };

    // Enhanced floating animation for background elements
    const floatingElements = Array.from({ length: 15 }).map((_, i) => {
        const size = Math.random() * 100 + 50;
        const duration = Math.random() * 15 + 10;
        const delay = Math.random() * 5;
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        
        return (
            <motion.div
                key={i}
                style={{
                    position: 'absolute',
                    width: `${size}px`,
                    height: `${size}px`,
                    borderRadius: '50%',
                    background: `rgba(255, 255, 255, ${Math.random() * 0.1 + 0.05})`,
                    top: `${y}%`,
                    left: `${x}%`,
                    filter: 'blur(15px)',
                }}
                animate={{
                    y: [0, Math.random() * 100 - 50],
                    x: [0, Math.random() * 100 - 50],
                    rotate: [0, Math.random() * 360],
                }}
                transition={{
                    duration: duration,
                    repeat: Infinity,
                    repeatType: 'reverse',
                    ease: 'easeInOut',
                    delay: delay,
                }}
            />
        );
    });

    return (
        <div style={styles.wrapper} className="d-flex w-100 min-vh-100 m-cont">
            <div style={styles.overlay}></div>
            
            {/* Animated floating background elements */}
            {floatingElements}
            
            {/* Book corner decoration with enhanced animation */}
            <motion.div 
                style={styles.bookCorner}
                animate={{ 
                    rotate: [0, -5, 0],
                    y: [0, -10, 0],
                    x: [0, 5, 0]
                }}
                transition={{
                    duration: 12,
                    repeat: Infinity,
                    repeatType: 'reverse',
                    ease: 'easeInOut'
                }}
            />
            
            <Container fluid className="position-relative z-2 d-flex vw-100 justify-content-center align-items-center p-3 cont">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={cardVariants}
                    style={{ width: "100%", maxWidth: "450px", perspective: "1000px" }}
                >
                    <Card style={styles.card} className="border-0">
                        <Card.Body className="p-4">
                            <div className="text-center mb-4">
                                <motion.div
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    whileTap={{ scale: 0.95 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                >
                                    <div style={styles.logo}>
                                        <FaSignInAlt size={28} color="#646cff" />
                                    </div>
                                </motion.div>
                                <motion.h3 
                                    className="mt-3 mb-2 text-gradient"
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    Welcome Back
                                </motion.h3>
                                <motion.p 
                                    className="text-muted"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    Sign in to access your account
                                </motion.p>
                            </div>

                            <AnimatePresence mode="wait">
                                {successMsg && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
                                        transition={{ 
                                            type: "spring",
                                            stiffness: 500,
                                            damping: 30
                                        }}
                                    >
                                        <Alert 
                                            variant={isErrorMsg ? "danger" : "success"} 
                                            className="border-0 shadow-sm"
                                            onClose={() => setSuccessMsg("")}
                                            dismissible
                                        >
                                            {successMsg}
                                        </Alert>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <Tabs 
                                activeKey={key} 
                                onSelect={handleTabChange} 
                                className="mb-4 custom-tabs"
                                fill
                            >
                                <Tab 
                                    eventKey="password" 
                                    title={
                                        <motion.div 
                                            className="d-flex align-items-center justify-content-center"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <FaKey className="me-2" />
                                            <span>Password</span>
                                        </motion.div>
                                    }
                                >
                                    <AnimatePresence mode="wait">
                                        {!isFlipping && key === "password" && (
                                            <motion.div
                                                key="password-content"
                                                initial="hidden"
                                                animate="visible"
                                                exit="exit"
                                                variants={flipVariants}
                                                transition={{ 
                                                    duration: 0.4,
                                                    ease: "easeInOut"
                                                }}
                                            >
                                                <Form onSubmit={handlePasswordLogin}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label className="fw-medium text-black">Email Address</Form.Label>
                                                        <motion.div 
                                                            whileHover="hover"
                                                            whileFocus="focus" 
                                                            variants={inputVariants}
                                                        >
                                                            <InputGroup>
                                                                <InputGroup.Text style={styles.inputPrefix}>
                                                                    <FaEnvelope />
                                                                </InputGroup.Text>
                                                                <Form.Control
                                                                    type="email"
                                                                    name="email"
                                                                    placeholder="your@email.com"
                                                                    value={formData.email}
                                                                    onChange={handleChange}
                                                                    isInvalid={!!errors.email}
                                                                    style={styles.input}
                                                                    className="form-control-black"
                                                                />
                                                            </InputGroup>
                                                        </motion.div>
                                                        {errors.email && (
                                                            <motion.small 
                                                                className="text-danger"
                                                                initial={{ opacity: 0, y: -5 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                transition={{ duration: 0.2 }}
                                                            >
                                                                {errors.email}
                                                            </motion.small>
                                                        )}
                                                    </Form.Group>

                                                    <Form.Group className="mb-4">
                                                        <Form.Label className="fw-medium text-muted">Password</Form.Label>
                                                        <motion.div 
                                                            whileHover="hover"
                                                            whileFocus="focus" 
                                                            variants={inputVariants}
                                                        >
                                                            <InputGroup style={{ position: "relative" }}>
                                                                <InputGroup.Text style={styles.inputPrefix}>
                                                                    <FaKey />
                                                                </InputGroup.Text>
                                                                <Form.Control
                                                                    type={showPassword ? "text" : "password"}
                                                                    name="password"
                                                                    placeholder="Enter password"
                                                                    value={formData.password}
                                                                    onChange={handleChange}
                                                                    isInvalid={!!errors.password}
                                                                    autoComplete="current-password"
                                                                    style={styles.input}
                                                                    className="border-start-0"
                                                                />
                                                                <InputGroup.Text 
                                                                    as={Button} 
                                                                    variant="link" 
                                                                    onClick={togglePasswordVisibility}
                                                                    style={styles.eyeButton}
                                                                >
                                                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                                                </InputGroup.Text>
                                                            </InputGroup>
                                                        </motion.div>
                                                        {errors.password && (
                                                            <motion.small 
                                                                className="text-danger"
                                                                initial={{ opacity: 0, y: -5 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                transition={{ duration: 0.2 }}
                                                            >
                                                                {errors.password}
                                                            </motion.small>
                                                        )}
                                                        <div className="text-end mt-2">
                                                            <motion.a 
                                                                href="/forgot-password" 
                                                                className="text-decoration-none small"
                                                                whileHover={{ scale: 1.02 }}
                                                                whileTap={{ scale: 0.98 }}
                                                            >
                                                                Forgot password?
                                                            </motion.a>
                                                        </div>
                                                    </Form.Group>

                                                    <motion.div
                                                        variants={buttonHover}
                                                        whileHover="hover"
                                                        whileTap="tap"
                                                    >
                                                        <Button 
                                                            type="submit" 
                                                            variant="primary" 
                                                            className="w-100 fw-bold py-2 rounded-pill shadow-sm"
                                                            disabled={loading}
                                                            style={styles.button}
                                                        >
                                                            {loading ? (
                                                                <Spinner 
                                                                    size="sm" 
                                                                    animation="border" 
                                                                    role="status"
                                                                    as="span"
                                                                />
                                                            ) : (
                                                                <span>Sign In</span>
                                                            )}
                                                        </Button>
                                                    </motion.div>
                                                </Form>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </Tab>

                                <Tab 
                                    eventKey="otp" 
                                    title={
                                        <motion.div 
                                            className="d-flex align-items-center justify-content-center"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <FaMobileAlt className="me-2" />
                                            <span>OTP</span>
                                        </motion.div>
                                    }
                                >
                                    <AnimatePresence mode="wait">
                                        {!isFlipping && key === "otp" && (
                                            <motion.div
                                                key="otp-content"
                                                initial="hidden"
                                                animate="visible"
                                                exit="exit"
                                                variants={flipVariants}
                                                transition={{ 
                                                    duration: 0.4,
                                                    ease: "easeInOut"
                                                }}
                                            >
                                                <Form onSubmit={handleVerifyOtp}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label className="fw-medium text-muted">Email Address</Form.Label>
                                                        <motion.div 
                                                            whileHover="hover"
                                                            whileFocus="focus" 
                                                            variants={inputVariants}
                                                        >
                                                            <InputGroup>
                                                                <InputGroup.Text style={styles.inputPrefix}>
                                                                    <FaEnvelope />
                                                                </InputGroup.Text>
                                                                <Form.Control
                                                                    type="email"
                                                                    name="email"
                                                                    placeholder="your@email.com"
                                                                    value={formData.email}
                                                                    onChange={handleChange}
                                                                    isInvalid={!!errors.email}
                                                                    style={styles.input}
                                                                    className="border-start-0"
                                                                    readOnly={otpSent}
                                                                />
                                                            </InputGroup>
                                                        </motion.div>
                                                        {errors.email && (
                                                            <motion.small 
                                                                className="text-danger"
                                                                initial={{ opacity: 0, y: -5 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                transition={{ duration: 0.2 }}
                                                            >
                                                                {errors.email}
                                                            </motion.small>
                                                        )}
                                                    </Form.Group>

                                                    <AnimatePresence>
                                                        {otpSent && (
                                                            <motion.div
                                                                initial={{ opacity: 0, height: 0 }}
                                                                animate={{ 
                                                                    opacity: 1, 
                                                                    height: "auto",
                                                                    transition: { 
                                                                        duration: 0.4,
                                                                        ease: "easeInOut"
                                                                    } 
                                                                }}
                                                                exit={{ 
                                                                    opacity: 0, 
                                                                    height: 0,
                                                                    transition: { 
                                                                        duration: 0.3,
                                                                        ease: "easeIn"
                                                                    }
                                                                }}
                                                            >
                                                                <Form.Group className="mb-3">
                                                                    <Form.Label className="fw-medium text-muted">OTP Code</Form.Label>
                                                                    <motion.div 
                                                                        whileHover="hover"
                                                                        whileFocus="focus" 
                                                                        variants={inputVariants}
                                                                    >
                                                                        <InputGroup>
                                                                            <InputGroup.Text style={styles.inputPrefix}>
                                                                                <FaKey />
                                                                            </InputGroup.Text>
                                                                            <Form.Control
                                                                                type="text"
                                                                                name="otp"
                                                                                placeholder="Enter 6-digit OTP"
                                                                                value={formData.otp}
                                                                                onChange={handleChange}
                                                                                isInvalid={!!errors.otp}
                                                                                style={styles.input}
                                                                                className="border-start-0"
                                                                            />
                                                                        </InputGroup>
                                                                    </motion.div>
                                                                    {errors.otp && (
                                                                        <motion.small 
                                                                            className="text-danger"
                                                                            initial={{ opacity: 0, y: -5 }}
                                                                            animate={{ opacity: 1, y: 0 }}
                                                                            transition={{ duration: 0.2 }}
                                                                        >
                                                                            {errors.otp}
                                                                        </motion.small>
                                                                    )}
                                                                    <div className="text-end mt-2">
                                                                        {resendTimer > 0 ? (
                                                                            <small className="text-muted">Resend OTP in {resendTimer}s</small>
                                                                        ) : (
                                                                            <motion.button 
                                                                                type="button" 
                                                                                className="btn btn-link p-0 text-decoration-none small"
                                                                                onClick={handleSendOtp}
                                                                                whileHover={{ scale: 1.05 }}
                                                                                whileTap={{ scale: 0.95 }}
                                                                            >
                                                                                Resend OTP
                                                                            </motion.button>
                                                                        )}
                                                                    </div>
                                                                </Form.Group>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>

                                                    {!otpSent ? (
                                                        <motion.div
                                                            variants={buttonHover}
                                                            whileHover="hover"
                                                            whileTap="tap"
                                                        >
                                                            <Button 
                                                                variant="primary" 
                                                                className="w-100 fw-bold py-2 rounded-pill shadow-sm"
                                                                onClick={handleSendOtp} 
                                                                disabled={loading}
                                                                style={styles.button}
                                                            >
                                                                {loading ? (
                                                                    <Spinner 
                                                                        size="sm" 
                                                                        animation="border" 
                                                                        role="status"
                                                                        as="span"
                                                                    />
                                                                ) : (
                                                                    <span>Send OTP</span>
                                                                )}
                                                            </Button>
                                                        </motion.div>
                                                    ) : (
                                                        <motion.div
                                                            variants={buttonHover}
                                                            whileHover="hover"
                                                            whileTap="tap"
                                                        >
                                                            <Button 
                                                                type="submit" 
                                                                variant="success" 
                                                                className="w-100 fw-bold py-2 rounded-pill shadow-sm"
                                                                disabled={loading}
                                                                style={styles.button}
                                                            >
                                                                {loading ? (
                                                                    <Spinner 
                                                                        size="sm" 
                                                                        animation="border" 
                                                                        role="status"
                                                                        as="span"
                                                                    />
                                                                ) : (
                                                                    <span>Verify OTP</span>
                                                                )}
                                                            </Button>
                                                        </motion.div>
                                                    )}
                                                </Form>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </Tab>
                            </Tabs>

                            <motion.div 
                                className="text-center mt-4 pt-2 border-top"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                            >
                                <small className="text-muted">
                                    Don't have an account?{' '}
                                    <motion.a 
                                        href="/register" 
                                        className="text-decoration-none fw-bold"
                                        style={{ color: "#646cff" }}
                                        whileHover={{ 
                                            scale: 1.05,
                                            textShadow: "0 0 5px rgba(100, 108, 255, 0.5)"
                                        }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        Sign up
                                    </motion.a>
                                </small>
                            </motion.div>
                        </Card.Body>
                    </Card>
                </motion.div>
            </Container>
        </div>
    );
}

const styles = {
    wrapper: {
        position: 'relative',
        minHeight: '100vh',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundImage: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        overflow: 'hidden',
    },
    overlay: {
        position: 'absolute',
        top: 0, left: 0, bottom: 0, right: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        zIndex: 1,
    },
    bookCorner: {
        position: 'absolute',
        top: '50px',
        right: '50px',
        width: '200px',
        height: '200px',
        backgroundImage: 'url("https://www.transparentpng.com/thumb/book/7Z1Q7Q-open-book-free-cut-out.png")',
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        opacity: 0.1,
        zIndex: 2,
    },
    card: {
        width: "100%",
        padding: "1.5rem",
        borderRadius: "1.25rem",
        boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
        backgroundColor: "rgba(255, 255, 255, 0.97)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255, 255, 255, 0.25)",
        transformStyle: "preserve-3d",
    },
    logo: {
        width: "60px",
        height: "60px",
        borderRadius: "50%",
        backgroundColor: "rgba(100, 108, 255, 0.1)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto",
    },
    input: {
        backgroundColor: "rgba(245, 245, 245, 0.8)",
        borderLeft: "none",
        height: "45px",
    },
    inputPrefix: {
        backgroundColor: "rgba(245, 245, 245, 0.8)",
        borderRight: "none",
    },
    eyeButton: {
        position: "absolute",
        right: "0",
        top: "0",
        height: "100%",
        backgroundColor: "transparent",
        border: "none",
        color: "#6c757d",
        zIndex: 5,
        cursor: "pointer",
    },
    button: {
        background: "linear-gradient(90deg, #646cff 0%, #7b64ff 100%)",
        border: "none",
        letterSpacing: "0.5px",
        position: "relative",
        overflow: "hidden",
    },
    tabContent: {
        padding: "20px 0",
    }
};

export default LoginForm;