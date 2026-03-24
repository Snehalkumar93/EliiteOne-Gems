import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import jewelleryModel from "../models/jewelleryModel.js";
import Stripe from "stripe";
import Razorpay from "razorpay";
import crypto from "crypto";
import { sendOrderConfirmation, sendPaymentFailure } from "../services/emailService.js";
import shiprocketService from "../services/shiprocketService.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_SECRET,
});

const currency = "inr";
const deliveryCharge = 50;
const frontend_URL = process.env.CLIENT_URL;

// Unified order creation logic
const createOrder = async (req, res) => {
    let newOrder;
    try {
        const { userId, items, amount, discount, address, paymentMethod, paymentGateway } = req.body;

        const cancelTimeMinutes = Math.max(1, Number(process.env.CANCEL_TIME_MINUTES) || 30);
        newOrder = new orderModel({
            userId,
            items,
            amount,
            discount: discount || 0,
            address,
            paymentMethod,
            paymentGateway,
            payment: false,
            paymentStatus: "Pending",
            cancelAllowedUntil: new Date(Date.now() + cancelTimeMinutes * 60 * 1000)
        });

        const savedOrder = await newOrder.save();

        // Handle different payment gateways
        if (paymentGateway === "Razorpay") {
            const options = {
                amount: amount * 100, // paise
                currency: "INR",
                receipt: `receipt_order_${savedOrder._id}`,
            };
            const razorpayOrder = await razorpayInstance.orders.create(options);
            return res.json({ success: true, order: razorpayOrder, dbOrderId: savedOrder._id });
        } 
        
        if (paymentGateway === "Stripe") {
            const line_items = items.map((item) => ({
                price_data: {
                    currency: currency,
                    product_data: { name: item.name },
                    unit_amount: Math.round(item.price * 100) 
                },
                quantity: item.quantity
            }));

            line_items.push({
                price_data: {
                    currency: currency,
                    product_data: { name: "Delivery Charge" },
                    unit_amount: Math.round(deliveryCharge * 100)
                },
                quantity: 1
            });

            const session = await stripe.checkout.sessions.create({
                success_url: `${frontend_URL}/verify?success=true&orderId=${savedOrder._id}`,
                cancel_url: `${frontend_URL}/verify?success=false&orderId=${savedOrder._id}`,
                line_items: line_items,
                mode: 'payment',
                customer_email: address.email,
                billing_address_collection: 'required',
            });

            return res.json({ success: true, session_url: session.url });
        }

        if (paymentMethod === "COD") {
            // Clear cart for COD immediately
            await userModel.findByIdAndUpdate(userId, { cartData: {} });
            // Reduce stock
            for (const item of items) {
                await jewelleryModel.findByIdAndUpdate(item._id, { $inc: { stock: -item.quantity } });
            }
            
            // Send email notification
            const user = await userModel.findById(userId);
            if (user && user.email) {
                await sendOrderConfirmation(user.email, savedOrder._id, amount, "Order Processing (COD)");
            }

            res.json({ success: true, message: "Order Placed Successfully (COD)" });

            // Trigger Shiprocket Shipment Creation Silently
            shiprocketService.createShipment(savedOrder).then(async (shipmentData) => {
                if (shipmentData) {
                    await orderModel.findByIdAndUpdate(savedOrder._id, {
                        shipmentId: shipmentData.shipmentId,
                        shippingStatus: shipmentData.status,
                        courierName: shipmentData.courierName
                    });
                    console.log(`Shiprocket: Created shipment for COD order ${savedOrder._id}`);
                }
            }).catch(err => console.error("Shiprocket Background Error (COD):", err));

            return;
        }

        res.json({ success: false, message: "Invalid Payment Gateway" });

    } catch (error) {
        console.log("Order creation error:", error);
        // If order was already saved, mark it as failed
        if (req.body.dbOrderId || (typeof newOrder !== 'undefined' && newOrder._id)) {
            const idToUpdate = req.body.dbOrderId || newOrder._id;
            await orderModel.findByIdAndUpdate(idToUpdate, { paymentStatus: "Failed" });
        }
        res.json({ success: false, message: error.message || "Error creating order. Please try again." });
    }
};

