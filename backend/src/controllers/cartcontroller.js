import mongoose from "mongoose";
import { Cartmodel } from "../models/Cartmodel.js";
import { Productmodel } from "../models/Productmodel.js";
import { Usermodel } from "../models/Usermodel.js";

const toNumber = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
};
const normalizeId = (value) => (value || "").toString().replace(/"/g, "").trim();

const buildCartResponse = async (userId) => {
    const cart = await Cartmodel.findOne({ userId }).populate("items.productId");
    if (!cart) {
        return {
            cart: { userId, items: [] },
            totals: { itemCount: 0, subTotal: 0 }
        };
    }

    let itemCount = 0;
    let subTotal = 0;

    const normalizedItems = cart.items
        .filter((item) => item.productId)
        .map((item) => {
            const product = item.productId;
            const unitPrice = toNumber(product.discount || product.price);
            itemCount += item.quantity;
            subTotal += unitPrice * item.quantity;

            return {
                productId: product._id,
                quantity: item.quantity,
                product
            };
        });

    return {
        cart: {
            _id: cart._id,
            userId: cart.userId,
            items: normalizedItems,
            createdAt: cart.createdAt,
            updatedAt: cart.updatedAt
        },
        totals: {
            itemCount,
            subTotal
        }
    };
};

const addToCartController = async (req, res) => {
    try {
        const userId = normalizeId(req.body.userId);
        const productId = normalizeId(req.body.productId);
        const { quantity } = req.body;

        if (!userId || !productId) {
            return res.status(400).send({
                message: "userId and productId are required",
                status: "notsuccess"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).send({
                message: "Invalid userId or productId",
                status: "notsuccess"
            });
        }

        const user = await Usermodel.findById(userId);
        if (!user) {
            return res.status(404).send({
                message: "User not found",
                status: "notsuccess"
            });
        }

        const product = await Productmodel.findById(productId);
        if (!product) {
            return res.status(404).send({
                message: "Product not found",
                status: "notsuccess"
            });
        }

        const qty = Math.max(1, toNumber(quantity) || 1);
        const productStock = Math.max(0, toNumber(product.stock));

        let cart = await Cartmodel.findOne({ userId });
        if (!cart) {
            cart = await Cartmodel.create({ userId, items: [] });
        }

        const existingItem = cart.items.find((item) => item.productId.toString() === productId);
        if (existingItem) {
            const nextQty = existingItem.quantity + qty;
            if (productStock > 0 && nextQty > productStock) {
                return res.status(400).send({
                    message: "Requested quantity exceeds stock",
                    status: "notsuccess"
                });
            }
            existingItem.quantity = nextQty;
        } else {
            if (productStock > 0 && qty > productStock) {
                return res.status(400).send({
                    message: "Requested quantity exceeds stock",
                    status: "notsuccess"
                });
            }
            cart.items.push({ productId, quantity: qty });
        }

        await cart.save();

        const payload = await buildCartResponse(userId);
        return res.status(200).send({
            message: "Product added to cart",
            status: "success",
            ...payload
        });
    } catch (error) {
        return res.status(500).send({
            message: `add to cart error: ${error}`,
            status: "failed"
        });
    }
};

const getCartController = async (req, res) => {
    try {
        const userId = normalizeId(req.params.userId);

        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).send({
                message: "Valid userId is required",
                status: "notsuccess"
            });
        }

        const payload = await buildCartResponse(userId);
        return res.status(200).send({
            message: "Cart fetched successfully",
            status: "success",
            ...payload
        });
    } catch (error) {
        return res.status(500).send({
            message: `get cart error: ${error}`,
            status: "failed"
        });
    }
};

const updateCartItemController = async (req, res) => {
    try {
        const userId = normalizeId(req.params.userId);
        const productId = normalizeId(req.params.productId);
        const { quantity } = req.body;

        if (!userId || !productId || !mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).send({
                message: "Valid userId and productId are required",
                status: "notsuccess"
            });
        }

        const qty = toNumber(quantity);
        if (!qty || qty < 1) {
            return res.status(400).send({
                message: "Quantity must be at least 1",
                status: "notsuccess"
            });
        }

        const product = await Productmodel.findById(productId);
        if (!product) {
            return res.status(404).send({
                message: "Product not found",
                status: "notsuccess"
            });
        }

        const productStock = Math.max(0, toNumber(product.stock));
        if (productStock > 0 && qty > productStock) {
            return res.status(400).send({
                message: "Requested quantity exceeds stock",
                status: "notsuccess"
            });
        }

        const cart = await Cartmodel.findOne({ userId });
        if (!cart) {
            return res.status(404).send({
                message: "Cart not found",
                status: "notsuccess"
            });
        }

        const item = cart.items.find((i) => i.productId.toString() === productId);
        if (!item) {
            return res.status(404).send({
                message: "Product not found in cart",
                status: "notsuccess"
            });
        }

        item.quantity = qty;
        await cart.save();

        const payload = await buildCartResponse(userId);
        return res.status(200).send({
            message: "Cart item updated",
            status: "success",
            ...payload
        });
    } catch (error) {
        return res.status(500).send({
            message: `update cart item error: ${error}`,
            status: "failed"
        });
    }
};

const removeCartItemController = async (req, res) => {
    try {
        const userId = normalizeId(req.params.userId);
        const productId = normalizeId(req.params.productId);

        if (!userId || !productId || !mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).send({
                message: "Valid userId and productId are required",
                status: "notsuccess"
            });
        }

        const cart = await Cartmodel.findOne({ userId });
        if (!cart) {
            return res.status(404).send({
                message: "Cart not found",
                status: "notsuccess"
            });
        }

        const beforeCount = cart.items.length;
        cart.items = cart.items.filter((item) => item.productId.toString() !== productId);
        if (cart.items.length === beforeCount) {
            return res.status(404).send({
                message: "Product not found in cart",
                status: "notsuccess"
            });
        }

        await cart.save();

        const payload = await buildCartResponse(userId);
        return res.status(200).send({
            message: "Cart item removed",
            status: "success",
            ...payload
        });
    } catch (error) {
        return res.status(500).send({
            message: `remove cart item error: ${error}`,
            status: "failed"
        });
    }
};

const clearCartController = async (req, res) => {
    try {
        const userId = normalizeId(req.params.userId);

        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).send({
                message: "Valid userId is required",
                status: "notsuccess"
            });
        }

        const cart = await Cartmodel.findOne({ userId });
        if (!cart) {
            return res.status(200).send({
                message: "Cart already empty",
                status: "success",
                cart: { userId, items: [] },
                totals: { itemCount: 0, subTotal: 0 }
            });
        }

        cart.items = [];
        await cart.save();

        return res.status(200).send({
            message: "Cart cleared",
            status: "success",
            cart: { _id: cart._id, userId: cart.userId, items: [] },
            totals: { itemCount: 0, subTotal: 0 }
        });
    } catch (error) {
        return res.status(500).send({
            message: `clear cart error: ${error}`,
            status: "failed"
        });
    }
};

export {
    addToCartController,
    getCartController,
    updateCartItemController,
    removeCartItemController,
    clearCartController
};
