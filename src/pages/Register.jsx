import { useState, useEffect } from "react";
import {
    Container,
    Card,
    Form,
    Button,
    Spinner,
    Alert,
    InputGroup,
} from "react-bootstrap";
import { FaEye, FaEyeSlash, FaTimes, FaUser, FaEnvelope, FaKey, FaImage } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import "../css/login/login.css";
import { api } from "../utils/constant";
import AlertModal from "../utils/alertModel";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setUserData } from "../redux/slice/userSlice";

function RegisterForm() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        avatar: null,
    });
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState(["", "", "", ""]);
    const [otpVerified, setOtpVerified] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);
    const [resendAvailable, setResendAvailable] = useState(false);
    const { user } = useSelector(state => state.user);

    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Animation variants
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
            transition: { duration: 0.2 }
        },
        hover: {
            transition: { duration: 0.2 }
        },
        error: {
            boxShadow: "0 0 0 3px rgba(220, 53, 69, 0.2)",
            transition: { duration: 0.2 }
        }
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
        if (otpSent && resendTimer > 0) {
            timer = setInterval(() => {
                setResendTimer((prev) => prev - 1);
            }, 1000);
        } else if (resendTimer === 0) {
            setResendAvailable(true);
        }
        return () => clearInterval(timer);
    }, [resendTimer, otpSent]);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === "avatar") {
            const file = files[0];
            setFormData((prev) => ({ ...prev, avatar: file }));
            if (file) {
                const reader = new FileReader();
                reader.onloadend = () => setAvatarPreview(reader.result);
                reader.readAsDataURL(file);
            } else {
                setAvatarPreview(null);
            }
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleRemoveAvatar = () => {
        setFormData((prev) => ({ ...prev, avatar: null }));
        setAvatarPreview(null);
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.name) newErrors.name = "Name is required";
        if (!formData.email) newErrors.email = "Email is required";
        if (!formData.password) newErrors.password = "Password is required";
        return newErrors;
    };

    const handleOtpChange = (index, value) => {
        if (/^\d?$/.test(value)) {
            const newOtp = [...otp];
            newOtp[index] = value;
            setOtp(newOtp);
            if (value && index < 3) {
                document.getElementById(`otp-${index + 1}`)?.focus();
            }
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === "Backspace" && otp[index] === "" && index > 0) {
            document.getElementById(`otp-${index - 1}`)?.focus();
        }
    };

    const handleRegister = async () => {
        const data = new FormData();
        data.append("name", formData.name);
        data.append("email", formData.email);
        data.append("password", formData.password);
        if (formData.avatar) {
            data.append("avatar", formData.avatar);
        }
        try {
            setLoading(true);
            const response = await api.post("user/register", data);
            setOtpSent(true);
            setLoading(false);
            console.log("Register success:", response.data);
            setResendTimer(60);
            setResendAvailable(false);
            setTimeout(() => {
                setLoading(false);
                setSuccessMsg("OTP sent to your email ");
            }, 1000);
        } catch (error) {
            const msg = error.response?.data?.message || "Registration failed.";
            setOtpSent(false);
            AlertModal({
                icon: "error",
                title: msg,
                message: msg,
                type: "error",
                timer: 1500,
                showDenyButton: false,
                showCancelButton: false,
            });
            console.error("Register failed:", msg);
        }
    };

    const handleConfirmOtp = async () => {
        try {
            const response = await api.post("user/register/verify-otp", {
                otp: otp.join(""),
                email: formData.email,
            });
            console.log("OTP verified:", response.data);
            setOtpVerified(true);
            dispatch(setUserData({ user: response.data.user || response.data.data.user , loggedIn: true }));
            AlertModal({
                icon: "success",
                title: "Your account created successfully",
                message: "Your account created successfully",
                type: "success",
                timer: 2000,
                showConfirmButton: false,
                showDenyButton: false,
                showCancelButton: false,
            }).then(() => {
                navigate("/");
            });

            setSuccessMsg("Your account created successfully");
        } catch (error) {
            const msg = error.response?.data?.message || "OTP verification failed.";
            setSuccessMsg(msg);
            console.error("OTP verification failed:", msg);

            AlertModal({
                icon: "error",
                title: "Invalid OTP",
                message: msg,
                type: "error",
                timer: 2000,
                showConfirmButton: false,
                showDenyButton: false,
                showCancelButton: false,
            });
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword((prev) => !prev);
    };

    const handleResendOtp = () => {
        setResendTimer(60);
        setResendAvailable(false);
        handleRegister();
        setSuccessMsg("OTP resent successfully");
    };

    // Floating background elements
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
        <div style={styles.wrapper} className="d-flex w-100">
            <div style={styles.overlay}></div>
            
            {/* Animated floating background elements */}
            {floatingElements}
            
            <Container fluid className="position-relative z-2 d-flex justify-content-center align-items-center p-3">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={cardVariants}
                    style={{ width: "100%", maxWidth: "450px" }}
                >
                    <Card style={styles.card} className="border-0 cont-reg overflow-y-scroll">
                        <Card.Body className="p-4">
                            <div className="text-center mb-4">
                                <motion.div
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    whileTap={{ scale: 0.95 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                >
                                    <div style={styles.logo}>
                                        <FaUser size={28} color="#646cff" />
                                    </div>
                                </motion.div>
                                <motion.h3 
                                    className="mt-3 mb-2 text-gradient"
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    Create Account
                                </motion.h3>
                                <motion.p 
                                    className="text-muted"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    Join us today
                                </motion.p>
                            </div>

                            <AnimatePresence>
                                {successMsg && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <Alert 
                                            variant="info" 
                                            className="border-0 shadow-sm"
                                            onClose={() => setSuccessMsg("")}
                                            dismissible
                                        >
                                            {successMsg}
                                        </Alert>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <Form>
                                {/* Name Field */}
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-medium text-muted">Full Name</Form.Label>
                                    <motion.div 
                                        whileHover="hover"
                                        whileFocus="focus"
                                        animate={errors.name ? "error" : ""}
                                        variants={inputVariants}
                                    >
                                        <InputGroup style={{
                                            border: errors.name ? "1px solid #dc3545" : "1px solid #ced4da",
                                            borderRadius: "0.375rem",
                                            overflow: "hidden",
                                            transition: "all 0.2s ease"
                                        }}>
                                            <InputGroup.Text style={{
                                                ...styles.inputPrefix,
                                                borderRight: "none",
                                                borderColor: errors.name ? "#dc3545" : "#ced4da",
                                                backgroundColor: errors.name ? "rgba(220, 53, 69, 0.05)" : "rgba(245, 245, 245, 0.8)"
                                            }}>
                                                <FaUser color={errors.name ? "#dc3545" : "#6c757d"} />
                                            </InputGroup.Text>
                                            <Form.Control
                                                type="text"
                                                name="name"
                                                placeholder="Enter your name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                isInvalid={!!errors.name}
                                                style={{
                                                    ...styles.input,
                                                    borderColor: "transparent",
                                                    boxShadow: "none"
                                                }}
                                            />
                                        </InputGroup>
                                    </motion.div>
                                    {errors.name && (
                                        <motion.small 
                                            className="text-danger"
                                            initial={{ opacity: 0, y: -5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            {errors.name}
                                        </motion.small>
                                    )}
                                </Form.Group>

                                {/* Email Field */}
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-medium text-muted">Email Address</Form.Label>
                                    <motion.div 
                                        whileHover="hover"
                                        whileFocus="focus"
                                        animate={errors.email ? "error" : ""}
                                        variants={inputVariants}
                                    >
                                        <InputGroup style={{
                                            border: errors.email ? "1px solid #dc3545" : "1px solid #ced4da",
                                            borderRadius: "0.375rem",
                                            overflow: "hidden",
                                            transition: "all 0.2s ease"
                                        }}>
                                            <InputGroup.Text style={{
                                                ...styles.inputPrefix,
                                                borderRight: "none",
                                                borderColor: errors.email ? "#dc3545" : "#ced4da",
                                                backgroundColor: errors.email ? "rgba(220, 53, 69, 0.05)" : "rgba(245, 245, 245, 0.8)"
                                            }}>
                                                <FaEnvelope color={errors.email ? "#dc3545" : "#6c757d"} />
                                            </InputGroup.Text>
                                            <Form.Control
                                                type="email"
                                                name="email"
                                                placeholder="your@email.com"
                                                value={formData.email}
                                                onChange={handleChange}
                                                isInvalid={!!errors.email}
                                                style={{
                                                    ...styles.input,
                                                    borderColor: "transparent",
                                                    boxShadow: "none"
                                                }}
                                                disabled={otpSent}
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

                                {/* Password Field */}
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-medium text-muted">Password</Form.Label>
                                    <motion.div 
                                        whileHover="hover"
                                        whileFocus="focus"
                                        animate={errors.password ? "error" : ""}
                                        variants={inputVariants}
                                    >
                                        <InputGroup style={{
                                            border: errors.password ? "1px solid #dc3545" : "1px solid #ced4da",
                                            borderRadius: "0.375rem",
                                            overflow: "hidden",
                                            transition: "all 0.2s ease"
                                        }}>
                                            <InputGroup.Text style={{
                                                ...styles.inputPrefix,
                                                borderRight: "none",
                                                borderColor: errors.password ? "#dc3545" : "#ced4da",
                                                backgroundColor: errors.password ? "rgba(220, 53, 69, 0.05)" : "rgba(245, 245, 245, 0.8)"
                                            }}>
                                                <FaKey color={errors.password ? "#dc3545" : "#6c757d"} />
                                            </InputGroup.Text>
                                            <Form.Control
                                                type={showPassword ? "text" : "password"}
                                                name="password"
                                                placeholder="Enter password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                isInvalid={!!errors.password}
                                                style={{
                                                    ...styles.input,
                                                    borderColor: "transparent",
                                                    boxShadow: "none"
                                                }}
                                            />
                                            <InputGroup.Text 
                                                as={Button} 
                                                variant="link" 
                                                onClick={togglePasswordVisibility}
                                                style={{
                                                    ...styles.eyeButton,
                                                    borderLeft: "none",
                                                    borderColor: errors.password ? "#dc3545" : "#ced4da",
                                                    backgroundColor: errors.password ? "rgba(220, 53, 69, 0.05)" : "rgba(245, 245, 245, 0.8)",
                                                    color: errors.password ? "#dc3545" : "#6c757d"
                                                }}
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
                                </Form.Group>

                                {/* Avatar Field */}
                                <Form.Group className="mb-4">
                                    <Form.Label className="fw-medium text-muted">Profile Picture (Optional)</Form.Label>
                                    <motion.div 
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <div
                                            style={styles.avatarBox}
                                            onClick={() => !avatarPreview && document.getElementById("avatarInput").click()}
                                        >
                                            {avatarPreview ? (
                                                <>
                                                    <img src={avatarPreview} alt="Avatar Preview" style={styles.avatarImage} />
                                                    <FaTimes 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleRemoveAvatar();
                                                        }} 
                                                        style={styles.removeIcon} 
                                                    />
                                                </>
                                            ) : (
                                                <div style={styles.avatarPlaceholder}>
                                                    <FaImage size={24} color="#646cff" />
                                                    <span className="mt-2 small">Click to upload</span>
                                                </div>
                                            )}
                                            {!avatarPreview && (
                                                <Form.Control
                                                    type="file"
                                                    name="avatar"
                                                    id="avatarInput"
                                                    accept="image/*"
                                                    onChange={handleChange}
                                                    style={styles.fileInput}
                                                    hidden
                                                />
                                            )}
                                        </div>
                                    </motion.div>
                                </Form.Group>

                                {/* OTP Section */}
                                {otpSent && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        transition={{ duration: 0.4 }}
                                        className="text-center mb-3"
                                    >
                                        <Form.Label className="fw-medium text-muted">Enter OTP</Form.Label>
                                        <div className="d-flex justify-content-center gap-2 mb-2">
                                            {otp.map((digit, index) => (
                                                <Form.Control
                                                    key={index}
                                                    type="text"
                                                    maxLength="1"
                                                    id={`otp-${index}`}
                                                    value={digit}
                                                    disabled={otpVerified}
                                                    onChange={(e) => handleOtpChange(index, e.target.value)}
                                                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                                    style={styles.otpInput}
                                                />
                                            ))}
                                        </div>
                                        <div className="mt-2">
                                            {resendAvailable ? (
                                                <motion.button
                                                    type="button"
                                                    className="btn btn-link p-0 text-decoration-none small"
                                                    onClick={handleResendOtp}
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                >
                                                    Resend OTP
                                                </motion.button>
                                            ) : (
                                                <small className="text-muted">Resend in {resendTimer}s</small>
                                            )}
                                        </div>
                                    </motion.div>
                                )}

                                {/* Register Button */}
                                <motion.div
                                    variants={buttonHover}
                                    whileHover="hover"
                                    whileTap="tap"
                                >
                                    <Button
                                        variant="primary"
                                        className="w-100 fw-bold py-2 rounded-pill shadow-sm"
                                        disabled={loading || (otpSent && otp.join("").length < 4 && !otpVerified)}
                                        onClick={async () => {
                                            const validationErrors = validate();
                                            if (Object.keys(validationErrors).length > 0) {
                                                setErrors(validationErrors);
                                                return;
                                            }

                                            setErrors({});
                                            setSuccessMsg("");

                                            if (!otpSent) {
                                                await handleRegister();
                                            } else if (otp.join("").length === 4 && !otpVerified) {
                                                setLoading(true);
                                                await handleConfirmOtp();
                                                setLoading(false);
                                            }
                                        }}
                                        style={styles.button}
                                    >
                                        {loading ? (
                                            <Spinner 
                                                size="sm" 
                                                animation="border" 
                                                role="status"
                                                as="span"
                                            />
                                        ) : otpSent ? (
                                            "Confirm OTP"
                                        ) : (
                                            "Register"
                                        )}
                                    </Button>
                                </motion.div>

                                {/* Login Link */}
                                <motion.div 
                                    className="text-center mt-4 pt-2 border-top"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                >
                                    <small className="text-muted">
                                        Already have an account?{' '}
                                        <motion.a 
                                            onClick={() => {
                                                if (user.loggedIn) {
                                                    navigate("/login")
                                                }
                                                else {
                                                    navigate("/")
                                                }
                                            }}
                                            className="text-decoration-none fw-bold"
                                            style={{ color: "#646cff" }}
                                            whileHover={{ 
                                                scale: 1.05,
                                                textShadow: "0 0 5px rgba(100, 108, 255, 0.5)"
                                            }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            Sign in
                                        </motion.a>
                                    </small>
                                </motion.div>
                            </Form>
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
        maxHeight: "100vh",
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
    card: {
        width: "100%",
        padding: "1.5rem",
        borderRadius: "1.25rem",
        boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
        backgroundColor: "rgba(255, 255, 255, 0.97)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255, 255, 255, 0.25)",
        maxHeight: "90vh",
        overflowY: "auto",
        
        // Modern scrollbar styling
        scrollbarWidth: "none", // Hide default Firefox scrollbar
        
        // Custom Webkit scrollbar
        "&::-webkit-scrollbar": {
            width: "10px",
            height: "10px",
        },
        "&::-webkit-scrollbar-track": {
            background: "transparent",
            borderRadius: "10px",
            margin: "4px 0",
        },
        "&::-webkit-scrollbar-thumb": {
            background: "linear-gradient(135deg, #646cff 0%, #7b64ff 100%)",
            borderRadius: "10px",
            border: "2px solid rgba(255, 255, 255, 0.3)",
            backgroundClip: "padding-box",
            minHeight: "40px",
            transition: "all 0.3s ease",
            "&:hover": {
                background: "linear-gradient(135deg, #535bf2 0%, #6a5acd 100%)",
                borderColor: "rgba(255, 255, 255, 0.5)",
            },
            "&:active": {
                background: "linear-gradient(135deg, #4348b0 0%, #5a4fbf 100%)",
            }
        },
        "&::-webkit-scrollbar-corner": {
            background: "transparent",
        }
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
        borderRight: "none",
        height: "45px",
        borderColor: "transparent",
        boxShadow: "none",
        "&:focus": {
            boxShadow: "none",
            borderColor: "transparent",
            backgroundColor: "rgba(245, 245, 245, 0.9)"
        }
    },
    inputPrefix: {
        backgroundColor: "rgba(245, 245, 245, 0.8)",
        borderRight: "none",
        borderColor: "transparent",
        transition: "all 0.2s ease"
    },
    eyeButton: {
        backgroundColor: "rgba(245, 245, 245, 0.8)",
        borderLeft: "none",
        borderColor: "transparent",
        color: "#6c757d",
        cursor: "pointer",
        transition: "all 0.2s ease",
        "&:hover": {
            backgroundColor: "rgba(245, 245, 245, 0.9)"
        }
    },
    button: {
        background: "linear-gradient(90deg, #646cff 0%, #7b64ff 100%)",
        border: "none",
        letterSpacing: "0.5px",
        position: "relative",
        overflow: "hidden",
    },
    avatarBox: {
        position: "relative",
        width: "120px",
        height: "120px",
        borderRadius: "50%",
        backgroundColor: "#f8f9fa",
        border: "2px dashed #646cff",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto",
        overflow: "hidden",
        transition: "all 0.3s ease",
    },
    avatarImage: {
        width: "100%",
        height: "100%",
        objectFit: "cover",
    },
    removeIcon: {
        position: "absolute",
        top: "5px",
        right: "5px",
        fontSize: "18px",
        color: "#ff4d4d",
        cursor: "pointer",
        backgroundColor: "rgba(255, 255, 255, 0.7)",
        borderRadius: "50%",
        padding: "5px",
    },
    avatarPlaceholder: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "#646cff",
    },
    fileInput: {
        display: "none",
    },
    otpInput: {
        width: "45px",
        height: "45px",
        textAlign: "center",
        fontSize: "1.2rem",
        backgroundColor: "rgba(245, 245, 245, 0.8)",
        border: "1px solid #ced4da",
        borderRadius: "8px",
    }
};

export default RegisterForm;