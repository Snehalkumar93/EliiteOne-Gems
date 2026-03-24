import supportTicketModel from "../models/supportTicketModel.js";
import sendEmail from "../config/email.js";

// User creates a new ticket
const createTicket = async (req, res) => {
    try {
        const { name, email, subject, message, category } = req.body;
        const userId = req.user?.id || req.body.userId;

        if (!userId || !name || !email || !subject || !message || !category) {
            return res.json({ success: false, message: "All fields are required" });
        }

        const newTicket = new supportTicketModel({
            userId,
            name,
            email,
            subject,
            message,
            category
        });

        await newTicket.save();

        // Send confirmation email
        const emailSubject = `Support Ticket Created: ${subject}`;
        const emailHtml = `
            <h2>Hi ${name},</h2>
            <p>We have received your support request regarding <strong>${category}</strong>.</p>
            <p>Our team is reviewing your message and will get back to you shortly.</p>
            <p><strong>Your Message:</strong><br/>${message}</p>
            <br/>
            <p>Best regards,<br/>EliteOne Gems Support</p>
        `;
        await sendEmail(email, emailSubject, emailHtml);

        res.json({ success: true, message: "Support ticket created successfully", data: newTicket });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error creating support ticket" });
    }
}

// User gets their own tickets
const getUserTickets = async (req, res) => {
    try {
        const userId = req.user?.id || req.body.userId;
        const tickets = await supportTicketModel.find({ userId }).sort({ createdAt: -1 });
        res.json({ success: true, data: tickets });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error fetching tickets" });
    }
}

// Admin gets all tickets
const getAllTickets = async (req, res) => {
    try {
        const tickets = await supportTicketModel.find({}).sort({ createdAt: -1 });
        res.json({ success: true, data: tickets });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error fetching all tickets" });
    }
}

// Admin replies to a ticket
const replyToTicket = async (req, res) => {
    try {
        const { ticketId, adminReply, status } = req.body;

        if (!ticketId || !adminReply || !status) {
            return res.json({ success: false, message: "All fields are required" });
        }

        const ticket = await supportTicketModel.findByIdAndUpdate(
            ticketId,
            { adminReply, status },
            { new: true }
        );

        if (!ticket) {
            return res.json({ success: false, message: "Ticket not found" });
        }

        // Send notification email to user
        const emailSubject = `Support Ticket Update: ${ticket.subject}`;
        const emailHtml = `
            <h2>Hi ${ticket.name},</h2>
            <p>There is an update to your recent support ticket regarding <strong>${ticket.category}</strong>.</p>
            <div style="background-color: #fdf2f8; padding: 15px; border-left: 4px solid #7c3aed; margin-bottom: 20px;">
                <p><strong>Admin Reply:</strong><br/>${adminReply}</p>
            </div>
            <p><strong>Status:</strong> ${status}</p>
            <br/>
            <p>Best regards,<br/>EliteOne Gems Support</p>
        `;
        await sendEmail(ticket.email, emailSubject, emailHtml);

        res.json({ success: true, message: "Ticket replied successfully", data: ticket });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error replying to ticket" });
    }
}

export { createTicket, getUserTickets, getAllTickets, replyToTicket };
