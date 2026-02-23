import React from "react";
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
    electronics: watch
};

const Category = ({ categoryStats = [], selectedCategory = "all", onSelectCategory = () => {} }) => {
    const totalProducts = categoryStats.reduce((sum, item) => sum + Number(item.count || 0), 0);
    const list = [{ key: "all", label: "All Products", count: totalProducts }, ...categoryStats];

    return (
        <div className="category">
            <div className="container">
                <div className="category-item-container has-scrollbar">
                    {list.map((item) => {
                        const isActive = selectedCategory === item.key;
                        return (
                            <div className="category-item" key={item.key}>
                                <div className="category-img-box">
                                    <img src={iconMap[item.key] || watch} alt={item.label} width={30} />
                                </div>
                                <div className="category-content-box">
                                    <div className="category-content-flex">
                                        <h3 className="category-item-title">{item.label}</h3>
                                        <p className="category-item-amount">({item.count})</p>
                                    </div>
                                    <button
                                        type="button"
                                        className={`category-btn category-filter-btn ${isActive ? "active" : ""}`}
                                        onClick={() => onSelectCategory(item.key)}
                                    >
                                        {isActive ? "Selected" : "Show all"}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Category;
