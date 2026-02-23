import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import API from '../../config/api.js';
import { useDispatch, useSelector } from 'react-redux';
import { setProfiledata } from '../../reducers/Reducers.js';
import Blog from './Blog';

const BlogPage = () => {
    const dispatch = useDispatch();
    const loginId = (localStorage.getItem("userID") || "").replace(/"/g, "").trim();

    const [cartCount, setCartCount] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");

    const getprofile = useCallback(async () => {
        if (!loginId) return;
        try {
            const response = await API.get(`/customer/getprofile/${loginId}`);
            if (response.data.status === "success") {
                dispatch(setProfiledata(response.data.profile));
            }
        } catch (error) {
            console.log("error", error);
        }
    }, [dispatch, loginId]);

    const getCart = useCallback(async () => {
        if (!loginId) return;
        try {
            const response = await API.get(`/cart/get/${loginId}`);
            if (response.data.status === "success") {
                setCartCount(response.data?.totals?.itemCount || 0);
            }
        } catch (error) {
            console.log("get cart error", error);
        }
    }, [loginId]);

    useEffect(() => {
        getprofile();
        getCart();
    }, [getprofile, getCart]);

    return (
        <div className="category-page-wrapper">
            <Header cartCount={cartCount} searchTerm={searchTerm} onSearchChange={setSearchTerm} />

            <div className="container" style={{ paddingBottom: '60px' }}>
                <div className="breadcrumb-container">
                    <nav className="breadcrumb-nav">
                        <Link to="/customer/home" className="breadcrumb-link">Home</Link>
                        <span className="breadcrumb-separator"><ion-icon name="chevron-forward-outline"></ion-icon></span>
                        <span className="breadcrumb-current">Blog</span>
                    </nav>
                </div>

                <div className="category-page-header">
                    <div>
                        <h1 className="category-title">Latest Fashion News & Articles</h1>
                        <p className="category-meta">
                            Stay updated with the latest trends and guides
                        </p>
                    </div>
                </div>

                <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
                    <Blog />
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default BlogPage;
