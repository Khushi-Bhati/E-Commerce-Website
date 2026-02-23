import React from "react";
import "./../styles/css/style-prefix.css";
import "./../styles/css/style.css";

const ProductColumn = ({ title, items = [], loading = false, error = "", onAddToCart = () => {}, cartLoadingById = {} }) => {
    const handleCartClick = (e, productId) => {
        e.preventDefault();
        e.stopPropagation();
        onAddToCart(productId);
    };

    return (
        <div className="product-showcase">
            <h2 className="title">{title}</h2>
            <div className="showcase-wrapper has-scrollbar">
                <div className="showcase-container">
                    {loading && <p>Loading...</p>}
                    {!loading && error && <p>{error}</p>}
                    {!loading && !error && items.length === 0 && <p>No products yet</p>}
                    {items.map((item) => (
                        <div className="showcase" key={item._id}>
                            <a href="#" className="showcase-img-box">
                                <img src={item.productimg?.[0] || "https://via.placeholder.com/70"} alt={item.productname} className="showcase-img" width={70} />
                            </a>
                            <div className="showcase-content">
                                <a href="#">
                                    <h4 className="showcase-title">{item.productname}</h4>
                                </a>
                                <a href="#" className="showcase-category">{item.category}</a>
                                <div className="price-box">
                                    <p className="price">Rs {item.discount || item.price}</p>
                                    {item.discount && <del>Rs {item.price}</del>}
                                </div>
                                <button
                                    type="button"
                                    className="add-cart-btn"
                                    onClick={(e) => handleCartClick(e, item._id)}
                                    disabled={Boolean(cartLoadingById[item._id])}
                                >
                                    {cartLoadingById[item._id] ? "adding..." : "add to cart"}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const Productminimal = ({ products = [], loading = false, error = "", onAddToCart = () => {}, cartLoadingById = {} }) => {
    const newArrivals = products.slice(0, 4);
    const trending = products.slice(4, 8).length ? products.slice(4, 8) : products.slice(0, 4);
    const topRated = products.slice(8, 12).length ? products.slice(8, 12) : products.slice(0, 4);

    return (
        <div className="product-minimal">
            <ProductColumn title="New Arrivals" items={newArrivals} loading={loading} error={error} onAddToCart={onAddToCart} cartLoadingById={cartLoadingById} />
            <ProductColumn title="Trending" items={trending} loading={loading} error={error} onAddToCart={onAddToCart} cartLoadingById={cartLoadingById} />
            <ProductColumn title="Top Rated" items={topRated} loading={loading} error={error} onAddToCart={onAddToCart} cartLoadingById={cartLoadingById} />
        </div>
    );
};

export default Productminimal;
