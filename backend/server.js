import express  from "express"
import cors from 'cors'
import { connectDB } from "./config/db.js"
import userRouter from "./routes/userRoute.js"
import jewelleryRouter from "./routes/jewelleryRoute.js"
import 'dotenv/config'
import cartRouter from "./routes/cartRoute.js"
import orderRouter from "./routes/orderRoute.js"
import supportRouter from "./routes/supportRoute.js"
import reviewRouter from "./routes/reviewRoute.js"
import adminRouter from "./routes/adminRoute.js"
import paymentRouter from "./routes/paymentRoute.js"
import shippingRouter from "./routes/shippingRoute.js"
import couponRouter from "./routes/couponRoute.js"
import rateLimit from 'express-rate-limit'
import orderModel from "./models/orderModel.js"
import shiprocketService from "./services/shiprocketService.js"

// app config
const app = express()
const port = process.env.PORT || 4000;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10000 // limit each IP to 10000 requests per windowMs
});

// middlewares
app.use(express.json())

// CORS — allow CLIENT_URL and optional ADMIN_URL (comma-separated or single)
const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.ADMIN_URL,
  "http://localhost:5173",
  "http://localhost:5174",
].filter(Boolean); // remove undefined/empty values

console.log("[SERVER] Allowed CORS Origins:", allowedOrigins);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || origin.includes("vercel.app") || origin.includes("onrender.com")) {
      return callback(null, true);
    }
    console.warn(`[CORS_WARNING] Request from unauthorized origin: ${origin}`);
    return callback(new Error(`CORS not allowed for origin: ${origin}`));
  },
  credentials: true,
}));

app.use(limiter)

// db connection
connectDB()

// api endpoints
app.use("/api/user", userRouter)
app.use("/api/jewellery", jewelleryRouter)
app.use("/api/cart", cartRouter)
app.use("/api/order",orderRouter)
app.use("/api/support", supportRouter)
app.use("/api/review", reviewRouter)
app.use("/api/admin", adminRouter)
app.use("/api/payment", paymentRouter)
app.use("/api/shipping", shippingRouter)
app.use("/api/coupon", couponRouter)

app.get("/", (req, res) => {
    res.send("API Working")
  });

app.listen(port, () => console.log(`Server started on http://localhost:${port}`))

// Background Sync for Shipping Status (Every 6 hours)
setInterval(async () => {
  try {
    const ordersToSync = await orderModel.find({
      shipmentId: { $ne: "" },
      shippingStatus: { $nin: ["Delivered", "Canceled"] }
    });

    console.log(`Background Sync: Checking ${ordersToSync.length} orders...`);

    for (const order of ordersToSync) {
      const trackingData = await shiprocketService.getTrackingInfo(order.shipmentId);
      if (trackingData && trackingData.tracking_data?.shipment_track?.[0]) {
        const newStatus = trackingData.tracking_data.shipment_track[0].current_status;
        const courier = trackingData.tracking_data.shipment_track[0].courier_name;
        const trackingId = trackingData.tracking_data.shipment_track[0].tracking_number;

        if (newStatus !== order.shippingStatus) {
           await orderModel.findByIdAndUpdate(order._id, {
             shippingStatus: newStatus,
             courierName: courier,
             trackingId: trackingId
           });
           console.log(`Updated Order ${order._id} status to ${newStatus}`);
        }
      }
    }
  } catch (error) {
    console.error("Background Shipping Sync Error:", error);
  }
}, 6 * 60 * 60 * 1000); 