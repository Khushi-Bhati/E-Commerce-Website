import React, { useCallback, useEffect, useMemo, useState } from "react";
import API from '../../config/api.js';
import Sidebar from "./Sidebar";
import Rightside from "./Rightside";
import "./../styles/Seller/Reviews.css";

const formatDate = (value) => {
    if (!value) {
        return "-";
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return "-";
    }
    return date.toLocaleDateString();
};

const getStarText = (rating) => {
    const safeRating = Math.max(0, Math.min(5, Number(rating || 0)));
    const fullStars = "★".repeat(Math.floor(safeRating));
    const emptyStars = "☆".repeat(5 - Math.floor(safeRating));
    return `${fullStars}${emptyStars}`;
};

const Reviews = () => {
    const sellerId = localStorage.getItem("userID") || "";

    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchText, setSearchText] = useState("");
    const [ratingFilter, setRatingFilter] = useState("all");

    const getReviews = useCallback(async () => {
        if (!sellerId) {
            setReviews([]);
            setError("Seller session not found. Please login again.");
            setLoading(false);
            return;
        }

        setLoading(true);
        setError("");
        try {
            const response = await API.get(`/review/seller/${sellerId}`);
            if (response.data.status === "success") {
                setReviews(response.data.reviews || []);
            } else {
                setReviews([]);
                setError(response.data.message || "Failed to load reviews.");
            }
        } catch (requestError) {
            setReviews([]);
            setError(requestError?.response?.data?.message || "Failed to load reviews. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [sellerId]);

    useEffect(() => {
        getReviews();
    }, [getReviews]);

    const filteredReviews = useMemo(() => {
        const keyword = searchText.trim().toLowerCase();

        return reviews.filter((review) => {
            const reviewRating = Number(review.rating || 0);
            if (ratingFilter !== "all" && reviewRating !== Number(ratingFilter)) {
                return false;
            }

            if (!keyword) {
                return true;
            }

            const reviewerName = (review?.userId?.name || "").toLowerCase();
            const reviewerEmail = (review?.userId?.email || "").toLowerCase();
            const productName = (review?.productId?.productname || "").toLowerCase();
            const comment = (review?.comment || "").toLowerCase();

            return (
                reviewerName.includes(keyword) ||
                reviewerEmail.includes(keyword) ||
                productName.includes(keyword) ||
                comment.includes(keyword)
            );
        });
    }, [reviews, searchText, ratingFilter]);

    const averageRating =
        reviews.length > 0
            ? reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviews.length
            : 0;

    const fiveStarCount = reviews.filter((review) => Number(review.rating || 0) === 5).length;
    const lowRatingCount = reviews.filter((review) => Number(review.rating || 0) <= 2).length;

    return (
        <div className="main-wrapper">
            <Sidebar />
            <main className="reviews-main">
                <div className="reviews-header">
                    <h1>Reviews</h1>
                    <button type="button" className="reviews-refresh-btn" onClick={getReviews} disabled={loading}>
                        {loading ? "Refreshing..." : "Refresh"}
                    </button>
                </div>

                <div className="reviews-summary-grid">
                    <div className="reviews-summary-card">
                        <p>Total Reviews</p>
                        <h2>{reviews.length}</h2>
                    </div>
                    <div className="reviews-summary-card">
                        <p>Average Rating</p>
                        <h2>{averageRating.toFixed(1)} / 5</h2>
                    </div>
                    <div className="reviews-summary-card">
                        <p>5-Star Reviews</p>
                        <h2>{fiveStarCount}</h2>
                    </div>
                    <div className="reviews-summary-card">
                        <p>Low Ratings (1-2)</p>
                        <h2>{lowRatingCount}</h2>
                    </div>
                </div>

                <div className="reviews-filters">
                    <div className="reviews-search-wrap">
                        <label htmlFor="reviews-search">Search</label>
                        <input
                            id="reviews-search"
                            type="text"
                            value={searchText}
                            onChange={(event) => setSearchText(event.target.value)}
                            placeholder="Product, customer, comment"
                        />
                    </div>

                    <div className="reviews-rating-wrap">
                        <label htmlFor="reviews-rating-filter">Rating</label>
                        <select
                            id="reviews-rating-filter"
                            value={ratingFilter}
                            onChange={(event) => setRatingFilter(event.target.value)}
                        >
                            <option value="all">All ratings</option>
                            <option value="5">5 stars</option>
                            <option value="4">4 stars</option>
                            <option value="3">3 stars</option>
                            <option value="2">2 stars</option>
                            <option value="1">1 star</option>
                        </select>
                    </div>
                </div>

                {loading && <div className="reviews-state-card">Loading reviews...</div>}

                {!loading && error && (
                    <div className="reviews-state-card reviews-error-card">
                        <p>{error}</p>
                        <button type="button" className="reviews-retry-btn" onClick={getReviews}>
                            Retry
                        </button>
                    </div>
                )}

                {!loading && !error && reviews.length === 0 && (
                    <div className="reviews-state-card">No reviews found for this seller.</div>
                )}

                {!loading && !error && reviews.length > 0 && filteredReviews.length === 0 && (
                    <div className="reviews-state-card">No reviews matched your filters.</div>
                )}

                {!loading && !error && filteredReviews.length > 0 && (
                    <div className="reviews-table-wrap">
                        <table className="reviews-table">
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Customer</th>
                                    <th>Rating</th>
                                    <th>Comment</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredReviews.map((review) => (
                                    <tr key={review._id}>
                                        <td>{review?.productId?.productname || "-"}</td>
                                        <td>
                                            <p>{review?.userId?.name || "Unknown customer"}</p>
                                            <small>{review?.userId?.email || "-"}</small>
                                        </td>
                                        <td>
                                            <span className="reviews-stars">{getStarText(review.rating)}</span>
                                            <small>{Number(review.rating || 0).toFixed(1)}</small>
                                        </td>
                                        <td>{review.comment || "-"}</td>
                                        <td>{formatDate(review.createdAt)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>
            <Rightside />
        </div>
    );
};

export default Reviews;
