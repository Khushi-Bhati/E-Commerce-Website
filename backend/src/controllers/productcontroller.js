import { Productmodel } from "../models/Productmodel.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const addproductcontroller = async (req, res) => {
    try {
        const { productname, category, price, discount, description, stock, brand, sellerId } = req.body;

        const requiredFields = [productname, category, price, stock, brand];
        if (requiredFields.some((field) => !field || field.toString().trim() === "")) {
            return res.status(400).send({
                message: "All required fields must be provided (productname, category, price, stock, brand)",
                status: "notsuccess"
            });
        }

        const existingproduct = await Productmodel.findOne({ productname, sellerID: sellerId });
        if (existingproduct) {
            return res.status(409).send({
                message: "You already have a product with this name",
                status: "notsuccess"
            });
        }

        const productimgpath = req.files?.productimg?.map((file) => file.path) || [];
        if (productimgpath.length === 0) {
            return res.status(400).send({
                message: "At least one product image is required",
                status: "notsuccess"
            });
        }

        const uploadproductimgs = await Promise.all(productimgpath.map((p) => uploadOnCloudinary(p)));
        const productimgsurl = uploadproductimgs.filter(Boolean).map((img) => img.url);

        if (productimgsurl.length === 0) {
            return res.status(500).send({
                message: "Failed to upload product images",
                status: "failed"
            });
        }

        const product = await Productmodel.create({
            productname,
            category,
            price,
            discount,
            description,
            stock,
            brand,
            sellerID: sellerId || null,
            productimg: productimgsurl
        });

        return res.status(201).send({
            message: "Product added successfully",
            status: "success",
            product
        });

    } catch (error) {
        return res.status(500).send({
            message: `product controller error is ${error.message}`,
            status: "failed"
        });
    }
};

const getproductscontroller = async (req, res) => {
    try {
        const { keyword, category, minPrice, maxPrice, sort, sellerId, isHotOffer } = req.query;
        const filter = {};

        if (keyword) {
            filter.$or = [
                { productname: { $regex: keyword, $options: "i" } },
                { brand: { $regex: keyword, $options: "i" } },
                { description: { $regex: keyword, $options: "i" } }
            ];
        }
        if (category) {
            const baseCategory = category.replace(/s$/i, '').replace(/'/g, ''); // mens -> men
            filter.category = { $regex: `\\b${baseCategory}`, $options: "i" };
        }
        if (sellerId) filter.sellerID = sellerId;

        if (isHotOffer === 'true') {
            filter.$expr = {
                $and: [
                    { $gt: [{ $toDouble: "$discount" }, 0] },
                    { $lt: [{ $toDouble: "$discount" }, { $toDouble: "$price" }] }
                ]
            };
        }

        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = Number(minPrice);
            if (maxPrice) filter.price.$lte = Number(maxPrice);
        }

        let sortOption = { createdAt: -1 };
        if (sort === "price_asc") sortOption = { price: 1 };
        if (sort === "price_desc") sortOption = { price: -1 };
        if (sort === "newest") sortOption = { createdAt: -1 };

        const products = await Productmodel.find(filter).sort(sortOption);

        return res.status(200).send({
            message: "Products fetched successfully",
            status: "success",
            products
        });
    } catch (error) {
        return res.status(500).send({
            message: `get products error is ${error.message}`,
            status: "failed"
        });
    }
};

// NEW: Get a single product by ID
const getProductByIdController = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).send({
                message: "Product ID is required",
                status: "notsuccess"
            });
        }

        const product = await Productmodel.findById(id).populate("sellerID", "name email");
        if (!product) {
            return res.status(404).send({
                message: "Product not found",
                status: "notsuccess"
            });
        }

        return res.status(200).send({
            message: "Product fetched successfully",
            status: "success",
            product
        });
    } catch (error) {
        return res.status(500).send({
            message: `get product error is ${error.message}`,
            status: "failed"
        });
    }
};

const updateproductcontroller = async (req, res) => {
    try {
        const { id } = req.params;
        const { productname, category, price, discount, description, stock, brand } = req.body;

        const existingProduct = await Productmodel.findById(id);
        if (!existingProduct) {
            return res.status(404).send({
                message: "Product not found",
                status: "notsuccess"
            });
        }

        if (productname && productname !== existingProduct.productname) {
            const duplicate = await Productmodel.findOne({
                productname,
                sellerID: existingProduct.sellerID,
                _id: { $ne: id }
            });
            if (duplicate) {
                return res.status(409).send({
                    message: "You already have a product with this name",
                    status: "notsuccess"
                });
            }
        }

        const payload = {
            productname: productname ?? existingProduct.productname,
            category: category ?? existingProduct.category,
            price: price ?? existingProduct.price,
            discount: discount ?? existingProduct.discount,
            description: description ?? existingProduct.description,
            stock: stock ?? existingProduct.stock,
            brand: brand ?? existingProduct.brand
        };

        const productimgpath = req.files?.productimg?.map((file) => file.path) || [];
        if (productimgpath.length > 0) {
            const uploadedImages = await Promise.all(productimgpath.map((p) => uploadOnCloudinary(p)));
            const productimg = uploadedImages.filter(Boolean).map((img) => img.url);

            if (productimg.length === 0) {
                return res.status(500).send({
                    message: "Failed to upload product images",
                    status: "failed"
                });
            }

            payload.productimg = productimg;
        }

        const requiredFields = [payload.productname, payload.category, payload.price, payload.stock, payload.brand];
        if (requiredFields.some((field) => !field || field.toString().trim() === "")) {
            return res.status(400).send({
                message: "All required fields must be provided",
                status: "notsuccess"
            });
        }

        const product = await Productmodel.findByIdAndUpdate(id, payload, {
            new: true,
            runValidators: true
        });

        return res.status(200).send({
            message: "Product updated successfully",
            status: "success",
            product
        });
    } catch (error) {
        return res.status(500).send({
            message: `update product error is ${error.message}`,
            status: "failed"
        });
    }
};

const deleteproductcontroller = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedProduct = await Productmodel.findByIdAndDelete(id);
        if (!deletedProduct) {
            return res.status(404).send({
                message: "Product not found",
                status: "notsuccess"
            });
        }

        return res.status(200).send({
            message: "Product deleted successfully",
            status: "success"
        });
    } catch (error) {
        return res.status(500).send({
            message: `delete product error is ${error.message}`,
            status: "failed"
        });
    }
};

export {
    addproductcontroller,
    getproductscontroller,
    getProductByIdController,
    updateproductcontroller,
    deleteproductcontroller
};
