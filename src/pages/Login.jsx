import { useState, useEffect } from "react";
import {
    Container, Card, Tabs, Tab, Form, Button,
    InputGroup, Spinner, Alert
} from "react-bootstrap";
import { FaEye, FaEyeSlash } from "react-icons/fa";
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
    let navigate = useNavigate();
    let dispatch = useDispatch();

    const [otpSent, setOtpSent] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);

    useEffect(() => {
        let timer;
        if (resendTimer > 0) {
            timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [resendTimer]);

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.email) newErrors.email = "Email is required";
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
            setSuccessMsg("Login failed");
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
            setSuccessMsg("OTP sent successfully!");
            setIsErrorMsg(false);
        } catch (err) {
            console.error(err);
            setSuccessMsg("Failed to send OTP");
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

    return (
        <div style={styles.wrapper}>
            <div style={styles.overlay}></div>

            <Container fluid className="position-relative z-2 d-flex vw-100 justify-content-center align-items-center min-vh-100 p-0 m-0">
                <Card style={styles.card}>
                    <h3 className="text-center mb-4 text-primary fw-bold">Welcome Back</h3>

                    {successMsg && (
                        <Alert variant={isErrorMsg ? "danger" : "success"}>
                            {successMsg}
                        </Alert>
                    )}

                    <Tabs activeKey={key} onSelect={(k) => { setKey(k); setSuccessMsg(""); }} className="mb-3" fill>
                        <Tab eventKey="password" title="Email & Password">
                            <Form onSubmit={handlePasswordLogin}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold">Email</Form.Label>
                                    <Form.Control
                                        type="email"
                                        name="email"
                                        placeholder="Enter email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        isInvalid={!!errors.email}
                                    />
                                    <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold">Password</Form.Label>
                                    <InputGroup>
                                        <Form.Control
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            placeholder="Enter password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            isInvalid={!!errors.password}
                                            autoComplete="new-password"
                                            style={{ paddingRight: "40px" }}
                                        />
                                        {formData.password && (
                                            <Button
                                                variant="outline-secondary"
                                                className="eye-btn"
                                                onClick={togglePasswordVisibility}
                                                style={{
                                                    position: "absolute",
                                                    right: "10px",
                                                    top: "50%",
                                                    transform: "translateY(-50%)",
                                                    border: "none",
                                                    background: "transparent",
                                                    zIndex: 10,
                                                    cursor: "pointer",
                                                }}
                                            >
                                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                                            </Button>
                                        )}
                                        <Form.Control.Feedback type="invalid">
                                            {errors.password}
                                        </Form.Control.Feedback>
                                    </InputGroup>
                                </Form.Group>

                                <Button type="submit" variant="primary" className="w-100 fw-bold" disabled={loading}>
                                    {loading ? <Spinner size="sm" animation="border" /> : "Login"}
                                </Button>
                            </Form>
                        </Tab>

                        <Tab eventKey="otp" title="Login with OTP">
                            <Form onSubmit={handleVerifyOtp}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold">Email</Form.Label>
                                    <Form.Control
                                        type="email"
                                        name="email"
                                        placeholder="Enter email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        isInvalid={!!errors.email}
                                    />
                                    <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
                                </Form.Group>

                                {otpSent && (
                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-bold">OTP</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="otp"
                                            placeholder="Enter OTP"
                                            value={formData.otp}
                                            onChange={handleChange}
                                            isInvalid={!!errors.otp}
                                        />
                                        <Form.Control.Feedback type="invalid">{errors.otp}</Form.Control.Feedback>
                                    </Form.Group>
                                )}

                                {!otpSent ? (
                                    <Button variant="info" className="w-100 fw-bold" onClick={handleSendOtp} disabled={loading}>
                                        {loading ? <Spinner size="sm" animation="border" /> : "Send OTP"}
                                    </Button>
                                ) : (
                                    <>
                                        <Button type="submit" variant="success" className="w-100 fw-bold" disabled={loading}>
                                            {loading ? <Spinner size="sm" animation="border" /> : "Verify OTP"}
                                        </Button>
                                        <div className="text-center mt-2">
                                            {resendTimer > 0 ? (
                                                <small className="text-muted">Resend in {resendTimer}s</small>
                                            ) : (
                                                <Button variant="link" className="p-0" onClick={handleSendOtp}>Resend OTP</Button>
                                            )}
                                        </div>
                                    </>
                                )}
                            </Form>
                        </Tab>
                    </Tabs>

                    <div className="text-center mt-3 fw-bold">
                        <small className="text-muted">Don't have an account? <a href="/register">Register</a></small>
                    </div>
                </Card>
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
        backgroundImage: "linear-gradient(to right top, #d9afd9, #97d9e1)",
        overflow: 'hidden',
    },
    overlay: {
        position: 'absolute',
        top: 0, left: 0, bottom: 0, right: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        zIndex: 1,
    },
    card: {
        width: "100%",
        maxWidth: "400px",
        padding: "2rem",
        borderRadius: "1rem",
        boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
        backgroundColor: "#ffffff",
    }
};

export default LoginForm;
