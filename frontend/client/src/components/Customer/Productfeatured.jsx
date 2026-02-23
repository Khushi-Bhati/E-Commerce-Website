import React from "react";
import "./../styles/css/style-prefix.css";
import "./../styles/css/style.css";

const Productfeatured = ({ products = [], loading = false, error = "", onAddToCart = () => {}, cartLoadingById = {} }) => {
    const featuredProducts = products.slice(0, 2);
    const handleCartClick = (e, productId) => {
        e.preventDefault();
        e.stopPropagation();
        onAddToCart(productId);
    };

    return (
        <div className="product-featured">
            <h2 className="title">Deal of the day</h2>
            <div className="showcase-wrapper has-scrollbar">
                {loading && <p>Loading featured products...</p>}
                {!loading && error && <p>{error}</p>}
                {!loading && !error && featuredProducts.length === 0 && <p>No featured products yet</p>}
                {featuredProducts.map((product) => (
                    <div className="showcase-container" key={product._id}>
                        <div className="showcase">
                            <div className="showcase-banner">
                                <img src={product.productimg?.[0] || "https://via.placeholder.com/300x300"} alt={product.productname} className="showcase-img" />
                            </div>
                            <div className="showcase-content">
                                <div className="showcase-rating">
                                    <ion-icon name="star" />
                                    <ion-icon name="star" />
                                    <ion-icon name="star" />
                                    <ion-icon name="star-outline" />
                                    <ion-icon name="star-outline" />
                                </div>
                                <a href="#">
                                    <h3 className="showcase-title">{product.productname}</h3>
                                </a>
                                <p className="showcase-desc">{product.description || `${product.brand} ${product.category}`}</p>
                                <div className="price-box">
                                    <p className="price">Rs {product.discount || product.price}</p>
                                    {product.discount && <del>Rs {product.price}</del>}
                                </div>
                                <button
                                    type="button"
                                    className="add-cart-btn"
                                    onClick={(e) => handleCartClick(e, product._id)}
                                    disabled={Boolean(cartLoadingById[product._id])}
                                >
                                    {cartLoadingById[product._id] ? "adding..." : "add to cart"}
                                </button>
                                <div className="showcase-status">
                                    <div className="wrapper">
                                        <p>available: <b>{product.stock || 0}</b></p>
                                    </div>
                                    <div className="showcase-status-bar" />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Productfeatured;
