import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    userId: {type:String,required:true},
    items: { type: Array, required:true},
    amount: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    address:{type:Object,required:true},
    status: {type:String,default:"Order Processing"},
    date: {type:Date,default:Date.now()},
    payment:{type:Boolean,default:false},
    paymentMethod: {type:String, default:"COD"},
    paymentStatus: {type:String, default:"Pending"},
    paymentId: {type:String, default:""},
    transactionId: {type:String, default:""},
    paymentGateway: {type:String, default:"None"},
    shipmentId: {type:String, default:""},
    trackingId: {type:String, default:""},
    courierName: {type:String, default:""},
    shippingStatus: {type:String, default:"Pending"},
    shippingLabelUrl: {type:String, default:""},
    cancellationReason: {type:String, default:""},
    cancelledAt: {type:Date},
    cancelAllowedUntil: {type:Date},
    refundStatus: {type:String, default:"None"}
})

const orderModel = mongoose.models.order || mongoose.model("order", orderSchema);
export default orderModel;