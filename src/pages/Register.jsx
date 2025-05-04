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
import { FaEye, FaEyeSlash, FaTimes } from "react-icons/fa";
import "../css/login/login.css";
import { api } from "../utils/constant";
import AlertModal from "../utils/alertModel";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/slice/userSlice"; // adjust if path differs

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

    const navigate = useNavigate();
    const dispatch = useDispatch(); // ✅ added

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

            // ✅ Set user in redux before navigate
            dispatch(setUserData({ user: response.data.user, loggedIn: true }));
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

    return (
        <div style={styles.wrapper}>
            <div style={styles.overlay}></div>
            <Container fluid className="d-flex justify-content-center align-items-center min-vh-100 p-0 m-0">
                <Card style={styles.card}>
                    <h4 className="text-center mb-3 fw-bold text-primary">Create Account</h4>

                    {successMsg && <Alert variant="info">{successMsg}</Alert>}

                    <Form>
                        <Form.Group className="mb-2">
                            <Form.Label className="fw-bold">Name</Form.Label>
                            <Form.Control
                                type="text"
                                name="name"
                                placeholder="Enter your name"
                                value={formData.name}
                                onChange={handleChange}
                                isInvalid={!!errors.name}
                            />
                            <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-2">
                            <Form.Label className="fw-bold">Email</Form.Label>
                            <Form.Control
                                type="email"
                                name="email"
                                placeholder="Enter your email"
                                value={formData.email}
                                onChange={handleChange}
                                isInvalid={!!errors.email}
                                disabled={otpSent}
                            />
                            <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-2">
                            <Form.Label className="fw-bold">Password</Form.Label>
                            <InputGroup>
                                <Form.Control
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="Enter password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    isInvalid={!!errors.password}
                                />
                                {formData.password && (
                                    <Button
                                        variant="outline-secondary"
                                        onClick={togglePasswordVisibility}
                                        className="text-black border-0"
                                        style={styles.eyeButton}
                                    >
                                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                                    </Button>
                                )}
                                <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
                            </InputGroup>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold">Upload Avatar (optional)</Form.Label>
                            <div
                                style={styles.avatarBox}
                                onClick={() => !avatarPreview && document.getElementById("avatarInput").click()}
                            >
                                {avatarPreview ? (
                                    <>
                                        <img src={avatarPreview} alt="Avatar Preview" style={styles.avatarImage} />
                                        <FaTimes onClick={handleRemoveAvatar} style={styles.removeIcon} />
                                    </>
                                ) : (
                                    <div style={styles.avatarPlaceholder}>
                                        <span>Click to Upload</span>
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
                        </Form.Group>

                        {otpSent && (
                            <div className="text-center mb-3">
                                <Form.Label className="fw-bold">Enter OTP</Form.Label>
                                <div className="d-flex justify-content-center gap-2">
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
                                            style={{
                                                width: "45px",
                                                textAlign: "center",
                                                fontSize: "1.2rem",
                                            }}
                                        />
                                    ))}
                                </div>
                                <div className="mt-2">
                                    {resendAvailable ? (
                                        <Button
                                            variant="link"
                                            className="p-0 fw-bold"
                                            onClick={handleResendOtp}
                                        >
                                            Resend OTP
                                        </Button>
                                    ) : (
                                        <small className="text-muted">Resend in {resendTimer}s</small>
                                    )}
                                </div>
                            </div>
                        )}

                        <Button
                            variant="primary"
                            className="w-100 fw-bold"
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
                        >
                            {loading ? <Spinner size="sm" animation="border" /> : otpSent ? "Confirm OTP" : "Register"}
                        </Button>

                        <div className="text-center mt-3">
                            <small className="text-muted fw-bold">
                                Already have an account? <a href="/">Login</a>
                            </small>
                        </div>
                    </Form>
                </Card>
            </Container>
        </div>
    );
}

const styles = {
    wrapper: {
        position: "relative",
        minHeight: "100vh",
        background: "linear-gradient(to right top, #d9afd9, #97d9e1)",
    },
    overlay: {
        position: "absolute",
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        zIndex: 1,
    },
    card: {
        width: "100%",
        maxWidth: "320px",
        padding: "1.2rem",
        borderRadius: "1rem",
        boxShadow: "0 8px 15px rgba(0,0,0,0.2)",
        backgroundColor: "#ffffff",
        zIndex: 2,
    },
    avatarBox: {
        position: "relative",
        width: "120px",
        height: "120px",
        borderRadius: "50%",
        backgroundColor: "#f8f9fa",
        border: "2px dashed #0d6efd",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto",
    },
    avatarImage: {
        width: "100%",
        height: "100%",
        borderRadius: "50%",
        objectFit: "cover",
    },
    removeIcon: {
        position: "absolute",
        top: "-5px",
        right: "-5px",
        fontSize: "18px",
        color: "#ff4d4d",
        cursor: "pointer",
    },
    avatarPlaceholder: {
        fontSize: "14px",
        color: "#6c757d",
    },
    fileInput: {
        width: "100%",
        border: "none",
        backgroundColor: "transparent",
        fontSize: "12px",
        padding: 0,
        marginTop: "8px",
    },
    eyeButton: {
        position: "absolute",
        right: "10px",
        top: "50%",
        transform: "translateY(-50%)",
        background: "transparent",
        cursor: "pointer",
        zIndex: 10,
    },
};

export default RegisterForm;
