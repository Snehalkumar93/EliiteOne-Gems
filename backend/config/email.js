import nodemailer from 'nodemailer';

// Use ethereal email for testing purposes. It catches emails without actually sending them.
// In production, you would replace these credentials with SendGrid, Gmail, etc.
const sendEmail = async (to, subject, htmlContent) => {
    // Create transporter inside the function to ensure process.env variables are loaded
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    try {
        const info = await transporter.sendMail({
            from: `"EliteOne Gems Support" <${process.env.EMAIL_USER}>`,
            to: to,
            subject: subject,
            html: htmlContent,
        });
        console.log("Message sent: %s", info.messageId);
        return true;
    } catch (error) {
        console.error("Error sending email", error);
        return false;
    }
}

export default sendEmail;
