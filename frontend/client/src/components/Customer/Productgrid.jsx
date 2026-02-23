import React from "react";
import "./../styles/css/style-prefix.css";
import "./../styles/css/style.css";

const Productgrid = ({ products = [], loading = false, error = "", onAddToCart = () => {}, cartLoadingById = {} }) => {
    const handleCartClick = (e, productId) => {
        e.preventDefault();
        e.stopPropagation();
        onAddToCart(productId);
    };

    return (
        <div className="product-main">
            <h2 className="title">Dashboard Products</h2>
            <div className="product-grid">
                {loading && <p>Loading products...</p>}
                {!loading && error && <p>{error}</p>}
                {!loading && !error && products.length === 0 && <p>No products available yet.</p>}

                {!loading && !error && products.map((product) => (
                    <div className="showcase" key={product._id}>
                        <div className="showcase-banner">
                            <img
                                src={product.productimg?.[0]}
                                alt={product.productname}
                                width={300}
                                className="product-img default"
                            />
                            <img
                                src={product.productimg?.[1] || product.productimg?.[0]}
                                alt={product.productname}
                                width={300}
                                className="product-img hover"
                            />
                            {product.discount && <p className="showcase-badge">Sale</p>}
                            <div className="showcase-actions">
                                <button className="btn-action">
                                    <ion-icon name="heart-outline" />
                                </button>
                                <button className="btn-action">
                                    <ion-icon name="eye-outline" />
                                </button>
                                <button className="btn-action">
                                    <ion-icon name="repeat-outline" />
                                </button>
                                <button
                                    type="button"
                                    className="btn-action"
                                    onClick={(e) => handleCartClick(e, product._id)}
                                    disabled={Boolean(cartLoadingById[product._id])}
                                    aria-label="Add to cart"
                                >
                                    <ion-icon name="bag-add-outline" />
                                </button>
                            </div>
                        </div>
                        <div className="showcase-content">
                            <a href="#" className="showcase-category">{product.category}</a>
                            <a href="#">
                                <h3 className="showcase-title">{product.productname}</h3>
                            </a>
                            <div className="showcase-rating">
                                <ion-icon name="star" />
                                <ion-icon name="star" />
                                <ion-icon name="star" />
                                <ion-icon name="star-outline" />
                                <ion-icon name="star-outline" />
                            </div>
                            <div className="price-box">
                                <p className="price">Rs {product.discount || product.price}</p>
                                {product.discount && <del>Rs {product.price}</del>}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Productgrid;
