import React, { useState } from "react";
import "./../styles/login.css";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import API from '../../config/api.js';

const Register = () => {
    const Navigate = useNavigate();

    const [formValue, setFormvalue] = useState({
        name: "",
        email: "",
        password: "",
        role: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const togglePassword = () => setShowPassword(!showPassword);

    const handelChange = (e) => {
        const { name, value } = e.target;
        setFormvalue({ ...formValue, [name]: value });
    };

    const handelSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const registerresponse = await API.post("/user/register", formValue);

            if (registerresponse.data.status === "success") {
                Swal.fire({
                    title: registerresponse.data.message,
                    icon: "success",
                    timer: 1500,
                    showConfirmButton: false,
                });
                Navigate("/login");
                setFormvalue({ name: "", email: "", password: "", role: "" });
            } else {
                Swal.fire({
                    icon: "error",
                    title: registerresponse.data.message,
                });
            }

        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Registration failed",
                text: error.response?.data?.message || "Something went wrong. Please try again.",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='body'>
            <Backdrop
                sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })}
                open={loading}
            >
                <CircularProgress color="inherit" />
            </Backdrop>
            <div className="wrapper">
                <div className="title">
                    <div className="logo-mark">✨</div>
                    <span>Create Account</span>
                    <p className="auth-subtitle">Join thousands of shoppers on EaseInCart</p>
                </div>
                <form onSubmit={handelSubmit}>
                    <div className="row">
                        <label>Full Name</label>
                        <input
                            type="text"
                            placeholder="John Doe"
                            onChange={handelChange}
                            value={formValue.name}
                            required
                            name="name"
                        />
                    </div>
                    <div className="row">
                        <label>Email Address</label>
                        <input
                            type="email"
                            placeholder="you@example.com"
                            required
                            onChange={handelChange}
                            value={formValue.email}
                            name="email"
                        />
                    </div>
                    <div className="row">
                        <label>Password</label>
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Min. 8 characters"
                            onChange={handelChange}
                            value={formValue.password}
                            required
                            name="password"
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
                    <div className="row button">
                        <input type="submit" value="Create Account →" />
                    </div>
                    <div className="signup-link">Already have an account? <a href="/login">Sign in</a></div>
                </form>
            </div>
        </div>
    );
};

export default Register;
