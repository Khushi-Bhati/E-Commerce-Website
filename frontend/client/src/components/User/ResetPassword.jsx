import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import "./../styles/login.css";
import Swal from "sweetalert2";
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import API from '../../config/api.js';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const Navigate = useNavigate();

    const token = searchParams.get("token") || "";
    const email = searchParams.get("email") || "";

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Guard — if no token/email in URL, redirect to login
    useEffect(() => {
        if (!token || !email) {
            Navigate("/login");
        }
    }, [token, email, Navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (newPassword.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }
        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        try {
            setLoading(true);
            const res = await API.post("/user/reset-password", { token, email, newPassword });

            if (res.data.status === "success") {
                Swal.fire({
                    icon: "success",
                    title: "Password reset!",
                    text: res.data.message,
                    timer: 2500,
                    showConfirmButton: false,
                }).then(() => Navigate("/login"));
            } else {
                setError(res.data.message);
            }
        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="body">
            <div className="wrapper">
                <div className="title">
                    <div className="logo-mark">🔐</div>
                    <span>Reset Password</span>
                    <p className="auth-subtitle">Create a new password for <strong style={{ color: '#fff', fontWeight: 700 }}>{email}</strong></p>
                </div>
                <form onSubmit={handleSubmit} style={{ padding: '28px 32px 0' }}>
                    <div className="row">
                        <label>New Password</label>
                        <input
                            type={showNew ? "text" : "password"}
                            placeholder="Min. 6 characters"
                            required
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                        />
                        <span onClick={() => setShowNew(v => !v)} className="eye">
                            {showNew ? <FaEyeSlash /> : <FaEye />}
                        </span>
                    </div>

                    <div className="row">
                        <label>Confirm Password</label>
                        <input
                            type={showConfirm ? "text" : "password"}
                            placeholder="Repeat new password"
                            required
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                        />
                        <span onClick={() => setShowConfirm(v => !v)} className="eye">
                            {showConfirm ? <FaEyeSlash /> : <FaEye />}
                        </span>
                    </div>

                    {/* Password strength indicator */}
                    {newPassword && (
                        <div className="pwd-strength">
                            <div className={`pwd-bar ${newPassword.length >= 6 ? (newPassword.length >= 10 ? 'strong' : 'medium') : 'weak'}`} />
                            <span>{newPassword.length < 6 ? 'Too short' : newPassword.length < 10 ? 'Medium' : 'Strong'}</span>
                        </div>
                    )}

                    {error && <p className="fp-error">⚠ {error}</p>}

                    <div className="row button" style={{ marginTop: 20 }}>
                        <input type="submit" value={loading ? "Resetting…" : "Reset Password →"} disabled={loading} />
                    </div>

                    <div className="signup-link" style={{ marginTop: 20 }}>
                        <a href="/login">← Back to Sign In</a>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
