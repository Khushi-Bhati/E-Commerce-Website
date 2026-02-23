import React, { useState } from "react";
import Rightside from "./Rightside";
import Sidebar from "./Sidebar";
import "./../styles/Seller/Addproduct.css";
import API from '../../config/api.js';
import Swal from "sweetalert2";

const CATEGORIES = [
    { value: "", label: "Select a category..." },
    { value: "electronics", label: "📱 Electronics" },
    { value: "men", label: "👔 Men's Fashion" },
    { value: "women", label: "👗 Women's Fashion" },
    { value: "jewelry", label: "💍 Jewelry" },
    { value: "perfume", label: "🌸 Perfume" },
    { value: "fashion", label: "✨ Fashion (General)" },
    { value: "home living", label: "🏠 Home & Living" },
    { value: "beauty", label: "🌸 Beauty" },
    { value: "sports", label: "⚽ Sports" },
];

const Addproduct = () => {
    const [formValue, setFormValue] = useState({
        productname: "",
        brand: "",
        category: "",
        price: "",
        discount: "",
        stock: "",
        description: "",
    });
    const [productimgs, setproductimgs] = useState([]);
    const [productimgsurl, setproductimgsurl] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormValue(prev => ({ ...prev, [name]: value }));
    };

    const handelFileChange = (e) => {
        const imgfile = Array.from(e.target.files || []).slice(0, 4);
        setproductimgs(imgfile);
        setproductimgsurl(imgfile.map(file => URL.createObjectURL(file)));
    };

    const removeImage = (idx) => {
        const newImgs = productimgs.filter((_, i) => i !== idx);
        const newUrls = productimgsurl.filter((_, i) => i !== idx);
        setproductimgs(newImgs);
        setproductimgsurl(newUrls);
    };

    const handleReset = () => {
        setFormValue({ productname: "", brand: "", category: "", price: "", discount: "", stock: "", description: "" });
        setproductimgs([]);
        setproductimgsurl([]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            const formdata = new FormData();
            formdata.append("productname", formValue.productname);
            formdata.append("brand", formValue.brand);
            formdata.append("category", formValue.category);
            formdata.append("price", formValue.price);
            formdata.append("discount", formValue.discount);
            formdata.append("stock", formValue.stock);
            formdata.append("description", formValue.description);
            formdata.append("sellerId", localStorage.getItem("userID") || "");
            productimgs.forEach(file => formdata.append("productimg", file));

            const createresponse = await API.post("/product/addproduct", formdata);

            if (createresponse.data.status === "success") {
                Swal.fire({ title: createresponse.data.message, icon: "success", draggable: true });
                handleReset();
            } else {
                Swal.fire({ icon: "error", title: createresponse.data.message });
            }
        } catch (error) {
            console.log("add product error", error);
            Swal.fire({ icon: "error", title: "Failed to add product" });
        } finally {
            setSubmitting(false);
        }
    };

    const completionPercent = () => {
        const fields = ['productname', 'brand', 'category', 'price', 'stock', 'description'];
        const filled = fields.filter(f => formValue[f]).length;
        return Math.round((filled / fields.length) * 100);
    };

    return (
        <div className="main-wrapper">
            <Sidebar />

            <main className="ap-main">
                {/* ── Page Header ── */}
                <div className="ap-header">
                    <div className="ap-header-left">
                        <div className="ap-header-icon">
                            <span className="material-symbols-sharp">add_box</span>
                        </div>
                        <div>
                            <h1>Add New Product</h1>
                            <p className="ap-subtitle">Fill in the details below to list your product</p>
                        </div>
                    </div>
                    <div className="ap-header-right">
                        <div className="ap-completion">
                            <span className="ap-completion-label">Form completion</span>
                            <div className="ap-completion-bar">
                                <div
                                    className="ap-completion-fill"
                                    style={{ width: `${completionPercent()}%` }}
                                />
                            </div>
                            <span className="ap-completion-pct">{completionPercent()}%</span>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} noValidate>
                    <div className="ap-layout">

                        {/* ── LEFT: Main Form Card ── */}
                        <div className="ap-left">

                            {/* Basic Info Section */}
                            <div className="ap-card">
                                <div className="ap-card-header">
                                    <div className="ap-section-icon ap-icon-blue">
                                        <span className="material-symbols-sharp">info</span>
                                    </div>
                                    <div>
                                        <h2>Basic Information</h2>
                                        <p>Product name, brand and category</p>
                                    </div>
                                </div>
                                <div className="ap-card-body">
                                    <div className="ap-grid-2">
                                        <div className="ap-field ap-span-2">
                                            <label htmlFor="productname">
                                                Product Name <span className="ap-required">*</span>
                                            </label>
                                            <div className="ap-input-wrap">
                                                <span className="material-symbols-sharp ap-input-icon">inventory_2</span>
                                                <input
                                                    id="productname"
                                                    type="text"
                                                    name="productname"
                                                    placeholder="e.g., Sony WH-1000XM5 Headphones"
                                                    value={formValue.productname}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="ap-field">
                                            <label htmlFor="brand">
                                                Brand <span className="ap-required">*</span>
                                            </label>
                                            <div className="ap-input-wrap">
                                                <span className="material-symbols-sharp ap-input-icon">verified</span>
                                                <input
                                                    id="brand"
                                                    type="text"
                                                    name="brand"
                                                    placeholder="e.g., Sony"
                                                    value={formValue.brand}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="ap-field">
                                            <label htmlFor="category">
                                                Category <span className="ap-required">*</span>
                                            </label>
                                            <div className="ap-input-wrap ap-select-wrap">
                                                <span className="material-symbols-sharp ap-input-icon">category</span>
                                                <select
                                                    id="category"
                                                    name="category"
                                                    value={formValue.category}
                                                    onChange={handleChange}
                                                    required
                                                >
                                                    {CATEGORIES.map(c => (
                                                        <option key={c.value} value={c.value}>{c.label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Pricing & Stock Section */}
                            <div className="ap-card">
                                <div className="ap-card-header">
                                    <div className="ap-section-icon ap-icon-green">
                                        <span className="material-symbols-sharp">payments</span>
                                    </div>
                                    <div>
                                        <h2>Pricing & Stock</h2>
                                        <p>Set your product price and inventory</p>
                                    </div>
                                </div>
                                <div className="ap-card-body">
                                    <div className="ap-grid-3">
                                        <div className="ap-field">
                                            <label htmlFor="price">
                                                Original Price (Rs) <span className="ap-required">*</span>
                                            </label>
                                            <div className="ap-input-wrap">
                                                <span className="ap-prefix">Rs</span>
                                                <input
                                                    id="price"
                                                    type="number"
                                                    name="price"
                                                    placeholder="0"
                                                    value={formValue.price}
                                                    onChange={handleChange}
                                                    min="0"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="ap-field">
                                            <label htmlFor="discount">
                                                Sale Price (Rs)
                                                <span className="ap-badge-optional">Optional</span>
                                            </label>
                                            <div className="ap-input-wrap">
                                                <span className="ap-prefix ap-prefix-sale">Rs</span>
                                                <input
                                                    id="discount"
                                                    type="number"
                                                    name="discount"
                                                    placeholder="0"
                                                    value={formValue.discount}
                                                    onChange={handleChange}
                                                    min="0"
                                                />
                                            </div>
                                            {formValue.price && formValue.discount && Number(formValue.discount) < Number(formValue.price) && (
                                                <span className="ap-discount-hint">
                                                    🎉 {Math.round(((formValue.price - formValue.discount) / formValue.price) * 100)}% off
                                                </span>
                                            )}
                                        </div>

                                        <div className="ap-field">
                                            <label htmlFor="stock">
                                                Stock Quantity <span className="ap-required">*</span>
                                            </label>
                                            <div className="ap-input-wrap">
                                                <span className="material-symbols-sharp ap-input-icon">warehouse</span>
                                                <input
                                                    id="stock"
                                                    type="number"
                                                    name="stock"
                                                    placeholder="0"
                                                    value={formValue.stock}
                                                    onChange={handleChange}
                                                    min="0"
                                                    required
                                                />
                                            </div>
                                            {formValue.stock && (
                                                <span className={`ap-stock-hint ${Number(formValue.stock) > 10 ? 'good' : 'low'}`}>
                                                    {Number(formValue.stock) > 10 ? '✓ Good stock level' : '⚠ Low stock'}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Description Section */}
                            <div className="ap-card">
                                <div className="ap-card-header">
                                    <div className="ap-section-icon ap-icon-purple">
                                        <span className="material-symbols-sharp">description</span>
                                    </div>
                                    <div>
                                        <h2>Product Description</h2>
                                        <p>Help customers understand your product</p>
                                    </div>
                                </div>
                                <div className="ap-card-body">
                                    <div className="ap-field">
                                        <label htmlFor="description">Description</label>
                                        <textarea
                                            id="description"
                                            name="description"
                                            placeholder="Write a detailed description of your product — features, specifications, use cases..."
                                            value={formValue.description}
                                            onChange={handleChange}
                                            rows={5}
                                        />
                                        <div className="ap-char-count">
                                            {formValue.description.length} characters
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ── RIGHT: Image Upload + Summary ── */}
                        <div className="ap-right">

                            {/* Image Upload Card */}
                            <div className="ap-card ap-img-card">
                                <div className="ap-card-header">
                                    <div className="ap-section-icon ap-icon-amber">
                                        <span className="material-symbols-sharp">photo_library</span>
                                    </div>
                                    <div>
                                        <h2>Product Images</h2>
                                        <p>Upload up to 4 images</p>
                                    </div>
                                </div>
                                <div className="ap-card-body">
                                    {/* Upload zone */}
                                    <label className="ap-upload-zone" htmlFor="img-upload">
                                        <input
                                            id="img-upload"
                                            type="file"
                                            multiple
                                            onChange={handelFileChange}
                                            accept="image/*"
                                        />
                                        <div className="ap-upload-icon">
                                            <span className="material-symbols-sharp">cloud_upload</span>
                                        </div>
                                        <p className="ap-upload-title">Drop images here or <span>browse</span></p>
                                        <p className="ap-upload-sub">PNG, JPG, WEBP up to 5MB — max 4 images</p>
                                    </label>

                                    {/* Image previews */}
                                    {productimgsurl.length > 0 && (
                                        <div className="ap-img-preview-grid">
                                            {productimgsurl.map((url, idx) => (
                                                <div className="ap-img-preview-item" key={idx}>
                                                    <img src={url} alt={`Preview ${idx + 1}`} />
                                                    <button
                                                        type="button"
                                                        className="ap-img-remove"
                                                        onClick={() => removeImage(idx)}
                                                        aria-label="Remove image"
                                                    >
                                                        <span className="material-symbols-sharp">close</span>
                                                    </button>
                                                    {idx === 0 && <span className="ap-img-primary-badge">Main</span>}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="ap-img-counter">
                                        <div className="ap-img-counter-dots">
                                            {[0, 1, 2, 3].map(i => (
                                                <div
                                                    key={i}
                                                    className={`ap-img-dot ${i < productimgsurl.length ? 'filled' : ''}`}
                                                />
                                            ))}
                                        </div>
                                        <span>{productimgsurl.length} / 4 images added</span>
                                    </div>
                                </div>
                            </div>

                            {/* Product Summary Preview */}
                            <div className="ap-card ap-summary-card">
                                <div className="ap-card-header">
                                    <div className="ap-section-icon ap-icon-dark">
                                        <span className="material-symbols-sharp">preview</span>
                                    </div>
                                    <div>
                                        <h2>Quick Preview</h2>
                                        <p>How your product will appear</p>
                                    </div>
                                </div>
                                <div className="ap-card-body">
                                    <div className="ap-preview-card">
                                        <div className="ap-preview-img">
                                            {productimgsurl[0]
                                                ? <img src={productimgsurl[0]} alt="preview" />
                                                : (
                                                    <div className="ap-preview-placeholder">
                                                        <span className="material-symbols-sharp">image</span>
                                                    </div>
                                                )
                                            }
                                        </div>
                                        <div className="ap-preview-info">
                                            <p className="ap-preview-name">{formValue.productname || 'Product Name'}</p>
                                            <p className="ap-preview-brand">{formValue.brand || 'Brand'}</p>
                                            {formValue.category && (
                                                <span className="ap-preview-cat">{formValue.category}</span>
                                            )}
                                            <div className="ap-preview-price">
                                                {formValue.discount && (
                                                    <span className="ap-preview-sale">Rs {formValue.discount}</span>
                                                )}
                                                {formValue.price && (
                                                    <span className={formValue.discount ? 'ap-preview-orig-struck' : 'ap-preview-sale'}>
                                                        Rs {formValue.price}
                                                    </span>
                                                )}
                                            </div>
                                            {formValue.stock && (
                                                <span className={`ap-preview-stock ${Number(formValue.stock) > 0 ? 'in' : 'out'}`}>
                                                    {Number(formValue.stock) > 0 ? `In Stock (${formValue.stock})` : 'Out of Stock'}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="ap-actions">
                                <button
                                    type="button"
                                    className="ap-btn-reset"
                                    onClick={handleReset}
                                    disabled={submitting}
                                >
                                    <span className="material-symbols-sharp">restart_alt</span>
                                    Reset Form
                                </button>
                                <button
                                    type="submit"
                                    className="ap-btn-submit"
                                    disabled={submitting}
                                >
                                    {submitting ? (
                                        <>
                                            <span className="ap-btn-spinner" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-sharp">save</span>
                                            Save Product
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </main>

            <Rightside />
        </div>
    );
};

export default Addproduct;
