import React, { useEffect, useState } from "react";
import "./../styles/Seller/Productlist.css";
import Sidebar from "./Sidebar";
import Rightside from "./Rightside";
import API from '../../config/api.js';
import Swal from "sweetalert2";

const Productlist = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingProduct, setEditingProduct] = useState(null);
    const [editForm, setEditForm] = useState({
        productname: "",
        brand: "",
        category: "",
        price: "",
        discount: "",
        stock: "",
        description: ""
    });
    const [editImages, setEditImages] = useState([]);
    const [editImageUrls, setEditImageUrls] = useState([]);

    const getProducts = async () => {
        try {
            const response = await API.get("/product/getproducts");
            if (response.data.status === "success") {
                setProducts(response.data.products || []);
            }
        } catch (error) {
            console.log("get products error", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getProducts();
    }, []);

    const startEdit = (product) => {
        setEditingProduct(product._id);
        setEditForm({
            productname: product.productname || "",
            brand: product.brand || "",
            category: product.category || "",
            price: product.price || "",
            discount: product.discount || "",
            stock: product.stock || "",
            description: product.description || ""
        });
        setEditImages([]);
        setEditImageUrls(product.productimg || []);
    };

    const cancelEdit = () => {
        setEditingProduct(null);
        setEditForm({
            productname: "",
            brand: "",
            category: "",
            price: "",
            discount: "",
            stock: "",
            description: ""
        });
        setEditImages([]);
        setEditImageUrls([]);
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleEditImages = (e) => {
        const files = Array.from(e.target.files || []).slice(0, 4);
        setEditImages(files);
        if (files.length > 0) {
            setEditImageUrls(files.map((file) => URL.createObjectURL(file)));
        }
    };

    const saveEdit = async () => {
        try {
            const formdata = new FormData();
            formdata.append("productname", editForm.productname);
            formdata.append("brand", editForm.brand);
            formdata.append("category", editForm.category);
            formdata.append("price", editForm.price);
            formdata.append("discount", editForm.discount);
            formdata.append("stock", editForm.stock);
            formdata.append("description", editForm.description);

            editImages.forEach((file) => {
                formdata.append("productimg", file);
            });

            const response = await API.put(`/product/updateproduct/${editingProduct}`, formdata);
            if (response.data.status === "success") {
                Swal.fire({
                    icon: "success",
                    title: response.data.message
                });
                await getProducts();
                cancelEdit();
            } else {
                Swal.fire({
                    icon: "error",
                    title: response.data.message || "Update failed"
                });
            }
        } catch (error) {
            console.log("update product error", error);
            Swal.fire({
                icon: "error",
                title: "Failed to update product"
            });
        }
    };

    const deleteProduct = async (id) => {
        const confirmResult = await Swal.fire({
            title: "Delete this product?",
            text: "This action cannot be undone.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete"
        });

        if (!confirmResult.isConfirmed) {
            return;
        }

        try {
            const response = await API.delete(`/product/deleteproduct/${id}`);
            if (response.data.status === "success") {
                Swal.fire({
                    icon: "success",
                    title: response.data.message
                });
                setProducts((prev) => prev.filter((item) => item._id !== id));
                if (editingProduct === id) {
                    cancelEdit();
                }
            } else {
                Swal.fire({
                    icon: "error",
                    title: response.data.message || "Delete failed"
                });
            }
        } catch (error) {
            console.log("delete product error", error);
            Swal.fire({
                icon: "error",
                title: "Failed to delete product"
            });
        }
    };

    return (
        <>
            <div className="main-wrapper">
                <Sidebar />
                <div className="product-container">
                    <h2>Product List</h2>

                    {editingProduct && (
                        <div className="edit-product-card">
                            <h3 className="edit-title">Edit Product</h3>
                            <div className="edit-grid">
                                <input name="productname" value={editForm.productname} onChange={handleEditChange} placeholder="Product name" />
                                <input name="brand" value={editForm.brand} onChange={handleEditChange} placeholder="Brand" />
                                <select name="category" value={editForm.category} onChange={handleEditChange}>
                                    <option value="electronics">Electronics</option>
                                    <option value="men">Men's</option>
                                    <option value="women">Women's</option>
                                    <option value="jewelry">Jewelry</option>
                                    <option value="perfume">Perfume</option>
                                    <option value="fashion">Fashion (General)</option>
                                    <option value="home living">Home &amp; Living</option>
                                    <option value="sports">Sports</option>
                                </select>
                                <input name="price" value={editForm.price} onChange={handleEditChange} placeholder="Price" />
                                <input name="discount" value={editForm.discount} onChange={handleEditChange} placeholder="Discount price" />
                                <input name="stock" value={editForm.stock} onChange={handleEditChange} placeholder="Stock" />
                                <textarea name="description" value={editForm.description} onChange={handleEditChange} placeholder="Description" className="edit-full-row" />
                                <input type="file" multiple accept="image/*" onChange={handleEditImages} className="edit-full-row" />
                                <div className="edit-preview-list">
                                    {editImageUrls.map((img, idx) => (
                                        <img key={idx} src={img} alt="preview" className="edit-preview-img" />
                                    ))}
                                </div>
                            </div>
                            <div className="action-btns edit-actions">
                                <button className="edit-btn" onClick={saveEdit}>Save</button>
                                <button className="delete-btn" onClick={cancelEdit}>Cancel</button>
                            </div>
                        </div>
                    )}

                    <table>
                        <thead>
                            <tr>
                                <th>Image</th>
                                <th>Product Name</th>
                                <th>Detail</th>
                                <th>Amount</th>
                                <th>Stock</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading && (
                                <tr>
                                    <td colSpan="6">Loading products...</td>
                                </tr>
                            )}
                            {!loading && products.length === 0 && (
                                <tr>
                                    <td colSpan="6">No products found</td>
                                </tr>
                            )}
                            {!loading && products.map((product) => (
                                <tr key={product._id}>
                                    <td>
                                        {product.productimg?.[0] ? <img src={product.productimg[0]} alt={product.productname} /> : "NA"}
                                    </td>
                                    <td>{product.productname}</td>
                                    <td>{product.description || product.category}</td>
                                    <td>Rs {product.discount || product.price}</td>
                                    <td className={`stock ${Number(product.stock) > 0 ? "in-stock" : "out-stock"}`}>
                                        {Number(product.stock) > 0 ? "In Stock" : "Out of Stock"}
                                    </td>
                                    <td>
                                        <div className="action-btns">
                                            <button className="edit-btn" onClick={() => startEdit(product)}>Edit</button>
                                            <button className="delete-btn" onClick={() => deleteProduct(product._id)}>Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <Rightside />
            </div>
        </>
    );
};

export default Productlist;
