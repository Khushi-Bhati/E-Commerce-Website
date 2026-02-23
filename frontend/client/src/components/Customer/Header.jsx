import React, { useState, useEffect } from 'react'
import "./../styles/css/style-prefix.css"
import "./../styles/css/style.css"
import anonlogo from "./../../assets/images/logo/logo.svg"
import banner1 from "./../../assets/images/electronics-banner-1.jpg"
import mensbanner from "./../../assets/images/mens-banner.jpg"
import womensbanner from "./../../assets/images/womens-banner.jpg"
import banner2 from "./../../assets/images/electronics-banner-2.jpg"
import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout, setProfiledata } from '../../reducers/Reducers.js'
import Swal from 'sweetalert2'
import API from '../../config/api.js'

const Header = ({ cartCount = 0, searchTerm, onSearchChange }) => {
    const profiledata = useSelector((state) => state.customer.customerprofile)
    const role = useSelector((state) => state.customer.role)
    const userID = useSelector((state) => state.customer.userID)
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)

    // ── Local Search State for non-home pages ──
    const [localSearch, setLocalSearch] = useState("")

    useEffect(() => {
        if (searchTerm !== undefined) {
            setLocalSearch(searchTerm)
        } else {
            const params = new URLSearchParams(window.location.search);
            setLocalSearch(params.get('search') || "")
        }
    }, [searchTerm])

    const handleSearchChange = (event) => {
        setLocalSearch(event.target.value)
        if (onSearchChange) {
            onSearchChange(event.target.value)
        }
    }

    const handleSearchSubmit = (event) => {
        event.preventDefault();
        // Redirect to home with query if submitted from another page
        if (window.location.pathname !== '/customer/home') {
            navigate(`/customer/home?search=${encodeURIComponent(localSearch.trim())}`)
        }
    };

    // Auto-fetch profile if logged in but profile not yet in Redux (e.g. page refresh)
    useEffect(() => {
        const id = userID || localStorage.getItem('userID');
        if (id && !profiledata) {
            API.get(`/customer/getprofile/${id}`)
                .then(res => {
                    if (res.data.status === 'success' && res.data.profile) {
                        dispatch(setProfiledata(res.data.profile));
                    }
                })
                .catch(() => { }); // silently ignore — not critical
        }
    }, [userID, profiledata, dispatch]);

    const handleLogout = async () => {
        try {
            await API.post("/user/logout");
        } catch (_) { /* ignore */ }
        dispatch(logout());
        Swal.fire({ icon: 'success', title: 'Signed out', timer: 1200, showConfirmButton: false });
        navigate('/login');
    };

    return (
        <header>
            <div className="header-top">
                <div className="container">
                    <ul className="header-social-container">
                        <li>
                            <a href="#" className="social-link">
                                <ion-icon name="logo-facebook" />
                            </a>
                        </li>
                        <li>
                            <a href="#" className="social-link">
                                <ion-icon name="logo-twitter" />
                            </a>
                        </li>
                        <li>
                            <a href="#" className="social-link">
                                <ion-icon name="logo-instagram" />
                            </a>
                        </li>
                        <li>
                            <a href="#" className="social-link">
                                <ion-icon name="logo-linkedin" />
                            </a>
                        </li>
                    </ul>
                    <div className="header-alert-news">
                        <p>
                            <b>Free Shipping</b>
                            This Week Order Over - $55
                        </p>
                    </div>
                    <div className="header-top-actions">
                        <select name="currency">
                            <option value="usd">USD $</option>
                            <option value="eur">EUR €</option>
                        </select>
                        <select name="language">
                            <option value="en-US">English</option>
                            <option value="es-ES">Español</option>
                            <option value="fr">Français</option>
                        </select>
                    </div>
                </div>
            </div>
            <div className="header-main">
                <div className="container">
                    <Link to="/customer/home" className="header-logo brand-logo-wrap" style={{ textDecoration: 'none' }}>
                        <div className="brand-logo-pill">
                            <span className="brand-logo-icon">🛒</span>
                            <span className="brand-logo-text">
                                Ease<span className="brand-logo-accent">inCart</span>
                            </span>
                        </div>
                    </Link>
                    <form className="header-search-container" onSubmit={handleSearchSubmit}>
                        <input
                            type="search"
                            name="search"
                            className="search-field"
                            placeholder="Search products by name, brand, category..."
                            value={localSearch}
                            onChange={handleSearchChange}
                        />
                        <button type="submit" className="search-btn">
                            <ion-icon name="search-outline" />
                        </button>
                    </form>
                    <div className="header-user-actions">

                        {/* ── User chip with dropdown ── */}
                        <div
                            className="user-chip"
                            onMouseEnter={() => setIsDropdownOpen(true)}
                            onMouseLeave={() => setIsDropdownOpen(false)}
                        >
                            {/* Avatar */}
                            <div className="user-avatar">
                                {profiledata?.profileimg ? (
                                    <img src={profiledata.profileimg.startsWith("http") ? profiledata.profileimg : `http://localhost:8000/temp/${profiledata.profileimg}`} alt="avatar" className="user-avatar-img" />
                                ) : (
                                    <div className="user-avatar-initial">
                                        {profiledata?.name
                                            ? profiledata.name.charAt(0).toUpperCase()
                                            : role === 'buyer' ? 'B' : 'U'}
                                    </div>
                                )}
                            </div>

                            {/* Name + role */}
                            <div className="user-chip-info">
                                <span className="user-chip-name">
                                    {profiledata?.name || 'My Account'}
                                </span>
                                <span className={`user-chip-role ${role}`}>
                                    {role === 'buyer' ? '🛍️ Buyer' : role === 'seller' ? '🏪 Seller' : 'Guest'}
                                </span>
                            </div>

                            {/* Dropdown caret */}
                            <ion-icon name="chevron-down-outline" class="user-chip-caret" />

                            {/* Dropdown menu */}
                            {isDropdownOpen && (
                                <div className="user-dropdown">
                                    <div className="user-dropdown-header">
                                        <div className="user-dropdown-avatar">
                                            {profiledata?.profileimg ? (
                                                <img src={profiledata.profileimg.startsWith("http") ? profiledata.profileimg : `http://localhost:8000/temp/${profiledata.profileimg}`} alt="avatar" />
                                            ) : (
                                                <div className="user-dropdown-initial">
                                                    {profiledata?.name
                                                        ? profiledata.name.charAt(0).toUpperCase()
                                                        : 'U'}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="user-dropdown-name">{profiledata?.name || 'Welcome!'}</p>
                                            <p className="user-dropdown-sub">{profiledata?.mobileno ? `📞 ${profiledata.mobileno}` : role === 'buyer' ? '🛍️ Buyer' : ''}</p>
                                        </div>
                                    </div>
                                    <div className="user-dropdown-divider" />
                                    <Link to="/customer/createprofile" className="user-dropdown-item">
                                        <ion-icon name="person-outline" /> My Profile
                                    </Link>
                                    <Link to="/customer/orders" className="user-dropdown-item">
                                        <ion-icon name="receipt-outline" /> My Orders
                                    </Link>
                                    <Link to="/customer/cart" className="user-dropdown-item">
                                        <ion-icon name="bag-handle-outline" /> Cart
                                        {cartCount > 0 && <span className="user-dropdown-badge">{cartCount}</span>}
                                    </Link>
                                    <div className="user-dropdown-divider" />
                                    <button className="user-dropdown-logout" onClick={handleLogout}>
                                        <ion-icon name="log-out-outline" /> Sign Out
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* ── Cart icon (quick access) ── */}
                        <Link to="/customer/cart">
                            <button className="action-btn">
                                <ion-icon name="bag-handle-outline" />
                                {cartCount > 0 && <span className="count">{cartCount}</span>}
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
            <nav className="desktop-navigation-menu">
                <div className="container">
                    <ul className="desktop-menu-category-list">
                        <li className="menu-category">
                            <Link to={"/customer/home"} className="menu-title">Home</Link>
                        </li>
                        <li className="menu-category">
                            <span className="menu-title" style={{ cursor: 'pointer' }}>Categories</span>
                            <div className="dropdown-panel">
                                <ul className="dropdown-panel-list">
                                    <li className="menu-title">
                                        <Link to="/customer/category/electronics">Electronics</Link>
                                    </li>
                                    <li className="panel-list-item">
                                        <Link to="/customer/home?search=desktop">Desktop</Link>
                                    </li>
                                    <li className="panel-list-item">
                                        <Link to="/customer/home?search=laptop">Laptop</Link>
                                    </li>
                                    <li className="panel-list-item">
                                        <Link to="/customer/home?search=camera">Camera</Link>
                                    </li>
                                    <li className="panel-list-item">
                                        <Link to="/customer/home?search=tablet">Tablet</Link>
                                    </li>
                                    <li className="panel-list-item">
                                        <Link to="/customer/home?search=headphone">Headphone</Link>
                                    </li>
                                    <li className="panel-list-item">
                                        <Link to="/customer/home?search=headphone">
                                            <img src={banner1} alt="headphone collection" />
                                        </Link>
                                    </li>
                                </ul>
                                <ul className="dropdown-panel-list">
                                    <li className="menu-title">
                                        <Link to="/customer/category/men">Men's</Link>
                                    </li>
                                    <li className="panel-list-item">
                                        <Link to="/customer/home?search=formal">Formal</Link>
                                    </li>
                                    <li className="panel-list-item">
                                        <Link to="/customer/home?search=casual">Casual</Link>
                                    </li>
                                    <li className="panel-list-item">
                                        <Link to="/customer/home?search=sports">Sports</Link>
                                    </li>
                                    <li className="panel-list-item">
                                        <Link to="/customer/home?search=jacket">Jacket</Link>
                                    </li>
                                    <li className="panel-list-item">
                                        <Link to="/customer/home?search=sunglasses">Sunglasses</Link>
                                    </li>
                                    <li className="panel-list-item">
                                        <Link to="/customer/category/men">
                                            <img src={mensbanner} alt="men's fashion" />
                                        </Link>
                                    </li>
                                </ul>
                                <ul className="dropdown-panel-list">
                                    <li className="menu-title">
                                        <Link to="/customer/category/women">Women's</Link>
                                    </li>
                                    <li className="panel-list-item">
                                        <Link to="/customer/home?search=formal">Formal</Link>
                                    </li>
                                    <li className="panel-list-item">
                                        <Link to="/customer/home?search=casual">Casual</Link>
                                    </li>
                                    <li className="panel-list-item">
                                        <Link to="/customer/home?search=perfume">Perfume</Link>
                                    </li>
                                    <li className="panel-list-item">
                                        <Link to="/customer/home?search=cosmetics">Cosmetics</Link>
                                    </li>
                                    <li className="panel-list-item">
                                        <Link to="/customer/home?search=bags">Bags</Link>
                                    </li>
                                    <li className="panel-list-item">
                                        <Link to="/customer/category/women">
                                            <img src={womensbanner} alt="women's fashion" />
                                        </Link>
                                    </li>
                                </ul>
                                <ul className="dropdown-panel-list">
                                    <li className="menu-title">
                                        <Link to="/customer/category/electronics">Electronics</Link>
                                    </li>
                                    <li className="panel-list-item">
                                        <Link to="/customer/home?search=watch">Smart Watch</Link>
                                    </li>
                                    <li className="panel-list-item">
                                        <Link to="/customer/home?search=tv">Smart TV</Link>
                                    </li>
                                    <li className="panel-list-item">
                                        <Link to="/customer/home?search=keyboard">Keyboard</Link>
                                    </li>
                                    <li className="panel-list-item">
                                        <Link to="/customer/home?search=mouse">Mouse</Link>
                                    </li>
                                    <li className="panel-list-item">
                                        <Link to="/customer/home?search=microphone">Microphone</Link>
                                    </li>
                                    <li className="panel-list-item">
                                        <Link to="/customer/home?search=mouse">
                                            <img src={banner2} alt="mouse collection" />
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                        </li>
                        <li className="menu-category">
                            <Link to="/customer/category/men" className="menu-title">Men's</Link>
                            <ul className="dropdown-list">
                                <li className="dropdown-item">
                                    <Link to="/customer/home?search=shirt">Shirt</Link>
                                </li>
                                <li className="dropdown-item">
                                    <Link to="/customer/home?search=shorts">Shorts &amp; Jeans</Link>
                                </li>
                                <li className="dropdown-item">
                                    <Link to="/customer/home?search=shoes">Safety Shoes</Link>
                                </li>
                                <li className="dropdown-item">
                                    <Link to="/customer/home?search=wallet">Wallet</Link>
                                </li>
                            </ul>
                        </li>
                        <li className="menu-category">
                            <Link to="/customer/category/women" className="menu-title">Women's</Link>
                            <ul className="dropdown-list">
                                <li className="dropdown-item">
                                    <Link to="/customer/home?search=dress">Dress &amp; Frock</Link>
                                </li>
                                <li className="dropdown-item">
                                    <Link to="/customer/home?search=earrings">Earrings</Link>
                                </li>
                                <li className="dropdown-item">
                                    <Link to="/customer/home?search=necklace">Necklace</Link>
                                </li>
                                <li className="dropdown-item">
                                    <Link to="/customer/home?search=makeup">Makeup Kit</Link>
                                </li>
                            </ul>
                        </li>
                        <li className="menu-category">
                            <Link to="/customer/category/jewelry" className="menu-title">Jewelry</Link>
                            <ul className="dropdown-list">
                                <li className="dropdown-item">
                                    <Link to="/customer/home?search=earrings">Earrings</Link>
                                </li>
                                <li className="dropdown-item">
                                    <Link to="/customer/home?search=rings">Couple Rings</Link>
                                </li>
                                <li className="dropdown-item">
                                    <Link to="/customer/home?search=necklace">Necklace</Link>
                                </li>
                                <li className="dropdown-item">
                                    <Link to="/customer/home?search=bracelets">Bracelets</Link>
                                </li>
                            </ul>
                        </li>
                        <li className="menu-category">
                            <Link to="/customer/category/perfume" className="menu-title">Perfume</Link>
                            <ul className="dropdown-list">
                                <li className="dropdown-item">
                                    <Link to="/customer/home?search=perfume">Clothes Perfume</Link>
                                </li>
                                <li className="dropdown-item">
                                    <Link to="/customer/home?search=deodorant">Deodorant</Link>
                                </li>
                                <li className="dropdown-item">
                                    <Link to="/customer/home?search=flower">Flower Fragrance</Link>
                                </li>
                                <li className="dropdown-item">
                                    <Link to="/customer/home?search=freshener">Air Freshener</Link>
                                </li>
                            </ul>
                        </li>
                        <li className="menu-category">
                            <Link to="/customer/blog" className="menu-title">Blog</Link>
                        </li>
                        <li className="menu-category">
                            <Link to="/customer/hotoffers" className="menu-title">Hot Offers</Link>
                        </li>
                    </ul>
                </div>
            </nav>
            {/* <div className="mobile-bottom-navigation">
                <button className="action-btn" data-mobile-menu-open-btn>
                    <ion-icon name="menu-outline" />
                </button>
                <button className="action-btn">
                    <ion-icon name="bag-handle-outline" />
                    <span className="count">0</span>
                </button>
                <button className="action-btn">
                    <ion-icon name="home-outline" />
                </button>
                <button className="action-btn">
                    <ion-icon name="heart-outline" />
                    <span className="count">0</span>
                </button>
                <button className="action-btn" data-mobile-menu-open-btn>
                    <ion-icon name="grid-outline" />
                </button>
            </div> */}
            {/* <nav className="mobile-navigation-menu  has-scrollbar" data-mobile-menu>
                <div className="menu-top">
                    <h2 className="menu-title">Menu</h2>
                    <button className="menu-close-btn" data-mobile-menu-close-btn>
                        <ion-icon name="close-outline" />
                    </button>
                </div>
                <ul className="mobile-menu-category-list">
                    <li className="menu-category">
                        <a href="#" className="menu-title">Home</a>
                    </li>
                    <li className="menu-category">
                        <button className="accordion-menu" data-accordion-btn>
                            <p className="menu-title">Men's</p>
                            <div>
                                <ion-icon name="add-outline" className="add-icon" />
                                <ion-icon name="remove-outline" className="remove-icon" />
                            </div>
                        </button>
                        <ul className="submenu-category-list" data-accordion>
                            <li className="submenu-category">
                                <a href="#" className="submenu-title">Shirt</a>
                            </li>
                            <li className="submenu-category">
                                <a href="#" className="submenu-title">Shorts &amp; Jeans</a>
                            </li>
                            <li className="submenu-category">
                                <a href="#" className="submenu-title">Safety Shoes</a>
                            </li>
                            <li className="submenu-category">
                                <a href="#" className="submenu-title">Wallet</a>
                            </li>
                        </ul>
                    </li>
                    <li className="menu-category">
                        <button className="accordion-menu" data-accordion-btn>
                            <p className="menu-title">Women's</p>
                            <div>
                                <ion-icon name="add-outline" className="add-icon" />
                                <ion-icon name="remove-outline" className="remove-icon" />
                            </div>
                        </button>
                        <ul className="submenu-category-list" data-accordion>
                            <li className="submenu-category">
                                <a href="#" className="submenu-title">Dress &amp; Frock</a>
                            </li>
                            <li className="submenu-category">
                                <a href="#" className="submenu-title">Earrings</a>
                            </li>
                            <li className="submenu-category">
                                <a href="#" className="submenu-title">Necklace</a>
                            </li>
                            <li className="submenu-category">
                                <a href="#" className="submenu-title">Makeup Kit</a>
                            </li>
                        </ul>
                    </li>
                    <li className="menu-category">
                        <button className="accordion-menu" data-accordion-btn>
                            <p className="menu-title">Jewelry</p>
                            <div>
                                <ion-icon name="add-outline" className="add-icon" />
                                <ion-icon name="remove-outline" className="remove-icon" />
                            </div>
                        </button>
                        <ul className="submenu-category-list" data-accordion>
                            <li className="submenu-category">
                                <a href="#" className="submenu-title">Earrings</a>
                            </li>
                            <li className="submenu-category">
                                <a href="#" className="submenu-title">Couple Rings</a>
                            </li>
                            <li className="submenu-category">
                                <a href="#" className="submenu-title">Necklace</a>
                            </li>
                            <li className="submenu-category">
                                <a href="#" className="submenu-title">Bracelets</a>
                            </li>
                        </ul>
                    </li>
                    <li className="menu-category">
                        <button className="accordion-menu" data-accordion-btn>
                            <p className="menu-title">Perfume</p>
                            <div>
                                <ion-icon name="add-outline" className="add-icon" />
                                <ion-icon name="remove-outline" className="remove-icon" />
                            </div>
                        </button>
                        <ul className="submenu-category-list" data-accordion>
                            <li className="submenu-category">
                                <a href="#" className="submenu-title">Clothes Perfume</a>
                            </li>
                            <li className="submenu-category">
                                <a href="#" className="submenu-title">Deodorant</a>
                            </li>
                            <li className="submenu-category">
                                <a href="#" className="submenu-title">Flower Fragrance</a>
                            </li>
                            <li className="submenu-category">
                                <a href="#" className="submenu-title">Air Freshener</a>
                            </li>
                        </ul>
                    </li>
                    <li className="menu-category">
                        <a href="#" className="menu-title">Blog</a>
                    </li>
                    <li className="menu-category">
                        <a href="#" className="menu-title">Hot Offers</a>
                    </li>
                </ul>
                <div className="menu-bottom">
                    <ul className="menu-category-list">
                        <li className="menu-category">
                            <button className="accordion-menu" data-accordion-btn>
                                <p className="menu-title">Language</p>
                                <ion-icon name="caret-back-outline" className="caret-back" />
                            </button>
                            <ul className="submenu-category-list" data-accordion>
                                <li className="submenu-category">
                                    <a href="#" className="submenu-title">English</a>
                                </li>
                                <li className="submenu-category">
                                    <a href="#" className="submenu-title">Español</a>
                                </li>
                                <li className="submenu-category">
                                    <a href="#" className="submenu-title">Frençh</a>
                                </li>
                            </ul>
                        </li>
                        <li className="menu-category">
                            <button className="accordion-menu" data-accordion-btn>
                                <p className="menu-title">Currency</p>
                                <ion-icon name="caret-back-outline" className="caret-back" />
                            </button>
                            <ul className="submenu-category-list" data-accordion>
                                <li className="submenu-category">
                                    <a href="#" className="submenu-title">USD $</a>
                                </li>
                                <li className="submenu-category">
                                    <a href="#" className="submenu-title">EUR €</a>
                                </li>
                            </ul>
                        </li>
                    </ul>
                    <ul className="menu-social-container">
                        <li>
                            <a href="#" className="social-link">
                                <ion-icon name="logo-facebook" />
                            </a>
                        </li>
                        <li>
                            <a href="#" className="social-link">
                                <ion-icon name="logo-twitter" />
                            </a>
                        </li>
                        <li>
                            <a href="#" className="social-link">
                                <ion-icon name="logo-instagram" />
                            </a>
                        </li>
                        <li>
                            <a href="#" className="social-link">
                                <ion-icon name="logo-linkedin" />
                            </a>
                        </li>
                    </ul>
                </div>
            </nav> */}
        </header>

    )
}

export default Header
