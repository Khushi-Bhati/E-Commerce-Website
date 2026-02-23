import React, { useState, useEffect } from "react";
import "./../styles/css/style-prefix.css";
import "./../styles/css/style.css";
import banner1 from "./../../assets/images/electronics-banner-1.jpg";
import mensbanner from "./../../assets/images/mens-banner.jpg";
import womensbanner from "./../../assets/images/womens-banner.jpg";
import banner2 from "./../../assets/images/electronics-banner-2.jpg";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout, setProfiledata } from "../../reducers/Reducers.js";
import Swal from "sweetalert2";
import API from "../../config/api.js";

const Header = ({ cartCount = 0, searchTerm, onSearchChange }) => {
  const profiledata = useSelector((state) => state.customer.customerprofile);
  const role = useSelector((state) => state.customer.role);
  const userID = useSelector((state) => state.customer.userID);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState(null);
  const [localSearch, setLocalSearch] = useState("");

  // Sync search
  useEffect(() => {
    if (searchTerm !== undefined) {
      setLocalSearch(searchTerm);
    }
  }, [searchTerm]);

  // Fetch profile if needed
  useEffect(() => {
    const id = userID || localStorage.getItem("userID");
    if (id && !profiledata) {
      API.get(`/customer/getprofile/${id}`)
        .then((res) => {
          if (res.data.status === "success") {
            dispatch(setProfiledata(res.data.profile));
          }
        })
        .catch(() => {});
    }
  }, [userID, profiledata, dispatch]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigate(`/customer/home?search=${localSearch}`);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await API.post("/user/logout");
    } catch (_) {}
    dispatch(logout());
    Swal.fire({
      icon: "success",
      title: "Signed out",
      timer: 1200,
      showConfirmButton: false,
    });
    navigate("/login");
  };

  const avatarUrl =
    profiledata?.profileimg?.startsWith("http")
      ? profiledata.profileimg
      : profiledata?.profileimg
      ? `${process.env.REACT_APP_ENV_URL}/temp/${profiledata.profileimg}`
      : null;

  return (
    <>
      <header>
        {/* TOP BAR */}
        <div className="header-top">
          <div className="container">
            <div className="header-alert-news">
              <p>
                <b>Free Shipping</b> This Week Order Over - $55
              </p>
            </div>
          </div>
        </div>

        {/* MAIN HEADER */}
        <div className="header-main">
          <div className="container">
            <Link to="/customer/home" className="header-logo">
              <h2>Ease<span style={{ color: "#ff6f00" }}>inCart</span></h2>
            </Link>

            <form className="header-search-container" onSubmit={handleSearchSubmit}>
              <input
                type="search"
                className="search-field"
                placeholder="Search products..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
              />
              <button type="submit" className="search-btn">
                Search
              </button>
            </form>

            <div className="header-user-actions">
              {/* USER */}
              <div
                className="user-chip"
                onMouseEnter={() => setIsDropdownOpen(true)}
                onMouseLeave={() => setIsDropdownOpen(false)}
              >
                <div className="user-avatar">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="avatar" className="user-avatar-img" />
                  ) : (
                    <div className="user-avatar-initial">
                      {profiledata?.name
                        ? profiledata.name.charAt(0).toUpperCase()
                        : "U"}
                    </div>
                  )}
                </div>

                <span>{profiledata?.name || "My Account"}</span>

                {isDropdownOpen && (
                  <div className="user-dropdown">
                    <Link to="/customer/createprofile">My Profile</Link>
                    <Link to="/customer/orders">My Orders</Link>
                    <Link to="/customer/cart">Cart ({cartCount})</Link>
                    <button onClick={handleLogout}>Sign Out</button>
                  </div>
                )}
              </div>

              {/* CART */}
              <Link to="/customer/cart">
                <button className="action-btn">
                  Cart {cartCount > 0 && <span>{cartCount}</span>}
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* DESKTOP NAV */}
        <nav className="desktop-navigation-menu">
          <div className="container">
            <ul className="desktop-menu-category-list">
              <li><Link to="/customer/home">Home</Link></li>
              <li><Link to="/customer/category/men">Men</Link></li>
              <li><Link to="/customer/category/women">Women</Link></li>
              <li><Link to="/customer/category/jewelry">Jewelry</Link></li>
              <li><Link to="/customer/category/perfume">Perfume</Link></li>
              <li><Link to="/customer/blog">Blog</Link></li>
              <li><Link to="/customer/hotoffers">Hot Offers</Link></li>
            </ul>
          </div>
        </nav>
      </header>
    </>
  );
};

export default Header;
