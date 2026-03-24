import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js"
import jewelleryModel from "../models/jewelleryModel.js";
import Stripe from "stripe";
import Razorpay from "razorpay";
import crypto from "crypto";
import shiprocketService from "../services/shiprocketService.js";
import sendEmail from "../config/email.js";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

//config variables
const currency = "inr";
const deliveryCharge = 50;
const frontend_URL = process.env.CLIENT_URL;
const cancelTimeMinutes = Math.max(1, Number(process.env.CANCEL_TIME_MINUTES) || 30);

// Helper to validate professional phone format (+CountryCodeNumber)
const validatePhone = (phone) => {
    // Basic validation: starts with + and followed by at least 10 digits
    const regex = /^\+\d{10,15}$/;
    return regex.test(phone);
}

// Placing User Order for Frontend using stripe
const placeOrder = async (req, res) => {

    try {
        if (!validatePhone(req.body.address.phone)) {
            return res.json({ success: false, message: "Please enter a valid phone number with country code." });
        }
        const newOrder = new orderModel({
            userId: req.body.userId,
            items: req.body.items,
            amount: req.body.amount,
            address: req.body.address,
            paymentGateway: "Stripe",
            paymentStatus: "Pending",
            cancelAllowedUntil: new Date(Date.now() + cancelTimeMinutes * 60 * 1000)
        })
        await newOrder.save();
        await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });

        // Reduce stock
        for (const item of req.body.items) {
            await jewelleryModel.findByIdAndUpdate(item._id, { $inc: { stock: -item.quantity } });
        }

        const line_items = req.body.items.map((item) => ({
            price_data: {
                currency: currency,
                product_data: {
                    name: item.name
                },
                unit_amount: item.price * 100 
            },
            quantity: item.quantity
        }))

        line_items.push({
            price_data: {
                currency: currency,
                product_data: {
                    name: "Delivery Charge"
                },
                unit_amount: deliveryCharge * 100
            },
            quantity: 1
        })

        const session = await stripe.checkout.sessions.create({
            success_url: `${frontend_URL}/verify?success=true&orderId=${newOrder._id}`,
            cancel_url: `${frontend_URL}/verify?success=false&orderId=${newOrder._id}`,
            line_items: line_items,
            mode: 'payment',
        });

        res.json({ success: true, session_url: session.url });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" })
    }
}

// Placing User Order for Frontend using stripe
const placeOrderCod = async (req, res) => {

    try {
        if (!validatePhone(req.body.address.phone)) {
            return res.json({ success: false, message: "Please enter a valid phone number with country code." });
        }
        const newOrder = new orderModel({
            userId: req.body.userId,
            items: req.body.items,
            amount: req.body.amount,
            address: req.body.address,
            payment: false, // Fix: COD means payment is pending until delivery
            paymentMethod: "COD",
            paymentGateway: "None",
            paymentStatus: "Pending",
            cancelAllowedUntil: new Date(Date.now() + cancelTimeMinutes * 60 * 1000)
        })
        await newOrder.save();
        await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });

        // Reduce stock
        for (const item of req.body.items) {
            await jewelleryModel.findByIdAndUpdate(item._id, { $inc: { stock: -item.quantity } });
        }


        res.json({ success: true, message: "Order Placed" });

        // Trigger Shiprocket Shipment Creation Silently
        shiprocketService.createShipment(newOrder).then(async (shipmentData) => {
            if (shipmentData) {
                await orderModel.findByIdAndUpdate(newOrder._id, {
                    shipmentId: shipmentData.shipmentId,
                    shippingStatus: shipmentData.status,
                    courierName: shipmentData.courierName
                });
            }
        }).catch(err => console.error("Shiprocket Background Error (COD):", err));

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" })
    }
}

// Listing Order for Admin panel
const listOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({});
        res.json({ success: true, data: orders })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" })
    }
}

// User Orders for Frontend
const userOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({ userId: req.body.userId }).sort({ date: -1 });
        res.json({ success: true, data: orders })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" })
    }
}

