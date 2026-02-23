import React, { useState } from 'react';
import "./../styles/login.css";
import { useNavigate } from 'react-router-dom';
import Swal from "sweetalert2";
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { loginSuccess, setProfiledata } from '../../reducers/Reducers.js';
import API from '../../config/api.js';

const Login = () => {
    const Navigate = useNavigate();
    const dispatch = useDispatch();

    // ── Login state ──────────────────────────────────────────
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formValue, setFormvalue] = useState({ email: "", password: "", role: "" });

    // ── Forgot-password state ────────────────────────────────
    const [showForgot, setShowForgot] = useState(false);
    const [fpEmail, setFpEmail] = useState("");
    const [fpLoading, setFpLoading] = useState(false);
    const [fpResetLink, setFpResetLink] = useState("");
    const [fpError, setFpError] = useState("");
    const [fpSuccess, setFpSuccess] = useState("");

    const togglePassword = () => setShowPassword(!showPassword);

    const handelChange = (e) => {
        const { name, value } = e.target;
        setFormvalue({ ...formValue, [name]: value });
    };

    // ── Login submit ─────────────────────────────────────────
    const handelSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const loginresponse = await API.post("/user/login", formValue);

            if (loginresponse.data.status === "success") {
                const { token, userID, role, isProfileCreated } = loginresponse.data;

                // 1. Persist auth to Redux + localStorage
                dispatch(loginSuccess({ token, userID, role, isProfileCreated }));

                // 2. If the buyer already has a profile, fetch it NOW so the
                //    header chip shows their name/avatar immediately — even after
                //    logging in weeks later (Redux resets on every page load).
                if (role === 'buyer' && isProfileCreated) {
                    try {
                        const profileRes = await API.get(`/customer/getprofile/${userID}`);
                        if (profileRes.data.status === 'success' && profileRes.data.profile) {
                            dispatch(setProfiledata(profileRes.data.profile));
                        }
                    } catch (_) { /* non-critical — Header useEffect is a backup */ }
                }

                Swal.fire({ title: loginresponse.data.message, icon: "success", timer: 1500, showConfirmButton: false });

                if (role === "seller") {
                    Navigate(isProfileCreated ? "/seller/dashboard" : "/seller/sellerprofile");
                } else {
                    Navigate(isProfileCreated ? "/customer/home" : "/customer/createprofile");
                }
                setFormvalue({ email: "", password: "", role: "" });
            } else {
                Swal.fire({ icon: "error", title: loginresponse.data.message });
            }
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Login failed",
                text: error.response?.data?.message || "Something went wrong. Please try again.",
            });
        } finally {
            setLoading(false);
        }
    };

    // ── Forgot password submit ───────────────────────────────
    const handleForgotSubmit = async (e) => {
        e.preventDefault();
        setFpError(""); setFpSuccess(""); setFpResetLink("");
        try {
            setFpLoading(true);
            const res = await API.post("/user/forgot-password", { email: fpEmail });
            if (res.data.status === "success") {
                setFpSuccess(res.data.message);
                if (res.data.resetLink) setFpResetLink(res.data.resetLink);
            } else {
                setFpError(res.data.message);
            }
        } catch (err) {
            setFpError(err.response?.data?.message || "Something went wrong. Try again.");
        } finally {
            setFpLoading(false);
        }
    };

    const closeForgot = () => {
        setShowForgot(false);
        setFpEmail(""); setFpError(""); setFpSuccess(""); setFpResetLink("");
    };

    // ── Render ───────────────────────────────────────────────
    return (
        <div className='body'>
            <Backdrop sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })} open={loading}>
                <CircularProgress color="inherit" />
            </Backdrop>

            <div className="wrapper">
                {/* ━━━ LOGIN PANEL ━━━ */}
                {!showForgot && (
                    <>
                        <div className="title">
                            <div className="logo-mark">🛒</div>
                            <span>Welcome back</span>
                            <p className="auth-subtitle">Sign in to your EaseInCart account</p>
                        </div>
                        <form onSubmit={handelSubmit}>
                            <div className="row">
                                <label>Email Address</label>
                                <input
                                    type="email"
                                    placeholder="you@example.com"
                                    required
                                    name="email"
                                    onChange={handelChange}
                                    value={formValue.email}
                                />
                            </div>
                            <div className="row">
                                <label>Password</label>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    required
                                    name='password'
                                    onChange={handelChange}
                                    value={formValue.password}
                                />
                                <span onClick={togglePassword} className="eye">
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </span>
                            </div>
                            <div className="row">
                                <label>I am a</label>
                                <select name='role' onChange={handelChange} value={formValue.role} required>
                                    <option value="">Select your role</option>
                                    <option value="buyer">🛍️ Buyer — I want to shop</option>
                                    <option value="seller">🏪 Seller — I want to sell</option>
                                </select>
                            </div>
                            <div className="pass">
                                <button type="button" className="forgot-trigger" onClick={() => setShowForgot(true)}>
                                    Forgot password?
                                </button>
                            </div>
                            <div className="row button">
                                <input type="submit" value="Sign In →" />
                            </div>
                            <div className="signup-link">New to EaseInCart? <a href="/register">Create an account</a></div>
                        </form>
                    </>
                )}

                {/* ━━━ FORGOT PASSWORD PANEL ━━━ */}
                {showForgot && (
                    <>
                        <div className="title fp-title">
                            <div className="logo-mark">🔑</div>
                            <span>Forgot Password</span>
                            <p className="auth-subtitle">Enter your email to get a reset link</p>
                        </div>
                        <form onSubmit={handleForgotSubmit} style={{ padding: '28px 32px 0' }}>
                            {!fpSuccess && (
                                <>
                                    <div className="row">
                                        <label>Email Address</label>
                                        <input
                                            type="email"
                                            placeholder="you@example.com"
                                            required
                                            value={fpEmail}
                                            onChange={e => setFpEmail(e.target.value)}
                                        />
                                    </div>
                                    {fpError && <p className="fp-error">⚠ {fpError}</p>}
                                    <div className="row button" style={{ marginTop: 20 }}>
                                        <input type="submit" value={fpLoading ? "Sending…" : "Send Reset Link →"} disabled={fpLoading} />
                                    </div>
                                </>
                            )}

                            {fpSuccess && (
                                <div className="fp-success-box">
                                    <div className="fp-success-icon">✅</div>
                                    <p className="fp-success-msg">{fpSuccess}</p>
                                    {fpResetLink && (
                                        <div className="fp-link-box">
                                            <p className="fp-link-label">Your reset link (click to reset):</p>
                                            <a href={fpResetLink} className="fp-reset-link" target="_blank" rel="noreferrer">
                                                Click here to reset your password
                                            </a>
                                            <p className="fp-link-note">⏱ Link expires in 1 hour</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="fp-back" onClick={closeForgot}>
                                ← Back to Sign In
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default Login;