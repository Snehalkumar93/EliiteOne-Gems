import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendOrderConfirmation = async (userEmail, orderId, amount, status) => {
    const mailOptions = {
        from: '"EliteOne Gems" <eliteonegems@gmail.com>',
        to: userEmail,
        subject: `Order Confirmation - #${orderId}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
                <h2 style="color: #333;">Thank you for your order!</h2>
                <p>Hello,</p>
                <p>Your order <b>#${orderId}</b> has been received and is currently <b>${status}</b>.</p>
                <p><b>Total Amount:</b> ₹${amount}</p>
                <p>We will notify you once your luxury items are shipped.</p>
                <br/>
                <p>Best Regards,</p>
                <p><b>EliteOne Gems Team</b></p>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Confirmation email sent to ${userEmail}`);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

const sendPaymentFailure = async (userEmail, orderId) => {
    const mailOptions = {
        from: '"EliteOne Gems" <eliteonegems@gmail.com>',
        to: userEmail,
        subject: 'Payment Failed - EliteOne Gems',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
                <h2 style="color: #ef4444;">Payment Unsuccessful</h2>
                <p>Hello,</p>
                <p>We were unable to process the payment for your order <b>#${orderId}</b>.</p>
                <p>Please try again or contact our support if you face any issues.</p>
                <br/>
                <p>Best Regards,</p>
                <p><b>EliteOne Gems Team</b></p>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Error sending failure email:', error);
    }
};

export { sendOrderConfirmation, sendPaymentFailure };
