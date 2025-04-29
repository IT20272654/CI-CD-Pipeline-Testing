const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

// Configure email transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  tls: {
    rejectUnauthorized: false
  }
});

const sendPermissionEmail = async (userEmail, permissionData) => {
  try {
    const mailOptions = {
      from: `Access System <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: 'Door Access Permission Granted',
      html: `
        <h2>Your access permission has been approved</h2>
        <p><strong>Door Code:</strong> ${permissionData.doorCode}</p>
        <p><strong>Room:</strong> ${permissionData.roomName}</p>
        <p><strong>Location:</strong> ${permissionData.location}</p>
        <p><strong>Date:</strong> ${new Date(permissionData.date).toLocaleDateString()}</p>
        <p><strong>Access Time:</strong> ${permissionData.inTime} - ${permissionData.outTime}</p>
        <p>${permissionData.message}</p>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully to:', userEmail);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

module.exports = { sendPermissionEmail };