const updateStatus = async (req, res) => {
    console.log(req.body);
    try {
        await orderModel.findByIdAndUpdate(req.body.orderId, { status: req.body.status });
        res.json({ success: true, message: "Status Updated" })
    } catch (error) {
        res.json({ success: false, message: "Error" })
    }

}

const verifyOrder = async (req, res) => {
    const { orderId, success } = req.body;
    try {
        if (success === "true") {
            const order = await orderModel.findByIdAndUpdate(orderId, { payment: true, paymentStatus: "Success" });
            res.json({ success: true, message: "Paid" })

            // Trigger Shiprocket Shipment Creation Silently
            shiprocketService.createShipment(order).then(async (shipmentData) => {
                if (shipmentData) {
                    await orderModel.findByIdAndUpdate(orderId, {
                        shipmentId: shipmentData.shipmentId,
                        shippingStatus: shipmentData.status,
                        courierName: shipmentData.courierName
                    });
                }
            }).catch(err => console.error("Shiprocket Background Error (Stripe):", err));
        }
        else {
            await orderModel.findByIdAndUpdate(orderId, { paymentStatus: "Failed" });
            res.json({ success: false, message: "Not Paid" })
        }
    } catch (error) {
        res.json({ success: false, message: "Not  Verified" })
    }

}

// Cancel Order
const cancelOrder = async (req, res) => {
    try {
        const { orderId, cancellationReason } = req.body;
        const userId = req.body.userId; // From authMiddleware

        const order = await orderModel.findById(orderId);

        if (!order) {
            return res.json({ success: false, message: "Order not found" });
        }

        // Security check: ensure the order belongs to the user
        if (order.userId !== userId) {
            return res.json({ success: false, message: "Unauthorized" });
        }

        // 1. Prevent double cancellation
        if (order.status === "Cancelled") {
            return res.status(400).json({ success: false, message: "Order already cancelled" });
        }

        // 2. Block if status is Shipped or Delivered
        const restrictedStatuses = ["Shipped", "Out for delivery", "Delivered"];
        if (restrictedStatuses.includes(order.status)) {
            return res.status(400).json({ success: false, message: "Order cannot be cancelled at this stage" });
        }

        // 3. Check if current time > cancelAllowedUntil
        if (!order.cancelAllowedUntil || Date.now() > new Date(order.cancelAllowedUntil).getTime()) {
            return res.status(400).json({
                success: false,
                message: "Cancellation time expired"
            });
        }

        // Update order status atomically
        order.status = "Cancelled";
        order.cancellationReason = cancellationReason || "User requested cancellation";
        order.cancelledAt = new Date();

        // Handle refund status if payment was already completed
        if (order.paymentStatus === "Success" || order.payment === true) {
            order.refundStatus = "Pending";
        }

        await order.save();

        // Notify Admin
        const adminEmail = process.env.EMAIL_USER;
        const emailSubject = `Order Cancelled - #${order._id.toString().slice(-8).toUpperCase()}`;
        const emailHtml = `
            <h2>Order Cancellation Notification</h2>
            <p><strong>Order ID:</strong> ${order._id}</p>
            <p><strong>User ID:</strong> ${order.userId}</p>
            <p><strong>Customer Name:</strong> ${order.address.firstName} ${order.address.lastName}</p>
            <p><strong>Cancellation Reason:</strong> ${order.cancellationReason}</p>
            <p><strong>Cancelled At:</strong> ${order.cancelledAt.toLocaleString()}</p>
            <p><strong>Order Amount:</strong> ${order.amount}</p>
            <h3>Product Details:</h3>
            <ul>
                ${order.items.map(item => `<li>${item.name} x ${item.quantity}</li>`).join('')}
            </ul>
        `;
        await sendEmail(adminEmail, emailSubject, emailHtml);

        res.json({ success: true, message: "Your order has been cancelled successfully." });

    } catch (error) {
        console.log("Error in cancelOrder:", error);
        res.json({ success: false, message: "Error cancelling order" });
    }
}

export { placeOrder, listOrders, userOrders, updateStatus, verifyOrder, placeOrderCod, cancelOrder }