// Verify Razorpay payment
const verifyRazorpay = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, dbOrderId, userId } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_SECRET)
            .update(body.toString())
            .digest("hex");

        if (expectedSignature === razorpay_signature) {
            const order = await orderModel.findByIdAndUpdate(dbOrderId, { 
                payment: true, 
                paymentStatus: "Success",
                paymentId: razorpay_payment_id,
                transactionId: razorpay_order_id,
                paymentGateway: "Razorpay"
            }, { new: true });
            
            await userModel.findByIdAndUpdate(userId, { cartData: {} });

            for (const item of order.items) {
                await jewelleryModel.findByIdAndUpdate(item._id, { $inc: { stock: -item.quantity } });
            }

            // Send email notification
            const user = await userModel.findById(userId);
            if (user && user.email) {
                await sendOrderConfirmation(user.email, dbOrderId, order.amount, "Paid");
            }

            res.json({ success: true, message: "Payment Verified" });

            // Trigger Shiprocket Shipment Creation Silently
            shiprocketService.createShipment(order).then(async (shipmentData) => {
                if (shipmentData) {
                    await orderModel.findByIdAndUpdate(dbOrderId, {
                        shipmentId: shipmentData.shipmentId,
                        shippingStatus: shipmentData.status,
                        courierName: shipmentData.courierName
                    });
                    console.log(`Shiprocket: Created shipment for Razorpay order ${dbOrderId}`);
                }
            }).catch(err => console.error("Shiprocket Background Error (Razorpay):", err));

        } else {
            await orderModel.findByIdAndUpdate(dbOrderId, { paymentStatus: "Failed" });
            
            // Send failure email notification
            const user = await userModel.findById(userId);
            if (user && user.email) {
                await sendPaymentFailure(user.email, dbOrderId);
            }

            res.json({ success: false, message: "Verification Failed" });
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Internal Server Error" });
    }
};

// Verify Stripe redirect
const verifyStripe = async (req, res) => {
    const { orderId, success } = req.body;
    try {
        if (success === "true") {
            const order = await orderModel.findByIdAndUpdate(orderId, { 
                payment: true,
                paymentStatus: "Success"
            }, { new: true });

            await userModel.findByIdAndUpdate(order.userId, { cartData: {} });
            for (const item of order.items) {
                await jewelleryModel.findByIdAndUpdate(item._id, { $inc: { stock: -item.quantity } });
            }

            // Send email notification
            const user = await userModel.findById(order.userId);
            if (user && user.email) {
                await sendOrderConfirmation(user.email, orderId, order.amount, "Paid");
            }

            res.json({ success: true, message: "Paid" });

            // Trigger Shiprocket Shipment Creation Silently
            shiprocketService.createShipment(order).then(async (shipmentData) => {
                if (shipmentData) {
                    await orderModel.findByIdAndUpdate(orderId, {
                        shipmentId: shipmentData.shipmentId,
                        shippingStatus: shipmentData.status,
                        courierName: shipmentData.courierName
                    });
                    console.log(`Shiprocket: Created shipment for Stripe order ${orderId}`);
                }
            }).catch(err => console.error("Shiprocket Background Error (Stripe):", err));

        } else {
            await orderModel.findByIdAndUpdate(orderId, { paymentStatus: "Failed" });
            res.json({ success: false, message: "Not Paid" });
        }
    } catch (error) {
        res.json({ success: false, message: "Error verifying Stripe" });
    }
};

// Retry Razorpay payment for existing order
const retryRazorpay = async (req, res) => {
    try {
        const { orderId } = req.body;
        const order = await orderModel.findById(orderId);

        if (!order) {
            return res.json({ success: false, message: "Order not found" });
        }

        const options = {
            amount: order.amount * 100, // paise
            currency: "INR",
            receipt: `receipt_order_${order._id}`,
        };

        const razorpayOrder = await razorpayInstance.orders.create(options);
        res.json({ success: true, order: razorpayOrder, dbOrderId: order._id });

    } catch (error) {
        console.log("Retry Razorpay error:", error);
        res.json({ success: false, message: "Error initiating retry" });
    }
};

export { createOrder, verifyRazorpay, verifyStripe, retryRazorpay };
