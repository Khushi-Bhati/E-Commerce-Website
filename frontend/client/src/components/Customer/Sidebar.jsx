import React, { useState } from "react";
import "./../styles/css/style-prefix.css";
import "./../styles/css/style.css";
import dress from "./../../assets/images/icons/dress.svg";
import shoes from "./../../assets/images/icons/shoes.svg";
import cosmetics from "./../../assets/images/icons/cosmetics.svg";
import bag from "./../../assets/images/icons/bag.svg";
import watch from "./../../assets/images/icons/watch.svg";

const iconMap = {
    all: watch,
    fashion: dress,
    sports: shoes,
    beauty: cosmetics,
    "home living": bag,
    electronics: watch,
    men: dress,
    women: dress,
    jewelry: watch,  // could use watch or a ring icon if available
    perfume: cosmetics
};

const Sidebar = ({
    categoryStats = [],
    selectedCategory = "all",
    onSelectCategory = () => { },
    bestSellerProducts = [],
    loading = false,
    isOpen = false,
    onClose = () => { }
}) => {
    const totalProducts = categoryStats.reduce((sum, item) => sum + Number(item.count || 0), 0);
    const categories = [{ key: "all", label: "All Products", count: totalProducts }, ...categoryStats];
    const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(true);
    const [isBestSellerMenuOpen, setIsBestSellerMenuOpen] = useState(true);

    return (
        <aside className={`sidebar has-scrollbar customer-home-sidebar ${isOpen ? "active" : ""}`} data-mobile-menu>
            <div className="sidebar-category">
                <div className="sidebar-top">
                    <h2 className="sidebar-title">Menu</h2>
                  
                </div>

                <button
                    type="button"
                    className={`customer-home-section-toggle ${isCategoryMenuOpen ? "open" : ""}`}
                    onClick={() => setIsCategoryMenuOpen((prev) => !prev)}
                    aria-expanded={isCategoryMenuOpen}
                >
                    <span>Categories</span>
                    <span className="customer-home-section-icon">{isCategoryMenuOpen ? "-" : "+"}</span>
                </button>

                {isCategoryMenuOpen && (
                    <ul className="sidebar-menu-category-list customer-home-category-list">
                        {categories.map((category) => {
                            const isActive = selectedCategory === category.key;

                            return (
                                <li className="sidebar-menu-category" key={category.key}>
                                    <button
                                        type="button"
                                        className={`sidebar-accordion-menu sidebar-category-btn ${isActive ? "active" : ""}`}
                                        onClick={() => onSelectCategory(category.key)}
                                    >
                                        <div className="menu-title-flex">
                                            <img
                                                src={iconMap[category.key] || watch}
                                                alt={category.label}
                                                width={20}
                                                height={20}
                                                className="menu-title-img"
                                            />
                                            <p className="menu-title">{category.label}</p>
                                        </div>
                                        <data value={category.count} className="stock" title="Available Products">
                                            {category.count}
                                        </data>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>

            <div className="product-showcase customer-home-best-sellers">
                <button
                    type="button"
                    className={`customer-home-section-toggle ${isBestSellerMenuOpen ? "open" : ""}`}
                    onClick={() => setIsBestSellerMenuOpen((prev) => !prev)}
                    aria-expanded={isBestSellerMenuOpen}
                >
                    <span>Best Sellers</span>
                    <span className="customer-home-section-icon">{isBestSellerMenuOpen ? "-" : "+"}</span>
                </button>

                {isBestSellerMenuOpen && (
                    <div className="showcase-wrapper">
                        <div className="showcase-container">
                            {loading && <p>Loading products...</p>}
                            {!loading && bestSellerProducts.length === 0 && <p>No products yet</p>}
                            {!loading &&
                                bestSellerProducts.map((product) => (
                                    <div className="showcase" key={product._id}>
                                        <div className="showcase-img-box">
                                            <img
                                                src={product.productimg?.[0] || "https://via.placeholder.com/75"}
                                                alt={product.productname}
                                                className="showcase-img"
                                                width={75}
                                                height={75}
                                            />
                                        </div>
                                        <div className="showcase-content">
                                            <h4 className="showcase-title">{product.productname}</h4>
                                            <div className="showcase-rating">
                                                <ion-icon name="star" />
                                                <ion-icon name="star" />
                                                <ion-icon name="star" />
                                                <ion-icon name="star-outline" />
                                                <ion-icon name="star-outline" />
                                            </div>
                                            <div className="price-box">
                                                {product.discount && <del>Rs {product.price}</del>}
                                                <p className="price">Rs {product.discount || product.price}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                )}
            </div>
        </aside>
    );
};

export default Sidebar;
