const bcrypt = require('bcrypt');
const AdminUser = require('../models/AdminUser');
const Company = require('../models/Company');
const CompanyRequest = require('../models/CompanyRequest');
const Payment = require('../models/payment'); // Assuming you have a Payment model
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

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

const sendRegistrationEmail = async (email, password) => {
  try {
    const pdfPath = path.join(__dirname, '../resources/Admin-Guide-SecurePassAI.pdf');
    const pdfAttachment = fs.readFileSync(pdfPath);

    const mailOptions = {
      from: `SLT mobitel <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Registration Successful',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #2563eb;">Welcome to Our System</h2>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px;">
            <p>Your account has been successfully created!</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Password:</strong> ${password}</p>
            <p style="color: #ef4444;">Please keep your credentials secure and do not share them with anyone.</p>
          </div>
          <p style="margin-top: 20px;">Find attached our welcome documentation.</p>
        </div>
      `,
      attachments: [{
        filename: 'Admin-Guide-SecurePassAI.pdf',
        content: pdfAttachment
      }]
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending registration email:', error);
    throw error;
  }
};

// Create Company Request
const createCompanyRequest = async (req, res) => {
  const { name, address, admins, packageType } = req.body;

  // Check for required fields
  if (!name) {
    return res.status(400).json({ error: 'Company name is required' });
  }
  if (!address) {
    return res.status(400).json({ error: 'Company address is required' });
  }
  if (!admins || !Array.isArray(admins) || admins.length === 0) {
    return res.status(400).json({ error: 'At least one admin is required' });
  }
  if (!packageType) {
    return res.status(400).json({ error: 'Company package type is required' });
  }

  // Check if admins are valid
  for (const admin of admins) {
    if (!admin.firstName || !admin.lastName || !admin.email) {
      return res.status(400).json({ error: 'Admin details are incomplete' });
    }
  }

  try {
    const companyRequest = new CompanyRequest({ name, address, admins, packageType });
    const savedRequest = await companyRequest.save();
    const responseData = savedRequest.toObject ? savedRequest.toObject() : savedRequest;
    res.status(201).json({ 
      message: 'Company created successfully', 
      companyRequest: responseData 
    });
  } catch (error) {
    console.error('Error creating company request:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Fetch all company Requests
const getCompanyRequests = async (req, res) => {
  try {
    const companyRequests = await CompanyRequest.find();  // Use the correct variable name
    res.json(companyRequests);
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Fetch a companyRequest by ID
const getCompanyRequestById = async (req, res) => {
  try {
    const companyRequest = await CompanyRequest.findById(req.params.id).populate('admins', '-password');
    if (!companyRequest) {
      return res.status(404).json({ error: 'Company Request not found' });
    }
    res.json(companyRequest);
  } catch (error) {
    console.error('Error fetching company request by ID:', error);  // Better error logging
    res.status(500).json({ error: 'Server error' });
  }
};

// Update a company request
const updateCompanyRequest = async (req, res) => {
  const { name, address } = req.body;
  if (!name || !address) {
    return res.status(400).json({ error: 'Name and address are required' });
  }

  try {
    const companyRequest = await CompanyRequest.findById(req.params.id);
    if (!companyRequest) {
      return res.status(404).json({ error: 'Company Request not found' });
    }

    companyRequest.name = name;
    companyRequest.address = address;
    await companyRequest.save();
    res.json(companyRequest);
  } catch (error) {
    console.error('Error updating company request:', error);  // More detailed error logging
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete a company request
const deleteCompanyRequest = async (req, res) => {
  try {
    const companyRequest = await CompanyRequest.findById(req.params.id);
    if (!companyRequest) {
      return res.status(404).json({ error: 'Company Request not found' });
    }
    await companyRequest.deleteOne({ _id: req.params.id });
    res.json({ message: 'Company Request deleted successfully' });
  } catch (error) {
    console.error('Error deleting company request:', error);  // Detailed logging
    res.status(500).json({ error: 'Server error' });
  }
};

// Fetch all companies with their admins
const getCompanyRequestsWithAdmins = async (req, res) => {
  try {
    const companyRequests = await CompanyRequest.find().populate('admins', '-password');
    res.json(companyRequests);
  } catch (error) {
    console.error('Error fetching companies with admins:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Toggle company status
const toggleCompanyRequestStatus = async (req, res) => {
  const { id } = req.params;
  const { status, selectedAdmins } = req.body;  // Get selected admins

  if (status !== 'Approve' && status !== 'Reject') {
    return res.status(400).json({ message: 'Invalid status value' });
  }

  try {
    const companyRequest = await CompanyRequest.findById(id);

    if (!companyRequest) {
      return res.status(404).json({ message: 'Company request not found' });
    }

    if (status === 'Reject') {
      companyRequest.status = 'Rejected';
      await companyRequest.save();
      return res.status(200).json(companyRequest);
    }

    if (status === 'Approve') {
      const { name, address, packageType } = companyRequest;

      let expiredDate;
      const today = new Date();

      if (packageType === 'Premium') {
        expiredDate = new Date(today.setDate(today.getDate() + 366));  // Add 366 days
      } else if (packageType === 'Starter' || packageType === 'Essential') {
        expiredDate = new Date(today.setDate(today.getDate() + 31));  // Add 31 days
      }

      // Create the company
      const company = new Company({
        name,
        address,
        status: 'active',  // Set to active when approved
        package: packageType,
        expiredDate,
      });
      await company.save();

      // Update Payment records: link payments from the CompanyRequest to the new Company
      await Payment.updateMany(
        { companyRequestId: companyRequest._id },
        { $set: { companyId: company._id } }
      );

      const createdAdmins = [];
      for (const adminId of selectedAdmins) {
        const admin = companyRequest.admins.find(admin => admin._id.toString() === adminId);

        if (!admin) {
          console.error(`Admin with ID ${adminId} not found in company request`);
          continue; // Skip if admin is not found
        }

        const { firstName, lastName, email } = admin;
        const password = `${firstName}@1234`;  // Default password

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create AdminUser
        const adminUser = new AdminUser({
          firstName,
          lastName,
          email,
          password: hashedPassword,
          role: 'Admin',
          company: company._id,
        });

        await adminUser.save();  // Save the admin user
        company.admins.push(adminUser._id);  // Add admin to company's admin list
        createdAdmins.push(adminUser);  // Keep track of created admins
      }

      await company.save();  // Save the company with the updated admins list

      companyRequest.status = 'Approved';
      await companyRequest.save();  // Update the company request status to Approved

      // Send registration emails asynchronously for created admins
      setImmediate(async () => {
        for (const admin of createdAdmins) {
          try {
            await sendRegistrationEmail(admin.email, `${admin.firstName}@1234`);
            console.log("Email sent to:", admin.email);
          } catch (emailError) {
            console.error("Failed to send email:", emailError);
          }
        }
      });

      res.status(201).json({ company, admins: createdAdmins });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error processing company request' });  // Updated error message
  }
};

const getCompanyWithPayments = async (req, res) => {
  try {
    const { id } = req.params;
    const companyWithPayments = await Company.findById(id).populate('payments');

    if (!companyWithPayments) {
      return res.status(404).json({ message: 'Company not found' });
    }

    res.status(200).json(companyWithPayments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getCompanyWithPayments, createCompanyRequest, getCompanyRequests, getCompanyRequestById, updateCompanyRequest, deleteCompanyRequest, getCompanyRequestsWithAdmins, toggleCompanyRequestStatus };