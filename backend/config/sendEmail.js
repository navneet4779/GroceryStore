

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config(); // Load environment variables

if (!process.env.SMTP_HOST || !process.env.SMTP_PORT || !process.env.SMTP_USER || !process.env.SMTP_PASS || !process.env.SMTP_SENDER_EMAIL) {
    console.error(
        "FATAL ERROR: One or more Brevo SMTP environment variables are missing.\n" +
        "Please check: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SENDER_EMAIL"
    );

}

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10),
    secure: parseInt(process.env.SMTP_PORT, 10) === 465, // true for 465, false for 587 (which uses STARTTLS)
    auth: {
        user: process.env.SMTP_USER, // Your Brevo login email
        pass: process.env.SMTP_PASS, // Your Brevo SMTP Key
    },

});
console.log("Brevo SMTP transporter configured.");
/**
 * Sends an email using Brevo SMTP via Nodemailer.
 * @param {object} mailDetails - Details for the email.
 * @param {string|string[]} mailDetails.sendTo - Recipient's email address or an array of addresses.
 * @param {string} mailDetails.subject - Subject of the email.
 * @param {string} mailDetails.html - HTML content of the email.
 * @param {string} [mailDetails.text] - Optional plain text content.
 * @returns {Promise<object|null>} Nodemailer info object on success, null on failure.
 */
const sendEmailWithBrevo = async ({ sendTo, subject, html, text }) => {
    if (!transporter.options.host) { // Check if transporter was initialized (envs were present)
        console.error("Brevo SMTP transporter is not configured. Cannot send email.");
        return null;
    }

    try {
        const mailOptions = {
            from: process.env.SMTP_SENDER_EMAIL, // Verified sender from your Brevo account
            to: Array.isArray(sendTo) ? sendTo.join(', ') : sendTo, // Nodemailer handles arrays or comma-separated strings
            subject: subject,
            html: html,
            ...(text && { text: text }), // Add text version if provided
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`Email sent successfully via Brevo to ${sendTo}. Message ID: ${info.messageId}`);
        return info;
    } catch (error) {
        console.error(`Error sending email via Brevo to ${sendTo}:`, error);
        // Consider more specific error handling or re-throwing if needed upstream
        return null; // Or return { success: false, error: error.message } for the caller to handle
    }
};

export default sendEmailWithBrevo;