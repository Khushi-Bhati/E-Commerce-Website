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
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [expandedSection, setExpandedSection] = useState(null)

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

    // Close mobile menu on resize to desktop
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setIsMobileMenuOpen(false)
            }
        }
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => { document.body.style.overflow = '' }
    }, [isMobileMenuOpen])

    const handleSearchChange = (event) => {
        setLocalSearch(event.target.value)
        if (onSearchChange) {
            onSearchChange(event.target.value)
        }
    }

    const handleSearchSubmit = (event) => {
        event.preventDefault();
        if (window.location.pathname !== '/customer/home') {
            navigate(`/customer/home?search=${encodeURIComponent(localSearch.trim())}`)
        }
        setIsMobileMenuOpen(false)
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

    const toggleSection = (section) => {
        setExpandedSection(prev => prev === section ? null : section)
    }

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false)
        setExpandedSection(null)
    }

    const navLinks = [
        { label: 'Home', to: '/customer/home' },
        {
            label: "Men's", to: '/customer/category/men', children: [
                { label: 'Shirt', to: '/customer/home?search=shirt' },
                { label: 'Shorts & Jeans', to: '/customer/home?search=shorts' },
                { label: 'Safety Shoes', to: '/customer/home?search=shoes' },
                { label: 'Wallet', to: '/customer/home?search=wallet' },
            ]
        },
        {
            label: "Women's", to: '/customer/category/women', children: [
                { label: 'Dress & Frock', to: '/customer/home?search=dress' },
                { label: 'Earrings', to: '/customer/home?search=earrings' },
                { label: 'Necklace', to: '/customer/home?search=necklace' },
                { label: 'Makeup Kit', to: '/customer/home?search=makeup' },
            ]
        },
        {
            label: 'Jewelry', to: '/customer/category/jewelry', children: [
                { label: 'Earrings', to: '/customer/home?search=earrings' },
                { label: 'Couple Rings', to: '/customer/home?search=rings' },
                { label: 'Necklace', to: '/customer/home?search=necklace' },
                { label: 'Bracelets', to: '/customer/home?search=bracelets' },
            ]
        },
        {
            label: 'Perfume', to: '/customer/category/perfume', children: [
                { label: 'Clothes Perfume', to: '/customer/home?search=perfume' },
                { label: 'Deodorant', to: '/customer/home?search=deodorant' },
                { label: 'Flower Fragrance', to: '/customer/home?search=flower' },
                { label: 'Air Freshener', to: '/customer/home?search=freshener' },
            ]
        },
        { label: 'Blog', to: '/customer/blog' },
        { label: 'Hot Offers 🔥', to: '/customer/hotoffers' },
    ]

    return (
        <>
            <header>
                {/* ── TOP BAR ── */}
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

                {/* ── MAIN HEADER ── */}
                <div className="header-main">
                    <div className="container">
                        {/* Hamburger — visible only on mobile */}
                        <button
                            className="mobile-menu-toggle"
                            onClick={() => setIsMobileMenuOpen(true)}
                            aria-label="Open menu"
                        >
                            <ion-icon name="menu-outline" />
                        </button>

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
<<<<<<< HEAD
                                        <img src={profiledata.profileimg.startsWith("http") ? profiledata.profileimg : `${process.env.REACT_APP_ENV_URL}/temp/${profiledata.profileimg}`} alt="avatar" className="user-avatar-img" />
=======
                                        <img src={profiledata.profileimg.startsWith("http") ? profiledata.profileimg : `http://localhost:8000/temp/${profiledata.profileimg}`} alt="avatar" className="user-avatar-img" />
>>>>>>> f1b853994271a68fafe3d6ce836129b73a6c8a6a
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
<<<<<<< HEAD
                                                    <img src={profiledata.profileimg.startsWith("http") ? profiledata.profileimg : `${process.env.REACT_APP_ENV_URL}/temp/${profiledata.profileimg}`} alt="avatar" />
=======
                                                    <img src={profiledata.profileimg.startsWith("http") ? profiledata.profileimg : `http://localhost:8000/temp/${profiledata.profileimg}`} alt="avatar" />
>>>>>>> f1b853994271a68fafe3d6ce836129b73a6c8a6a
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

                {/* ── DESKTOP NAVIGATION ── */}
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
            </header>

            {/* ─── MOBILE SLIDE-OUT MENU ─── */}
            {isMobileMenuOpen && (
                <div className="mobile-menu-overlay" onClick={closeMobileMenu} />
            )}
            <nav className={`mobile-nav-drawer ${isMobileMenuOpen ? 'open' : ''}`}>
                {/* Drawer Header */}
                <div className="mobile-nav-header">
                    <div className="brand-logo-pill" style={{ display: 'inline-flex' }}>
                        <span className="brand-logo-icon">🛒</span>
                        <span className="brand-logo-text">
                            Ease<span className="brand-logo-accent">inCart</span>
                        </span>
                    </div>
                    <button className="mobile-nav-close" onClick={closeMobileMenu} aria-label="Close menu">
                        <ion-icon name="close-outline" />
                    </button>
                </div>

                {/* Search in drawer */}
                <form className="mobile-nav-search" onSubmit={handleSearchSubmit}>
                    <input
                        type="search"
                        placeholder="Search products..."
                        value={localSearch}
                        onChange={handleSearchChange}
                        className="mobile-search-input"
                    />
                    <button type="submit" className="mobile-search-btn" aria-label="Search">
                        <ion-icon name="search-outline" />
                    </button>
                </form>

                {/* User info strip */}
                <div className="mobile-nav-user">
                    <div className="user-avatar">
                        {profiledata?.profileimg ? (
<<<<<<< HEAD
                            <img src={profiledata.profileimg.startsWith("http") ? profiledata.profileimg : `${process.env.REACT_APP_ENV_URL}/temp/${profiledata.profileimg}`} alt="avatar" className="user-avatar-img" />
=======
                            <img src={profiledata.profileimg.startsWith("http") ? profiledata.profileimg : `http://localhost:8000/temp/${profiledata.profileimg}`} alt="avatar" className="user-avatar-img" />
>>>>>>> f1b853994271a68fafe3d6ce836129b73a6c8a6a
                        ) : (
                            <div className="user-avatar-initial">
                                {profiledata?.name ? profiledata.name.charAt(0).toUpperCase() : (role === 'buyer' ? 'B' : 'U')}
                            </div>
                        )}
                    </div>
                    <div>
                        <p className="mobile-nav-username">{profiledata?.name || 'My Account'}</p>
                        <p className="mobile-nav-userrole">{role === 'buyer' ? '🛍️ Buyer' : role === 'seller' ? '🏪 Seller' : 'Guest'}</p>
                    </div>
                </div>

                {/* Navigation links */}
                <ul className="mobile-nav-list">
                    {navLinks.map((link, idx) => (
                        <li key={idx} className="mobile-nav-item">
                            {link.children ? (
                                <>
                                    <button
                                        className={`mobile-nav-accordion ${expandedSection === link.label ? 'active' : ''}`}
                                        onClick={() => toggleSection(link.label)}
                                    >
                                        <Link to={link.to} onClick={closeMobileMenu} style={{ flex: 1, textAlign: 'left' }}>{link.label}</Link>
                                        <ion-icon name={expandedSection === link.label ? 'chevron-up-outline' : 'chevron-down-outline'} />
                                    </button>
                                    {expandedSection === link.label && (
                                        <ul className="mobile-nav-submenu">
                                            {link.children.map((child, ci) => (
                                                <li key={ci}>
                                                    <Link to={child.to} className="mobile-nav-sublink" onClick={closeMobileMenu}>
                                                        {child.label}
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </>
                            ) : (
                                <Link to={link.to} className="mobile-nav-link" onClick={closeMobileMenu}>
                                    {link.label}
                                </Link>
                            )}
                        </li>
                    ))}
                </ul>

                {/* Quick actions at bottom */}
                <div className="mobile-nav-footer">
                    <Link to="/customer/createprofile" className="mobile-nav-footer-item" onClick={closeMobileMenu}>
                        <ion-icon name="person-outline" /> My Profile
                    </Link>
                    <Link to="/customer/orders" className="mobile-nav-footer-item" onClick={closeMobileMenu}>
                        <ion-icon name="receipt-outline" /> My Orders
                    </Link>
                    <Link to="/customer/cart" className="mobile-nav-footer-item" onClick={closeMobileMenu}>
                        <ion-icon name="bag-handle-outline" /> Cart {cartCount > 0 && <span className="mobile-cart-badge">{cartCount}</span>}
                    </Link>
                    <button className="mobile-nav-logout" onClick={() => { closeMobileMenu(); handleLogout(); }}>
                        <ion-icon name="log-out-outline" /> Sign Out
                    </button>
                </div>
            </nav>
        </>
    )
}

export default Header
