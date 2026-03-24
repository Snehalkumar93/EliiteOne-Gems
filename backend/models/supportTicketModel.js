import mongoose from "mongoose";

const supportTicketSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    category: { 
        type: String, 
        required: true,
        enum: ["Order Issue", "Payment Issue", "Product Question", "Custom Jewellery", "Other"],
        default: "Other"
    },
    status: { 
        type: String, 
        default: "open",
        enum: ["open", "replied", "closed"]
    },
    adminReply: { type: String, default: "" },
}, { timestamps: true });

const supportTicketModel = mongoose.models.supportTicket || mongoose.model("supportTicket", supportTicketSchema);

export default supportTicketModel;
