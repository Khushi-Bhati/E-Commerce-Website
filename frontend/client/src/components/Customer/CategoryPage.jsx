import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import API from '../../config/api.js';
import { useDispatch, useSelector } from 'react-redux';
import { setProfiledata } from '../../reducers/Reducers.js';
import Swal from 'sweetalert2';
import "../../styles/category-page.css";

const CategoryPage = () => {
    const { categoryName } = useParams();
    const dispatch = useDispatch();
    const loginId = (localStorage.getItem("userID") || "").replace(/"/g, "").trim();

    const profiledata = useSelector((state) => state.customer.customerprofile);

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cartCount, setCartCount] = useState(0);
    const [cartLoadingById, setCartLoadingById] = useState({});
    const [searchTerm, setSearchTerm] = useState("");

    const [sortOption, setSortOption] = useState("newest");
    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 8;

    // Filters
    const [priceRange, setPriceRange] = useState({ min: "", max: "" });
    const [selectedBrands, setSelectedBrands] = useState([]);

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
            const response = await API.get(`/product/getproducts?category=${categoryName}`);
            if (response.data.status === "success") {
                setProducts(response.data.products || []);
            }
        } catch (error) {
            console.log("get products error", error);
        } finally {
            setLoading(false);
        }
    }, [categoryName]);

    useEffect(() => {
        getprofile();
        getProducts();
        getCart();
    }, [getprofile, getProducts, getCart]);

    // Because we fetch dynamically from the backend now, products is already just this category
    const categoryProductsUnfiltered = products;

    const availableBrands = useMemo(() => {
        const brands = new Set();
        categoryProductsUnfiltered.forEach(p => {
            if (p.brand) brands.add(p.brand.toLowerCase());
        });
        return Array.from(brands);
    }, [categoryProductsUnfiltered]);

    // Filtering + Sorting
    const filteredAndSortedProducts = useMemo(() => {
        let result = [...categoryProductsUnfiltered];

        // Filter by Brand
        if (selectedBrands.length > 0) {
            result = result.filter(p => p.brand && selectedBrands.includes(p.brand.toLowerCase()));
        }

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
            case "price-low":
                result.sort((a, b) => Number(a.discount || a.price) - Number(b.discount || b.price));
                break;
            case "price-high":
                result.sort((a, b) => Number(b.discount || b.price) - Number(a.discount || a.price));
                break;
            case "newest":
            default:
                // assuming _id conveys insertion order / time
                result.sort((a, b) => b._id.localeCompare(a._id));
                break;
        }

        return result;
    }, [categoryProductsUnfiltered, selectedBrands, priceRange, sortOption]);

    // Pagination
    const totalPages = Math.ceil(filteredAndSortedProducts.length / productsPerPage) || 1;
    const currentProducts = filteredAndSortedProducts.slice(
        (currentPage - 1) * productsPerPage,
        currentPage * productsPerPage
    );

    // Reset page if filtered results drop below current page
    useEffect(() => {
        if (currentPage > totalPages) setCurrentPage(Math.max(1, totalPages));
    }, [filteredAndSortedProducts, currentPage, totalPages]);


    const handleBrandToggle = (brand) => {
        setSelectedBrands(prev =>
            prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
        );
    };

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
                        <Link to="/customer/home" className="breadcrumb-link">Categories</Link>
                        <span className="breadcrumb-separator"><ion-icon name="chevron-forward-outline"></ion-icon></span>
                        <span className="breadcrumb-current">{categoryName}'s Collection</span>
                    </nav>
                </div>

                {/* Page Header */}
                <div className="category-page-header">
                    <div>
                        <h1 className="category-title">{categoryName}'s Collection</h1>
                        <p className="category-meta">
                            Showing {filteredAndSortedProducts.length} {filteredAndSortedProducts.length === 1 ? 'product' : 'products'}
                        </p>
                    </div>

                    <div className="sort-container">
                        <label className="sort-label">Sort By:</label>
                        <select
                            className="sort-select"
                            value={sortOption}
                            onChange={e => setSortOption(e.target.value)}
                        >
                            <option value="newest">Newest Arrivals</option>
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

                        {availableBrands.length > 0 && (
                            <div className="filter-section">
                                <h3 className="filter-title">Brands</h3>
                                <div className="filter-options">
                                    {availableBrands.map(brand => (
                                        <label key={brand} className="filter-checkbox-label">
                                            <input
                                                type="checkbox"
                                                className="filter-checkbox"
                                                checked={selectedBrands.includes(brand)}
                                                onChange={() => handleBrandToggle(brand)}
                                            />
                                            <span style={{ textTransform: 'capitalize' }}>{brand}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="filter-section">
                            <h3 className="filter-title">Ratings</h3>
                            <div className="filter-options">
                                {[5, 4, 3].map(star => (
                                    <label key={star} className="filter-checkbox-label">
                                        <input type="checkbox" className="filter-checkbox" />
                                        <div style={{ display: 'flex', color: '#fbbf24', gap: '2px' }}>
                                            {[...Array(star)].map((_, i) => <ion-icon key={i} name="star"></ion-icon>)}
                                            {[...Array(5 - star)].map((_, i) => <ion-icon key={i} name="star-outline"></ion-icon>)}
                                        </div>
                                        <span style={{ color: '#94a3b8', fontSize: '13px' }}>&amp; Up</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </aside>

                    {/* Product Grid */}
                    <div className="category-product-grid" style={{ display: currentProducts.length === 0 ? 'block' : 'grid' }}>
                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '100px', color: '#64748b' }}>Loading products...</div>
                        ) : currentProducts.length === 0 ? (
                            <div className="cat-empty-state">
                                <ion-icon name="search-outline" class="cat-empty-icon"></ion-icon>
                                <h3 className="cat-empty-title">No products found</h3>
                                <p className="cat-empty-desc">
                                    We couldn't find any products in this category matching your criteria. Try adjusting your filters.
                                </p>
                            </div>
                        ) : (
                            currentProducts.map((product) => (
                                <div key={product._id} className="cat-product-card">
                                    {/* Badge */}
                                    {product.discount && (
                                        <div className="cat-discount-badge">
                                            Save {Math.round((1 - (product.discount / product.price)) * 100)}%
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
                                        <div className="cat-product-brand">{product.brand || 'EaseInCart'}</div>
                                        <h4 className="cat-product-name">{product.productname}</h4>

                                        <div className="cat-product-rating">
                                            <div style={{ display: 'flex' }}>
                                                <ion-icon name="star" class="cat-star-icon"></ion-icon>
                                                <ion-icon name="star" class="cat-star-icon"></ion-icon>
                                                <ion-icon name="star" class="cat-star-icon"></ion-icon>
                                                <ion-icon name="star" class="cat-star-icon"></ion-icon>
                                                <ion-icon name="star-outline" class="cat-star-icon"></ion-icon>
                                            </div>
                                            <span className="cat-rating-count">({Math.floor(Math.random() * 100) + 12})</span>
                                        </div>

                                        <div className="cat-product-price-row">
                                            <span className="cat-current-price">${product.discount || product.price}</span>
                                            {product.discount && (
                                                <span className="cat-original-price">${product.price}</span>
                                            )}
                                        </div>

                                        <button
                                            className="cat-add-cart-btn"
                                            onClick={() => handleAddToCart(product)}
                                            disabled={cartLoadingById[product._id]}
                                        >
                                            {cartLoadingById[product._id] ? (
                                                <ion-icon name="hourglass-outline"></ion-icon>
                                            ) : (
                                                <ion-icon name="cart-outline"></ion-icon>
                                            )}
                                            {cartLoadingById[product._id] ? 'Adding...' : 'Add to Cart'}
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

export default CategoryPage;
