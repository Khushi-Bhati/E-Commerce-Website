import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import API from '../../config/api.js';
import { useDispatch, useSelector } from 'react-redux';
import { setProfiledata } from '../../reducers/Reducers.js';
import Swal from 'sweetalert2';
import "../../styles/category-page.css";

const HotOffersPage = () => {
    const dispatch = useDispatch();
    const loginId = (localStorage.getItem("userID") || "").replace(/"/g, "").trim();

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cartCount, setCartCount] = useState(0);
    const [cartLoadingById, setCartLoadingById] = useState({});
    const [searchTerm, setSearchTerm] = useState("");

    const [sortOption, setSortOption] = useState("biggest-discount");
    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 8;

    // Filters
    const [priceRange, setPriceRange] = useState({ min: "", max: "" });

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

    const getProducts = useCallback(async () => {
        try {
            setLoading(true);
            const response = await API.get("/product/getproducts?isHotOffer=true");
            if (response.data.status === "success") {
                setProducts(response.data.products || []);
            }
        } catch (error) {
            console.log("get products error", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        getprofile();
        getProducts();
        getCart();
    }, [getprofile, getProducts, getCart]);

    // Filtering + Sorting
    const filteredAndSortedProducts = useMemo(() => {
        let result = [...products];

        // Filter by Price Range
        if (priceRange.min) {
            result = result.filter(p => {
                const price = Number(p.discount || p.price);
                return price >= Number(priceRange.min);
            });
        }
        if (priceRange.max) {
            result = result.filter(p => {
                const price = Number(p.discount || p.price);
                return price <= Number(priceRange.max);
            });
        }

        // Sort
        switch (sortOption) {
            case "biggest-discount":
                result.sort((a, b) => {
                    const discountA = Math.round((1 - (a.discount / a.price)) * 100);
                    const discountB = Math.round((1 - (b.discount / b.price)) * 100);
                    return discountB - discountA;
                });
                break;
            case "price-low":
                result.sort((a, b) => Number(a.discount || a.price) - Number(b.discount || b.price));
                break;
            case "price-high":
                result.sort((a, b) => Number(b.discount || b.price) - Number(a.discount || a.price));
                break;
            default:
                break;
        }

        return result;
    }, [products, priceRange, sortOption]);

    // Pagination
    const totalPages = Math.ceil(filteredAndSortedProducts.length / productsPerPage) || 1;
    const currentProducts = filteredAndSortedProducts.slice(
        (currentPage - 1) * productsPerPage,
        currentPage * productsPerPage
    );

    useEffect(() => {
        if (currentPage > totalPages) setCurrentPage(Math.max(1, totalPages));
    }, [filteredAndSortedProducts, currentPage, totalPages]);


    const handleAddToCart = async (product) => {
        if (!loginId) {
            Swal.fire({ icon: "warning", title: "Please login first" });
            return;
        }

        try {
            setCartLoadingById((prev) => ({ ...prev, [product._id]: true }));
            const response = await API.post("/cart/add", {
                userId: loginId,
                productId: product._id,
                quantity: 1
            });

            if (response.data.status === "success") {
                setCartCount(response.data?.totals?.itemCount || 0);
                Swal.fire({
                    icon: "success",
                    title: "Added to cart",
                    html: `
            <div style="text-align:left; font-family: Inter, sans-serif;">
              <p style="margin-bottom:6px"><b>${product.productname}</b></p>
              <p style="margin-bottom:6px; color:#6366f1;">$${product.discount || product.price}</p>
            </div>
          `
                });
            } else {
                Swal.fire({ icon: "error", title: response.data.message || "Failed to add to cart" });
            }
        } catch (error) {
            Swal.fire({ icon: "error", title: error?.response?.data?.message || "Failed to add" });
        } finally {
            setCartLoadingById((prev) => ({ ...prev, [product._id]: false }));
        }
    };


    return (
        <div className="category-page-wrapper">
            <Header cartCount={cartCount} searchTerm={searchTerm} onSearchChange={setSearchTerm} />

            <div className="container">
                {/* Breadcrumbs */}
                <div className="breadcrumb-container">
                    <nav className="breadcrumb-nav">
                        <Link to="/customer/home" className="breadcrumb-link">Home</Link>
                        <span className="breadcrumb-separator"><ion-icon name="chevron-forward-outline"></ion-icon></span>
                        <span className="breadcrumb-current">Special Deals</span>
                    </nav>
                </div>

                {/* Page Header */}
                <div className="category-page-header">
                    <div>
                        <h1 className="category-title" style={{ color: '#ef4444' }}>🔥 Hot Offers & Top Deals</h1>
                        <p className="category-meta">
                            Handpicked deals featuring massive discounts. Act fast!
                        </p>
                    </div>

                    <div className="sort-container">
                        <label className="sort-label">Sort By:</label>
                        <select
                            className="sort-select"
                            value={sortOption}
                            onChange={e => setSortOption(e.target.value)}
                        >
                            <option value="biggest-discount">Biggest Discounts</option>
                            <option value="price-low">Price: Low to High</option>
                            <option value="price-high">Price: High to Low</option>
                        </select>
                    </div>
                </div>

                <div className="category-layout">
                    {/* Sidebar */}
                    <aside className="category-sidebar">
                        <div className="filter-section">
                            <h3 className="filter-title">Price Range</h3>
                            <div className="price-range-inputs">
                                <input
                                    type="number"
                                    className="price-input"
                                    placeholder="Min $"
                                    value={priceRange.min}
                                    onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                                />
                                <span style={{ color: '#94a3b8' }}>-</span>
                                <input
                                    type="number"
                                    className="price-input"
                                    placeholder="Max $"
                                    value={priceRange.max}
                                    onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="filter-section">
                            <h3 className="filter-title">Discounts</h3>
                            <div className="filter-options">
                                {[50, 40, 30, 20].map(percent => (
                                    <label key={percent} className="filter-checkbox-label">
                                        <input type="checkbox" className="filter-checkbox" />
                                        <span style={{ color: '#ef4444', fontWeight: '700' }}>{percent}% Off</span>
                                        <span style={{ color: '#94a3b8', fontSize: '13px' }}>&amp; Up</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div style={{ marginTop: '24px', padding: '16px', borderRadius: '12px', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: '#fff', textAlign: 'center' }}>
                            <h4 style={{ fontWeight: '800', fontSize: '18px', marginBottom: '8px' }}>CLEARANCE SALE</h4>
                            <p style={{ fontSize: '13px', opacity: 0.9 }}>Grab these deals before they disappear! Stock is limited.</p>
                        </div>
                    </aside>

                    {/* Product Grid */}
                    <div className="category-product-grid" style={{ display: currentProducts.length === 0 ? 'block' : 'grid' }}>
                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '100px', color: '#64748b' }}>Loading special deals...</div>
                        ) : currentProducts.length === 0 ? (
                            <div className="cat-empty-state">
                                <ion-icon name="flame" class="cat-empty-icon" style={{ color: '#f87171' }}></ion-icon>
                                <h3 className="cat-empty-title">We caught our breath</h3>
                                <p className="cat-empty-desc">
                                    No active hot offers or lightning deals dropping right now covering your search! Check back soon or adjust the price range.
                                </p>
                            </div>
                        ) : (
                            currentProducts.map((product) => (
                                <div key={product._id} className="cat-product-card" style={{ borderColor: '#fca5a5' }}>
                                    {/* Badge */}
                                    {product.discount && (
                                        <div className="cat-discount-badge" style={{ transform: 'scale(1.1)', top: '8px', left: '8px' }}>
                                            💥 Save {Math.round((1 - (product.discount / product.price)) * 100)}%
                                        </div>
                                    )}

                                    {/* Wishlist */}
                                    <button className="cat-wishlist-btn">
                                        <ion-icon name="heart-outline"></ion-icon>
                                    </button>

                                    {/* Image */}
                                    <div className="cat-product-image-container">
                                        <img
                                            src={product.productimg?.[0] || 'https://via.placeholder.com/300x300?text=No+Image'}
                                            alt={product.productname}
                                            className="cat-product-image"
                                        />
                                    </div>

                                    {/* Info */}
                                    <div className="cat-product-info">
                                        <div className="cat-product-brand">{product.brand || 'HOT DEAL'}</div>
                                        <h4 className="cat-product-name">{product.productname}</h4>

                                        <div className="cat-product-price-row" style={{ marginTop: '8px' }}>
                                            <span className="cat-current-price" style={{ color: '#ef4444' }}>${product.discount || product.price}</span>
                                            {product.discount && (
                                                <span className="cat-original-price">${product.price}</span>
                                            )}
                                        </div>

                                        <button
                                            className="cat-add-cart-btn"
                                            style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}
                                            onClick={() => handleAddToCart(product)}
                                            disabled={cartLoadingById[product._id]}
                                        >
                                            {cartLoadingById[product._id] ? (
                                                <ion-icon name="hourglass-outline"></ion-icon>
                                            ) : (
                                                <ion-icon name="cart-outline"></ion-icon>
                                            )}
                                            {cartLoadingById[product._id] ? 'Adding...' : 'Claim Deal'}
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="cat-pagination-container">
                                <button
                                    className="cat-page-btn"
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                >
                                    <ion-icon name="chevron-back-outline"></ion-icon>
                                </button>

                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i}
                                        className={`cat-page-btn ${currentPage === i + 1 ? 'active' : ''}`}
                                        onClick={() => setCurrentPage(i + 1)}
                                    >
                                        {i + 1}
                                    </button>
                                ))}

                                <button
                                    className="cat-page-btn"
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                >
                                    <ion-icon name="chevron-forward-outline"></ion-icon>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default HotOffersPage;
